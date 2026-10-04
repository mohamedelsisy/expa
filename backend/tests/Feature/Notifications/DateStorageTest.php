<?php

namespace Tests\Feature\Notifications;

use App\Domains\Documents\Models\DocumentType;
use App\Domains\Documents\Models\UserDocument;
use App\Events\ReminderDue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

/** Date columns must be stored as plain `Y-m-d` on every engine so boundary-day comparisons behave identically. */
class DateStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_document_dates_are_stored_date_only(): void
    {
        $type = DocumentType::create(['key' => 'x']);
        $doc = UserDocument::make(['document_type_id' => $type->id, 'issue_date' => now()->subYear(), 'expiry_date' => now()->addDays(90)]);
        $doc->user_id = User::factory()->create()->id;
        $doc->save();

        $raw = DB::table('user_documents')->first();
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $raw->expiry_date);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $raw->issue_date);

        // boundary day is included by an inclusive date-string comparison
        $this->assertSame(1, UserDocument::where('expiry_date', '<=', now()->addDays(90)->toDateString())->count());
    }

    public function test_reminder_listener_is_registered_exactly_once(): void
    {
        $listeners = Event::getListeners(ReminderDue::class);
        $this->assertCount(1, $listeners);
    }
}
