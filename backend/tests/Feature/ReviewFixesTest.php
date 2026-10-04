<?php

namespace Tests\Feature;

use App\Domains\Documents\Models\DocumentAttachment;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\LessonProgress;
use App\Domains\Learning\Services\DailyPlanService;
use App\Domains\Learning\Services\ProgressService;
use App\Domains\Notifications\Contracts\PushSender;
use App\Domains\Notifications\Models\DeviceToken;
use App\Domains\Notifications\Services\NotificationService;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\Reminders\Models\Reminder;
use App\Domains\Reminders\Services\ReminderDispatcher;
use App\Domains\Search\Models\SearchDocument;
use App\Domains\Search\Services\SearchIndexer;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\Support\JobFixtures;
use Tests\TestCase;

/** Regression tests for the independent review's confirmed findings. */
class ReviewFixesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_c2_learner_gets_c1_material_not_a0(): void
    {
        foreach (['a0', 'c1'] as $level) {
            ItalianLesson::factory()->published()->of($level, 'vocabulary')->create(['slug' => "v-$level"]);
        }
        $u = User::factory()->create();
        app(ConsentService::class)->record($u, ['profile_personalization' => true]);
        $u->profile()->create(['italian_level' => 'c2']);
        $this->actingAs($u, 'sanctum');

        $this->assertSame('c1', app(DailyPlanService::class)->level($u->fresh()));
        $this->getJson('/api/v1/italian/daily')->assertJsonPath('data.slots.0.lesson.slug', 'v-c1');
    }

    public function test_the_dispatcher_handles_many_due_documents_in_chunks_with_identical_results(): void
    {
        $this->seed(DocumentTypeSeeder::class);
        $u = User::factory()->create();
        app(ConsentService::class)->record($u, ['document_storage' => true]);
        $this->actingAs($u, 'sanctum');

        $typeId = DocumentType::value('id');
        foreach (range(1, 450) as $i) { // > 2 chunks of 200
            DB::table('user_documents')->insert(['user_id' => $u->id, 'document_type_id' => $typeId, 'expiry_date' => now()->addDays(10)->toDateString(), 'reminders_enabled' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (UserDocument::all() as $doc) {
            foreach ([7, 3] as $off) {
                $r = new Reminder(['kind' => 'before', 'offset_days' => $off, 'remind_on' => now()->subDay()->toDateString(), 'status' => 'pending']);
                $r->user_id = $u->id;
                $r->user_document_id = $doc->id;
                $r->save();
            }
        }

        $this->assertSame(450, app(ReminderDispatcher::class)->dispatchDue());
        $this->assertSame(450, Reminder::where('status', 'dispatched')->count());
        $this->assertSame(450, Reminder::where('status', 'skipped')->count()); // the older offset of each document
        $this->assertSame(0, app(ReminderDispatcher::class)->dispatchDue());     // idempotent
    }

    public function test_search_job_pruning_uses_a_subquery_and_only_removes_dead_jobs(): void
    {
        $s = (new class
        {
            use JobFixtures;

            public function make()
            {
                return $this->source();
            }
        })->make();
        $mk = function (string $id, string $status) use ($s) {
            $j = new JobListing(['title' => "T $id", 'company' => 'C', 'description' => 'Descrizione abbastanza lunga.', 'apply_url' => 'https://c.example.test/'.$id, 'remote_mode' => 'onsite', 'employment_type' => 'full_time', 'category' => 'tech', 'published_at' => now()->subDay(), 'status' => $status]);
            $j->job_source_id = $s->id;
            $j->external_id = $id;
            $j->dedupe_hash = sha1($id);
            $j->content_hash = sha1($id.'c');
            $j->save();
            SearchDocument::create(['type' => 'job', 'item_id' => $j->id, 'title' => $id, 'search_title' => $id, 'search_text' => $id]);

            return $j;
        };
        $live = $mk('live', 'published');
        $mk('gone', 'expired');

        $this->assertSame(1, app(SearchIndexer::class)->pruneJobs());
        $this->assertSame([$live->id], SearchDocument::where('type', 'job')->pluck('item_id')->all());
    }

    public function test_a_common_word_cannot_push_title_matches_out_of_the_search_candidates(): void
    {
        // 700 documents mention "permesso" in their body; the one that has it in its title must still be found and rank first.
        for ($i = 0; $i < 700; $i++) {
            SearchDocument::create(['type' => 'guide', 'item_id' => $i + 1, 'slug' => "body-$i", 'locale' => 'it', 'title' => "Guida $i", 'search_title' => "guida $i",
                'search_text' => "guida $i testo che parla del permesso di soggiorno in generale"]);
        }
        SearchDocument::create(['type' => 'guide', 'item_id' => 9999, 'slug' => 'the-one', 'locale' => 'it', 'title' => 'Permesso di soggiorno', 'search_title' => 'permesso di soggiorno', 'search_text' => 'permesso di soggiorno']);

        $res = $this->getJson('/api/v1/search?q=permesso+soggiorno', ['Accept-Language' => 'it'])->assertOk();
        $this->assertSame('the-one', $res->json('data.0.slug'));
    }

    public function test_a_failing_push_never_leaves_the_workers_locale_changed(): void
    {
        $this->app->instance(PushSender::class, new class implements PushSender
        {
            public function send(array $tokens, string $title, string $body, array $data = []): array
            {
                throw new RuntimeException('FCM down');
            }
        });
        $u = User::factory()->create(['locale' => 'it']);
        app(ConsentService::class)->record($u, ['push_notifications' => true]);
        $d = new DeviceToken(['platform' => 'ios', 'token' => 'tok-12345678']);
        $d->user_id = $u->id;
        $d->save();

        app()->setLocale('ar');
        app(NotificationService::class)->notify($u, 'document_reminder', ['document_id' => null, 'name' => 'X', 'days' => 3, 'expiry_date' => '2027-01-01']);

        $this->assertSame('ar', app()->getLocale());
    }

    public function test_the_first_lesson_progress_insert_survives_a_parallel_winner(): void
    {
        $lesson = ItalianLesson::factory()->published()->create(['slug' => 'race']);
        $u = User::factory()->create();

        // simulate the loser of a race: the other request already inserted the row
        $winner = new LessonProgress(['status' => 'started']);
        $winner->user_id = $u->id;
        $winner->italian_lesson_id = $lesson->id;
        $winner->save();

        $p = app(ProgressService::class)->record($u, $lesson, 'completed', 80);
        $this->assertSame(1, LessonProgress::count());
        $this->assertSame(['completed', 80], [$p->status, $p->score]);
    }

    public function test_uploads_are_atomic_with_their_quota_checks_and_leave_no_orphan_files(): void
    {
        Storage::fake('documents');
        $this->seed(DocumentTypeSeeder::class);
        $u = User::factory()->create();
        app(ConsentService::class)->record($u, ['document_storage' => true]);
        $this->actingAs($u, 'sanctum');
        $doc = $this->postJson('/api/v1/my-documents', ['type' => 'passport'])->json('data');
        $pdf = fn (string $pad = '') => UploadedFile::fake()->createWithContent('a.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\n$pad\n%%EOF");

        config(['documents.max_files_per_document' => 2]);
        $this->post("/api/v1/my-documents/{$doc['id']}/attachments", ['file' => $pdf()], ['Accept' => 'application/json'])->assertCreated();
        $this->post("/api/v1/my-documents/{$doc['id']}/attachments", ['file' => $pdf('x')], ['Accept' => 'application/json'])->assertCreated();
        $this->post("/api/v1/my-documents/{$doc['id']}/attachments", ['file' => $pdf('y')], ['Accept' => 'application/json'])->assertStatus(422)->assertJsonPath('error.code', 'attachment_limit_reached');
        $this->assertCount(2, Storage::disk('documents')->allFiles());

        // if the insert fails after the file was written, the file is removed again
        DocumentAttachment::creating(fn () => throw new RuntimeException('db down'));
        config(['documents.max_files_per_document' => 10]);
        $this->withoutExceptionHandling();
        try {
            $this->post("/api/v1/my-documents/{$doc['id']}/attachments", ['file' => $pdf('z')], ['Accept' => 'application/json']);
            $this->fail('expected failure');
        } catch (RuntimeException) {
            $this->assertCount(2, Storage::disk('documents')->allFiles(), 'no orphaned file after a failed insert');
        } finally {
            DocumentAttachment::flushEventListeners();
        }
    }
}
