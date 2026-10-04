<?php

namespace Tests\Feature\Notifications;

use App\Domains\Documents\Models\UserDocument;
use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Reminders\Models\Reminder;
use App\Enums\UserStatus;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RemindersTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DocumentTypeSeeder::class);
        $this->user = User::factory()->create();
        app(ConsentService::class)->record($this->user, ['document_storage' => true]);
        $this->actingAs($this->user, 'sanctum');
    }

    private function doc(?int $daysToExpiry, array $over = []): array
    {
        return $this->postJson('/api/v1/my-documents', array_merge([
            'type' => 'residence_permit', 'label' => 'Permit',
            'expiry_date' => $daysToExpiry === null ? null : now()->addDays($daysToExpiry)->toDateString(),
        ], $over))->assertCreated()->json('data');
    }

    private function rows(int $docId, ?string $status = null): array
    {
        return Reminder::where('user_document_id', $docId)->when($status, fn ($q) => $q->where('status', $status))
            ->orderBy('offset_days', 'desc')->get()->map(fn ($r) => [$r->kind, $r->offset_days, $r->remind_on->toDateString(), $r->status])->all();
    }

    private function sendDue(): void
    {
        $this->artisan('expa:send-reminders')->assertSuccessful();
    }

    // ---- scheduling ---------------------------------------------------------------------------

    public function test_creates_default_schedule_with_correct_dates_and_an_expired_notice(): void
    {
        $d = $this->doc(200);
        $expiry = now()->addDays(200);

        $this->assertSame([
            ['before', 90, $expiry->copy()->subDays(90)->toDateString(), 'pending'],
            ['before', 60, $expiry->copy()->subDays(60)->toDateString(), 'pending'],
            ['before', 30, $expiry->copy()->subDays(30)->toDateString(), 'pending'],
            ['before', 14, $expiry->copy()->subDays(14)->toDateString(), 'pending'],
            ['before', 7, $expiry->copy()->subDays(7)->toDateString(), 'pending'],
            ['expired', -1, $expiry->copy()->addDay()->toDateString(), 'pending'],
        ], $this->rows($d['id']));
        $this->assertCount(6, $d['upcoming_reminders']);
        $this->assertSame(90, $d['upcoming_reminders'][0]['offset_days']); // earliest first
    }

    public function test_past_offsets_are_not_backfilled(): void
    {
        $d = $this->doc(20);
        $this->assertSame([14, 7, -1], array_column($this->rows($d['id']), 1));
    }

    public function test_no_schedule_for_expired_documents_or_documents_without_expiry(): void
    {
        $this->assertSame([], $this->rows($this->doc(-10)['id']));
        $this->assertSame([], $this->rows($this->doc(null)['id']));
    }

    public function test_custom_offsets_and_disable_enable(): void
    {
        $d = $this->doc(100, ['reminder_offsets' => [45, 3]]);
        $this->assertSame([45, 3, -1], array_column($this->rows($d['id']), 1));

        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['reminders_enabled' => false])->assertOk();
        $this->assertSame([], $this->rows($d['id']));

        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['reminders_enabled' => true])->assertOk()->assertJsonCount(3, 'data.upcoming_reminders');
    }

    public function test_offset_change_recomputes_pending_but_keeps_history(): void
    {
        $d = $this->doc(100, ['reminder_offsets' => [90, 30]]);
        Reminder::where('user_document_id', $d['id'])->where('offset_days', 90)->update(['status' => 'dispatched']);

        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['reminder_offsets' => [90, 30, 7]])->assertOk();

        $rows = collect($this->rows($d['id']));
        $this->assertSame('dispatched', $rows->firstWhere(1, 90)[3]); // not resurrected as pending
        $this->assertSame(1, Reminder::where('user_document_id', $d['id'])->where('offset_days', 90)->count());
        $this->assertNotNull($rows->firstWhere(1, 7));
    }

    public function test_renewal_starts_a_fresh_cycle(): void
    {
        $d = $this->doc(100, ['reminder_offsets' => [30]]);
        Reminder::where('user_document_id', $d['id'])->where('offset_days', 30)->update(['status' => 'dispatched']);

        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['expiry_date' => now()->addDays(500)->toDateString()])->assertOk();

        $pending = Reminder::where('user_document_id', $d['id'])->where('offset_days', 30)->first();
        $this->assertSame('pending', $pending->status);
        $this->assertSame(now()->addDays(470)->toDateString(), $pending->remind_on->toDateString());
    }

    public function test_updating_unrelated_fields_does_not_touch_the_schedule(): void
    {
        $d = $this->doc(100);
        $ids = Reminder::where('user_document_id', $d['id'])->pluck('id')->all();

        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['label' => 'Renamed', 'notes' => 'x'])->assertOk();

        $this->assertSame($ids, Reminder::where('user_document_id', $d['id'])->pluck('id')->all());
    }

    public function test_deleting_a_document_removes_its_reminders(): void
    {
        $d = $this->doc(100);
        $this->deleteJson("/api/v1/my-documents/{$d['id']}")->assertNoContent();
        $this->assertSame(0, Reminder::count());
    }

    // ---- dispatching --------------------------------------------------------------------------

    public function test_reminder_is_sent_on_the_due_day_exactly_once(): void
    {
        $d = $this->doc(100, ['reminder_offsets' => [30]]);
        $this->travelTo(now()->addDays(69)->setTime(9, 0));
        $this->sendDue();
        $this->assertSame(0, UserNotification::count()); // day before: nothing

        $this->travelTo(now()->addDay());
        $this->sendDue();
        $this->sendDue(); // idempotent: second run, same day
        $this->assertSame(1, UserNotification::count());

        $n = UserNotification::first();
        $this->assertSame('document_reminder', $n->type);
        $this->assertSame(['document_id' => $d['id'], 'name' => 'Permit', 'days' => 30, 'expiry_date' => now()->addDays(30)->toDateString()], $n->data);
        $this->assertSame('dispatched', Reminder::where('offset_days', 30)->value('status'));

        $this->travelTo(now()->addDays(2));
        $this->sendDue();
        $this->assertSame(1, UserNotification::count());
    }

    public function test_after_scheduler_downtime_only_the_most_relevant_reminder_is_sent(): void
    {
        $d = $this->doc(100, ['reminder_offsets' => [60, 30, 7]]);
        $this->travelTo(now()->addDays(95)->setTime(9, 0)); // 5 days before expiry: 60, 30 and 7 all overdue

        $this->sendDue();

        $this->assertSame(1, UserNotification::count());
        $this->assertSame(5, UserNotification::first()->data['days']); // 5 days actually remain
        $this->assertSame(['dispatched'], Reminder::where('kind', 'before')->where('offset_days', 7)->pluck('status')->all());
        $this->assertSame(['skipped', 'skipped'], Reminder::where('kind', 'before')->whereIn('offset_days', [60, 30])->pluck('status')->all());
        $this->assertCount(1, $this->rows($d['id'], 'pending')); // the expired notice remains
    }

    public function test_expired_notice_is_sent_the_day_after_expiry(): void
    {
        $this->doc(10, ['reminder_offsets' => [7]]);
        $this->travelTo(now()->addDays(11)->setTime(9, 0));
        $this->sendDue();

        $types = UserNotification::orderBy('created_at')->pluck('type')->all();
        $this->assertSame(['document_expired'], $types); // the 7-day reminder was due earlier but is superseded
        $this->assertSame(0, UserNotification::first()->data['days']);
    }

    public function test_nothing_is_sent_when_circumstances_changed_since_scheduling(): void
    {
        $this->doc(10, ['reminder_offsets' => [3]]);
        $this->travelTo(now()->addDays(7)->setTime(9, 0));

        // storage consent withdrawn
        app(ConsentService::class)->record($this->user, ['document_storage' => false]);
        $this->sendDue();
        $this->assertSame(0, UserNotification::count());
        $this->assertSame('dispatched', Reminder::where('offset_days', 3)->value('status')); // not retried forever

    }

    public function test_suspended_users_and_disabled_documents_get_no_notification(): void
    {
        $this->doc(10, ['reminder_offsets' => [3], 'label' => 'A']);
        $b = $this->doc(10, ['reminder_offsets' => [3], 'label' => 'B', 'type' => 'passport']);

        UserDocument::whereKey($b['id'])->update(['reminders_enabled' => false]); // disabled without going through the observer
        $this->user->forceFill(['status' => UserStatus::Suspended])->save();
        $this->travelTo(now()->addDays(7)->setTime(9, 0));

        $this->sendDue();
        $this->assertSame(0, UserNotification::count());
    }

    public function test_command_reports_dispatch_count(): void
    {
        $this->doc(10, ['reminder_offsets' => [3]]);
        $this->doc(10, ['reminder_offsets' => [3], 'type' => 'passport']);
        $this->travelTo(now()->addDays(7)->setTime(9, 0));

        $this->artisan('expa:send-reminders')->expectsOutputToContain('Dispatched 2 reminder(s)')->assertSuccessful();
    }

    public function test_reminders_are_scheduled_daily_in_the_console_kernel(): void
    {
        $events = collect(app(Schedule::class)->events())->map(fn ($e) => $e->command);
        $this->assertTrue($events->contains(fn ($c) => str_contains((string) $c, 'expa:send-reminders')));
        $this->assertTrue($events->contains(fn ($c) => str_contains((string) $c, 'expa:publish-scheduled')));
    }
}
