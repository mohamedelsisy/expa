<?php

namespace Tests\Feature;

use App\Console\Commands\ContentBulkApprove;
use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Study\Models\University;
use App\Enums\ContentStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * expa:content-approve publishes review content in the name of ONE admin, through the same policy and publish checks
 * as the admin screen. It must never force an item through, never run without a named admin, and never touch live rows.
 */
class ContentBulkApproveTest extends TestCase
{
    use RefreshDatabase;

    private const SOURCE = [
        'source_name' => 'Fixture registry', 'source_url' => 'https://www.mur.gov.it/fixture', 'source_type' => 'official',
        'last_verified_at' => '2026-10-11',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function admin(string $email = 'owner@expa.test'): User
    {
        $u = User::factory()->create(['email' => $email]);
        $u->syncRoleKeys(['admin']);

        return $u;
    }

    private function university(string $slug, array $over = [], bool $translated = true): University
    {
        $u = tap((new University)->forceFill([
            'slug' => $slug, 'kind' => 'public', 'source_id' => "fixture:$slug",
        ] + $over + ['status' => ContentStatus::Review->value] + self::SOURCE))->save();
        if ($translated) {
            $u->setTranslations(['it' => ['name' => "Università $slug", 'summary' => 'Ateneo']]);
        }

        return $u->fresh();
    }

    public function test_it_requires_a_named_admin(): void
    {
        $this->university('a');

        $this->artisan('expa:content-approve', ['what' => 'university', '--yes' => true])->assertFailed();
        $this->artisan('expa:content-approve', ['what' => 'university', '--by' => 'nobody@expa.test', '--yes' => true])->assertFailed();
        $this->assertSame('review', University::first()->status->value);
    }

    public function test_a_plain_user_cannot_approve(): void
    {
        $this->university('a');
        User::factory()->create(['email' => 'user@expa.test']);

        $this->artisan('expa:content-approve', ['what' => 'university', '--by' => 'user@expa.test', '--yes' => true])->assertFailed();
        $this->assertSame('review', University::first()->status->value);
    }

    public function test_dry_run_changes_nothing(): void
    {
        $this->admin();
        $this->university('a');

        $this->artisan('expa:content-approve', ['what' => 'registry', '--by' => 'owner@expa.test', '--dry-run' => true])
            ->expectsOutputToContain('would publish')->assertSuccessful();
        $this->assertSame('review', University::first()->status->value);
        $this->assertSame(0, AuditLog::where('action', 'content.bulk_approved')->count());
    }

    public function test_it_publishes_review_items_in_the_name_of_the_admin_and_writes_one_summary_audit_entry(): void
    {
        $admin = $this->admin();
        $this->university('a');
        $this->university('b');

        $this->artisan('expa:content-approve', ['what' => 'university', '--by' => 'owner@expa.test', '--yes' => true])
            ->expectsOutputToContain('2 published')->assertSuccessful();

        $this->assertSame(2, University::where('status', 'published')->count());
        $this->assertNotNull(University::first()->published_at);
        $audit = AuditLog::where('action', 'content.bulk_approved')->get();
        $this->assertCount(1, $audit);
        $this->assertSame($admin->id, $audit->first()->actor_id);
        $this->assertSame(0, AuditLog::where('action', 'content.status_changed')->count(), 'no per-row audit noise');
    }

    public function test_items_failing_the_publish_checks_are_skipped_not_forced(): void
    {
        $this->admin();
        $this->university('ok');
        $this->university('no-text', [], translated: false);
        $this->university('bad-host', ['source_url' => 'https://example.com/not-official']);

        $this->artisan('expa:content-approve', ['what' => 'university', '--by' => 'owner@expa.test', '--yes' => true])
            ->expectsOutputToContain('1 published, 2 skipped')->assertSuccessful();

        $this->assertSame(['published'], University::where('slug', 'ok')->get()->map->status->map->value->all());
        $this->assertSame('review', University::where('slug', 'no-text')->first()->status->value);
        $this->assertSame('review', University::where('slug', 'bad-host')->first()->status->value);
    }

    public function test_four_eyes_the_approver_cannot_approve_their_own_work(): void
    {
        $admin = $this->admin();
        $mine = $this->university('mine', ['created_by' => $admin->id]);
        $theirs = $this->university('theirs', ['created_by' => $this->admin('other@expa.test')->id]);

        $this->artisan('expa:content-approve', ['what' => 'university', '--by' => 'owner@expa.test', '--yes' => true])->assertSuccessful();

        $this->assertSame('review', $mine->fresh()->status->value);
        $this->assertSame('published', $theirs->fresh()->status->value);
    }

    public function test_already_published_and_draft_items_are_untouched_and_limit_is_respected(): void
    {
        $this->admin();
        $draft = $this->university('draft', ['status' => ContentStatus::Draft->value]);
        $live = GovernmentOffice::factory()->published()->create(['slug' => 'live']);
        $this->university('r1');
        $this->university('r2');
        $this->university('r3');

        $this->artisan('expa:content-approve', ['what' => 'university', '--by' => 'owner@expa.test', '--yes' => true, '--limit' => 2])->assertSuccessful();

        $this->assertSame(2, University::where('status', 'published')->count());
        $this->assertSame('draft', $draft->fresh()->status->value);
        $this->assertSame('published', $live->fresh()->status->value);
    }

    public function test_a_running_command_without_confirmation_changes_nothing(): void
    {
        $this->admin();
        $this->university('a');

        $this->artisan('expa:content-approve', ['what' => 'university', '--by' => 'owner@expa.test'])
            ->expectsConfirmation('Publish the items above in the name of owner@expa.test?', 'no')->assertSuccessful();
        $this->assertSame('review', University::first()->status->value);
    }

    public function test_every_group_runs_against_the_real_schema(): void
    {
        $this->admin();
        $this->university('a');

        // 'all' touches every content type the owner can approve; a missing column or bad query would throw here
        $this->artisan('expa:content-approve', ['what' => 'all', '--by' => 'owner@expa.test', '--dry-run' => true])
            ->expectsOutputToContain('university')->expectsOutputToContain('study_program')->expectsOutputToContain('italian_exercise')->assertSuccessful();
        foreach (array_keys(ContentBulkApprove::GROUPS) as $group) {
            $this->artisan('expa:content-approve', ['what' => $group, '--by' => 'owner@expa.test', '--dry-run' => true])->assertSuccessful();
        }
    }

    public function test_unknown_group_is_refused(): void
    {
        $this->admin();
        $this->artisan('expa:content-approve', ['what' => 'everything-else', '--by' => 'owner@expa.test', '--yes' => true])->assertFailed();
    }
}
