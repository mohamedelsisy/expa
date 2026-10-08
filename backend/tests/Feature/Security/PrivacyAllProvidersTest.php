<?php

namespace Tests\Feature\Security;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Housing\Models\HousingCheck;
use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Services\JobImportRunner;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Domains\Privacy\Services\PersonalDataExporter;
use App\Domains\Privacy\Services\UserEraser;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\Support\JobFixtures;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

/**
 * Export and erase one user who touched many modules at once. Proves, across ALL registered PersonalDataProviders, that
 * (1) every provider contributes an export section, (2) the export holds the user's markers and nobody else's,
 * (3) after erasure no user-linked table keeps a row for that user (consents/audit are kept but severed), others are untouched.
 */
class PrivacyAllProvidersTest extends TestCase
{
    use JobFixtures, MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
        $this->seed(DocumentTypeSeeder::class);
        config(['community.enabled' => true, 'community.premoderation' => 'none']);
    }

    private function touchEverything(User $u, string $marker): void
    {
        app(ConsentService::class)->record($u, ['profile_personalization' => true, 'push_notifications' => true, 'ai_personalization' => true, 'document_storage' => true, 'housing_analysis' => true]);
        $u->profile()->create(['nationality' => 'EG', 'segment' => 'student', 'goals' => ['study']]);
        $this->actingAs($u, 'sanctum');
        $this->postJson('/api/v1/my-documents', ['type' => 'passport', 'label' => "Doc $marker", 'expiry_date' => now()->addDays(100)->toDateString()])->assertCreated();
        $this->putJson('/api/v1/dashboard/tasks/spid', ['status' => 'done'])->assertOk();
        $this->postJson('/api/v1/devices', ['token' => "tok-$marker-12345678", 'platform' => 'ios'])->assertSuccessful();
        $this->postJson('/api/v1/ai/ask', ['message' => "question $marker please"], ['Accept-Language' => 'en'])->assertOk();
        $h = new HousingCheck(['label' => "check $marker", 'locale' => 'en', 'result' => ['x' => 1], 'expires_at' => now()->addDay()]);
        $h->user_id = $u->id;
        $h->save();
        $qid = $this->postJson('/api/v1/community/questions', ['title' => "How do I book $marker appointment?", 'body' => 'I arrived last week and need to start paperwork.', 'topic' => 'immigration', 'tags' => ['permesso']])->assertCreated()->json('data.id');
        $this->postJson("/api/v1/community/question/$qid/report", ['reason' => 'spam'])->assertCreated();
        $p = $this->provider();
        $this->postJson("/api/v1/providers/{$p->slug}/leads", ['message' => "Need help $marker translating", 'consent_share_contact' => true])->assertCreated();
        $this->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5, 'body' => "Great work $marker thanks"])->assertCreated();
        Http::fake(['feeds.example.test/*' => Http::response($this->feed($this->item(['id' => 'x1'])), 200)]);
        $src = $this->source();
        app(JobImportRunner::class)->run($src);
        $job = JobListing::first();
        $this->postJson("/api/v1/jobs/{$job->id}/save")->assertSuccessful();
        $this->getJson('/api/v1/italian/daily');
    }

    public function test_export_and_erasure_cover_every_provider_and_isolate_users(): void
    {
        $a = $this->member(['name' => 'Alice Marker', 'email' => 'alice-marker@example.test']);
        $b = $this->member(['name' => 'Bob Other', 'email' => 'bob-other@example.test']);
        $this->touchEverything($a, 'MKA77');
        $this->touchEverything($b, 'MKB88');

        // --- export: one section per provider, markers of A only
        $keys = collect(app()->tagged('privacy.providers'))->map(fn (PersonalDataProvider $p) => $p->key())->all();
        $bundle = app(PersonalDataExporter::class)->export($a->fresh());
        foreach ($keys as $key) {
            $this->assertArrayHasKey($key, $bundle, "export is missing provider section $key");
        }
        $json = json_encode($bundle);
        foreach (['MKA77', 'alice-marker@example.test'] as $mine) {
            $this->assertStringContainsString($mine, $json);
        }
        foreach (['MKB88', 'bob-other@example.test', 'Bob Other', '"password"', 'remember_token'] as $notMine) {
            $this->assertStringNotContainsString($notMine, $json);
        }

        // rows exist before erasure in a meaningful number of user-linked tables
        $tables = collect(Schema::getTableListing(schemaQualified: false))->filter(fn ($t) => Schema::hasColumn($t, 'user_id') && $t !== 'consents')->values();
        $before = $tables->filter(fn ($t) => DB::table($t)->where('user_id', $a->id)->exists())->values();
        $this->assertGreaterThanOrEqual(10, $before->count(), 'fixture should touch many modules: '.$before->implode(','));

        // --- erase
        app(UserEraser::class)->erase($a->fresh());
        foreach ($tables as $t) {
            $this->assertSame(0, DB::table($t)->where('user_id', $a->id)->count(), "$t still holds rows for the erased user");
        }
        $this->assertSame(0, DB::table('consents')->where('user_id', $a->id)->whereNotNull('ip_hash')->count());
        $stub = User::withTrashed()->find($a->id);
        $this->assertTrue($stub->trashed());
        $this->assertSame("deleted-{$a->id}@erased.invalid", $stub->email);
        $this->assertStringNotContainsString('MKA77', json_encode([
            DB::table('provider_leads')->get(), DB::table('housing_checks')->get()->where('user_id', $a->id),
        ]));

        // published community threads and reviews are kept by design, but severed from the person
        $this->assertSame(0, DB::table('community_questions')->where('user_id', $a->id)->count());
        $this->assertGreaterThan(0, DB::table('community_questions')->whereNull('user_id')->count());

        // --- the other user is intact
        foreach ($before as $t) {
            $this->assertTrue(DB::table($t)->where('user_id', $b->id)->exists(), "$t rows of the other user were erased");
        }
    }
}
