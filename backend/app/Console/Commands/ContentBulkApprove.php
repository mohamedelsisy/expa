<?php

namespace App\Console\Commands;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Content\Policies\ContentPolicy;
use App\Domains\Content\Services\PublishGuard;
use App\Enums\ContentStatus;
use App\Events\ContentChanged;
use App\Models\User;
use App\Support\Audit\AuditMute;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Throwable;

/**
 * Owner-run bulk review: moves content from "review" to "published" in the name of ONE named admin.
 *
 * It never bypasses a rule. Every item goes through the same policy as the admin screen (review + publish
 * permissions, four-eyes: the approver may not be the author or last editor), the same transition guard and the
 * same PublishGuard (official source host, required languages). Items that fail are skipped and counted, never
 * forced. Nothing runs by itself: no scheduler entry, an explicit --by admin and a confirmation are required.
 */
class ContentBulkApprove extends Command
{
    /** Groups the owner can approve in one go; a single type (snake_case) is accepted too. */
    public const GROUPS = [
        'registry' => ['government_office', 'university', 'study_program', 'tax_table'],
        'patente' => ['patente_category'],
        'guides' => ['guide', 'government_service', 'appointment_guide', 'housing_rule', 'city_profile'],
        'learning' => ['italian_lesson', 'italian_vocabulary', 'italian_exercise'],
    ];

    protected $signature = 'expa:content-approve
        {what : registry | patente | guides | learning | all | one type such as university}
        {--by= : e-mail of the approving admin (required; recorded on every item and in the audit log)}
        {--dry-run : count what would be published, change nothing}
        {--limit= : approve at most N items per type}
        {--yes : do not ask for confirmation}';

    protected $description = 'Approve and publish content that is in review, in the name of one named admin (four-eyes, permissions and publish checks still apply)';

    public function handle(): int
    {
        $approver = $this->approver();
        if (! $approver) {
            return self::FAILURE;
        }
        $classes = $this->classesFor((string) $this->argument('what'));
        if ($classes === null) {
            $this->error('Unknown group or type. Use: '.implode(', ', array_keys(self::GROUPS)).', all, or a single type (see expa:content-readiness).');

            return self::FAILURE;
        }
        $dry = (bool) $this->option('dry-run');
        $limit = $this->option('limit') !== null ? max(1, (int) $this->option('limit')) : null;

        $this->line("Approver: {$approver->email} (id {$approver->id}). Items that are already published are never touched.");
        $preview = array_map(fn ($class) => $this->process($class, $approver, true, $limit), $classes);
        $this->report($preview, true);
        if ($dry) {
            $this->info('Dry run: nothing was changed.');

            return self::SUCCESS;
        }
        if (array_sum(array_column($preview, 'published')) === 0) {
            $this->warn('Nothing can be published.');

            return self::SUCCESS;
        }
        if (! $this->option('yes') && ! $this->confirm('Publish the items above in the name of '.$approver->email.'?')) {
            $this->warn('Cancelled. Nothing was changed.');

            return self::SUCCESS;
        }

        // Each transition dispatches queued reindex jobs; thousands of them would flood the queue. Listeners are dropped for
        // this process only and the search + AI indexes are rebuilt once at the end.
        Event::forget(ContentChanged::class);
        AuditMute::on();
        try {
            $rows = array_map(fn ($class) => $this->process($class, $approver, false, $limit), $classes);
        } finally {
            AuditMute::off();
        }
        $this->report($rows, false);

        $published = array_sum(array_column($rows, 'published'));
        $skipped = array_sum(array_column($rows, 'skipped'));
        if ($published > 0) {
            app(AuditLogger::class)->log('content.bulk_approved', null, [
                'what' => $this->argument('what'), 'approver' => $approver->email,
                'types' => array_column($rows, 'published', 'type'), 'skipped' => $skipped,
            ], $approver);
            $this->info('Rebuilding the search and AI indexes once...');
            $this->callSilently('expa:search-reindex');
            $this->callSilently('expa:ai-reindex');
        }
        $this->info("Done: {$published} published, {$skipped} skipped.");

        return self::SUCCESS;
    }

    private function report(array $rows, bool $preview): void
    {
        $this->table(['type', $preview ? 'would publish' : 'published', 'skipped', 'main reasons for skipping'], array_map(
            fn ($r) => [$r['type'], $r['published'], $r['skipped'], $r['reasons']], $rows,
        ));
    }

    /** @param  class-string<Model>  $class */
    private function process(string $class, User $approver, bool $dry, ?int $limit): array
    {
        $type = Str::snake(class_basename($class));
        $published = $skipped = 0;
        $reasons = [];
        $guard = app(PublishGuard::class);
        $gate = Gate::forUser($approver);

        $query = $class::query()->where('status', ContentStatus::Review->value)->orderBy('id');
        $remaining = $limit;
        // Chunk by id: published rows leave the "review" set while we iterate.
        $query->chunkById(200, function ($items) use (&$published, &$skipped, &$reasons, &$remaining, $dry, $guard, $gate, $approver) {
            foreach ($items as $item) {
                if ($remaining !== null && $published >= $remaining) {
                    return false;
                }
                $why = $this->blocker($item, $approver, $gate, $guard);
                if ($why !== null) {
                    $skipped++;
                    $reasons[$why] = ($reasons[$why] ?? 0) + 1;

                    continue;
                }
                if ($dry) {
                    $published++;

                    continue;
                }
                try {
                    $item->transitionTo(ContentStatus::Approved);
                    $item->transitionTo(ContentStatus::Published);
                    $published++;
                } catch (Throwable $e) {
                    $skipped++;
                    $key = Str::limit($e->getMessage(), 60, '');
                    $reasons[$key] = ($reasons[$key] ?? 0) + 1;
                }
            }

            return null;
        });

        arsort($reasons);
        $top = collect($reasons)->take(2)->map(fn ($n, $why) => "$why ($n)")->implode('; ');

        return ['type' => $type, 'published' => $published, 'skipped' => $skipped, 'reasons' => $top];
    }

    /** Null when the item may go live, otherwise the reason it is skipped. */
    private function blocker(Model $item, User $approver, $gate, PublishGuard $guard): ?string
    {
        // Four-eyes is checked here explicitly: the super_admin bypass (Gate::before) would otherwise switch it off.
        $policy = Gate::getPolicyFor($item);
        if (config('content.four_eyes') && $policy instanceof ContentPolicy && $policy->violatesFourEyes($approver, $item, ContentStatus::Approved)) {
            return 'approver is the author or last editor (four-eyes)';
        }
        if (! $gate->allows('transition', [$item, ContentStatus::Approved])) {
            return 'approver not allowed (permission or four-eyes)';
        }
        if (! $gate->allows('transition', [$item, ContentStatus::Published])) {
            return 'approver may not publish this type';
        }
        $problems = $guard->problems($item);
        if (! $problems) {
            return null;
        }
        $first = reset($problems);

        return 'publish check: '.(is_array($first) ? trim(($first['code'] ?? 'failed').' '.($first['locale'] ?? '')) : (string) $first);
    }

    private function approver(): ?User
    {
        $email = (string) $this->option('by');
        if ($email === '') {
            $this->error('--by=<admin e-mail> is required: the approval is recorded in that admin\'s name.');

            return null;
        }
        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->error("No user with e-mail {$email}.");

            return null;
        }
        // super_admin holds no stored permissions (Gate::before bypass), so it is accepted by role; everyone else needs a publish permission.
        if (! $user->isSuperAdmin() && ! $user->hasPermission('guides.publish')) {
            $this->error("{$email} cannot publish content. Make that user an admin first (php artisan expa:make-admin {$email}).");

            return null;
        }

        return $user;
    }

    /** @return list<class-string<Model>>|null */
    private function classesFor(string $what): ?array
    {
        $byType = collect(config('content.models'))->mapWithKeys(fn (string $c) => [Str::snake(class_basename($c)) => $c]);
        $types = $what === 'all' ? collect(self::GROUPS)->flatten()->all() : (self::GROUPS[$what] ?? (isset($byType[$what]) ? [$what] : null));

        return $types === null ? null : array_values(array_filter(array_map(fn ($t) => $byType[$t] ?? null, $types)));
    }
}
