<?php

namespace Tests\Feature\Content;

use App\Domains\Audit\Models\AuditLog;
use App\Enums\ContentStatus;
use App\Enums\SourceType;
use App\Exceptions\ApiException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use InvalidArgumentException;
use Tests\Support\TestGuide;
use Tests\TestCase;

require_once __DIR__.'/../../Support/ContentFixtures.php';

class ContentEngineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        TestGuide::createTables();
    }

    private function guide(array $over = [], bool $ready = false): TestGuide
    {
        $g = TestGuide::create(array_merge($ready ? [
            'source_name' => 'Polizia di Stato',
            'source_url' => 'https://www.poliziadistato.it/articolo/permesso',
            'source_type' => SourceType::Official,
            'last_verified_at' => now()->subDays(10),
        ] : [], $over));
        if ($ready) {
            $g->setTranslations(['ar' => ['title' => 'تصريح الإقامة', 'body' => 'نص']]);
        }

        return $g->refresh();
    }

    // ---- translations -------------------------------------------------------------------------

    public function test_returns_requested_locale_when_available(): void
    {
        $g = $this->guide();
        $g->setTranslations(['ar' => ['title' => 'عنوان'], 'en' => ['title' => 'Title'], 'it' => ['title' => 'Titolo']]);

        foreach (['ar' => 'عنوان', 'en' => 'Title', 'it' => 'Titolo'] as $locale => $expected) {
            $this->assertSame($expected, $g->localized('title', $locale));
            $this->assertFalse($g->usesFallback($locale));
        }
    }

    public function test_falls_back_along_the_configured_chain_and_flags_it(): void
    {
        $g = $this->guide();
        $g->setTranslations(['ar' => ['title' => 'عنوان']]);

        $this->assertSame('عنوان', $g->localized('title', 'it')); // it → en → ar
        $this->assertTrue($g->usesFallback('it'));
        $this->assertSame('ar', $g->resolveLocale('en'));

        $g->setTranslations(['en' => ['title' => 'Title']]);
        $this->assertSame('Title', $g->localized('title', 'it'));
        $this->assertSame('en', $g->resolveLocale('it'));
    }

    public function test_no_translation_at_all_returns_null_not_an_error(): void
    {
        $g = $this->guide();
        $this->assertNull($g->localized('title', 'ar'));
        $this->assertNull($g->resolveLocale('ar'));
        $this->assertFalse($g->usesFallback('ar'));
    }

    public function test_uses_application_locale_by_default(): void
    {
        $g = $this->guide();
        $g->setTranslations(['ar' => ['title' => 'عنوان'], 'it' => ['title' => 'Titolo']]);

        app()->setLocale('it');
        $this->assertSame('Titolo', $g->localized('title'));
        app()->setLocale('ar');
        $this->assertSame('عنوان', $g->localized('title'));
    }

    public function test_set_translations_upserts_without_duplicating(): void
    {
        $g = $this->guide();
        $g->setTranslations(['ar' => ['title' => 'أ']]);
        $g->setTranslations(['ar' => ['title' => 'ب', 'body' => 'نص']]);

        $this->assertSame(1, $g->translations()->count());
        $this->assertSame('ب', $g->fresh()->localized('title', 'ar'));
    }

    public function test_rejects_unsupported_locale_and_unknown_fields(): void
    {
        $g = $this->guide();
        $this->expectException(InvalidArgumentException::class);
        $g->setTranslations(['fr' => ['title' => 'Titre']]);
    }

    public function test_rejects_non_translatable_field(): void
    {
        $g = $this->guide();
        $this->expectException(InvalidArgumentException::class);
        $g->setTranslations(['ar' => ['status' => 'published']]);
    }

    public function test_missing_locales_are_reported(): void
    {
        $g = $this->guide();
        $g->setTranslations(['ar' => ['title' => 'أ'], 'it' => ['title' => 'a']]);
        $this->assertSame(['en'], $g->missingLocales());
        $this->assertEqualsCanonicalizing(['ar', 'it'], $g->translatedLocales());
    }

    public function test_localized_payload_exposes_fallback_metadata(): void
    {
        $g = $this->guide();
        $g->setTranslations(['ar' => ['title' => 'عنوان', 'body' => 'نص']]);

        $p = $g->localizedPayload('it');
        $this->assertSame('ar', $p['locale']);
        $this->assertTrue($p['fallback']);
        $this->assertSame(['ar'], $p['available_locales']);
        $this->assertSame('عنوان', $p['title']);
    }

    // ---- lifecycle ----------------------------------------------------------------------------

    public function test_new_content_starts_as_draft_and_published_scope_hides_it(): void
    {
        $g = $this->guide();
        $this->assertSame(ContentStatus::Draft, $g->status);
        $this->assertSame(0, TestGuide::published()->count());
    }

    public function test_full_workflow_to_published_and_archive(): void
    {
        $g = $this->guide(ready: true);

        $g->transitionTo(ContentStatus::Review);
        $g->transitionTo(ContentStatus::Approved);
        $g->transitionTo(ContentStatus::Published);

        $this->assertNotNull($g->published_at);
        $this->assertSame(1, TestGuide::published()->count());

        $g->transitionTo(ContentStatus::Archived);
        $this->assertSame(0, TestGuide::published()->count());
        $g->transitionTo(ContentStatus::Draft);
    }

    public function test_illegal_transitions_are_rejected(): void
    {
        $g = $this->guide(ready: true);

        foreach ([ContentStatus::Approved, ContentStatus::Published, ContentStatus::Archived] as $to) {
            try {
                $g->transitionTo($to);
                $this->fail("draft → {$to->value} should be rejected");
            } catch (ApiException $e) {
                $this->assertSame('invalid_status_transition', $e->errorCode);
            }
        }
        $this->assertSame(ContentStatus::Draft, $g->fresh()->status);
    }

    public function test_every_status_transition_matrix_is_consistent(): void
    {
        foreach (ContentStatus::cases() as $from) {
            foreach (ContentStatus::cases() as $to) {
                $this->assertSame(in_array($to, $from->allowedTransitions(), true), $from->canTransitionTo($to));
            }
            $this->assertNotContains($from, $from->allowedTransitions(), "$from->value must not self-transition");
        }
        $this->assertNotContains(ContentStatus::Published, ContentStatus::Draft->allowedTransitions());
        $this->assertNotContains(ContentStatus::Published, ContentStatus::Review->allowedTransitions());
    }

    public function test_cannot_publish_without_required_arabic_translation(): void
    {
        $g = $this->guide(['source_name' => 'x', 'source_url' => 'https://www.inps.it/a', 'source_type' => SourceType::Official, 'last_verified_at' => now()]);
        $g->setTranslations(['en' => ['title' => 'Only English', 'body' => 'b']]);
        $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);

        $e = $this->publishError($g);
        $this->assertContains(['code' => 'missing_translation', 'locale' => 'ar'], $e->details['problems']);
        $this->assertSame(ContentStatus::Approved, $g->fresh()->status);
    }

    public function test_cannot_publish_with_empty_arabic_fields(): void
    {
        $g = $this->guide(ready: true);
        $g->setTranslations(['ar' => ['title' => 'عنوان', 'body' => '  ']]);
        $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);

        $this->assertContains(['code' => 'missing_translation', 'locale' => 'ar'], $this->publishError($g)->details['problems']);
    }

    public function test_cannot_publish_without_source_metadata(): void
    {
        $g = $this->guide();
        $g->setTranslations(['ar' => ['title' => 'عنوان', 'body' => 'نص']]);
        $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);

        $codes = collect($this->publishError($g)->details['problems'])->pluck('field')->filter()->all();
        $this->assertEqualsCanonicalizing(['source_name', 'source_url', 'source_type', 'last_verified_at'], $codes);
    }

    public function test_source_url_must_be_https_and_without_credentials(): void
    {
        foreach (['http://www.inps.it/x', 'ftp://inps.it', 'javascript:alert(1)', 'https://user:pw@inps.it/x', 'not a url'] as $url) {
            $g = $this->guide(['source_url' => $url] + $this->validSource(), true);
            $g->update(['source_url' => $url]);
            $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);
            $this->assertContains(['code' => 'invalid_source_url', 'field' => 'source_url'], $this->publishError($g)->details['problems'], $url);
        }
    }

    public function test_official_source_must_be_on_an_allowed_domain(): void
    {
        foreach (['https://inps-permesso.com/x', 'https://inps.it.evil.com/x', 'https://notinps.it/x', 'https://gov.it.example.org'] as $url) {
            $g = $this->guide([], true);
            $g->update(['source_url' => $url]);
            $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);
            $this->assertContains(['code' => 'source_domain_not_official', 'field' => 'source_url'], $this->publishError($g)->details['problems'], $url);
        }
    }

    public function test_official_domains_and_subdomains_are_accepted_and_third_party_is_not_restricted(): void
    {
        foreach (['https://www.inps.it/a', 'https://servizi.agenziaentrate.gov.it/x', 'https://portaleimmigrazione.it'] as $url) {
            $g = $this->guide([], true);
            $g->update(['source_url' => $url]);
            $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved)->transitionTo(ContentStatus::Published);
            $this->assertSame(ContentStatus::Published, $g->status, $url);
        }

        $tp = $this->guide(['source_type' => SourceType::ThirdParty, 'source_url' => 'https://some-blog.example.com/post'], true);
        $tp->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved)->transitionTo(ContentStatus::Published);
        $this->assertSame(ContentStatus::Published, $tp->status);
    }

    public function test_last_verified_in_the_future_is_rejected(): void
    {
        $g = $this->guide([], true);
        $g->update(['last_verified_at' => now()->addDays(3)]);
        $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);

        $this->assertContains(['code' => 'verified_in_future', 'field' => 'last_verified_at'], $this->publishError($g)->details['problems']);
    }

    public function test_freshness_levels(): void
    {
        $g = $this->guide();
        $this->assertSame('unverified', $g->freshness());
        foreach ([[10, 'fresh'], [179, 'fresh'], [180, 'stale'], [364, 'stale'], [365, 'outdated'], [900, 'outdated']] as [$days, $level]) {
            $g->last_verified_at = now()->subDays($days);
            $this->assertSame($level, $g->freshness(), "$days days");
        }
        $this->assertSame('outdated', $g->sourcePayload()['freshness']);
    }

    public function test_unpublish_returns_to_approved_and_clears_visibility(): void
    {
        $g = $this->guide([], true);
        $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved)->transitionTo(ContentStatus::Published);
        $g->transitionTo(ContentStatus::Approved);

        $this->assertSame(0, TestGuide::published()->count());
    }

    // ---- scheduling ---------------------------------------------------------------------------

    public function test_schedule_requires_approved_and_future_time(): void
    {
        $g = $this->guide([], true);
        try {
            $g->schedule(now()->addDay());
            $this->fail();
        } catch (ApiException $e) {
            $this->assertSame('invalid_status_transition', $e->errorCode);
        }

        $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);
        try {
            $g->schedule(now()->subMinute());
            $this->fail();
        } catch (ApiException $e) {
            $this->assertSame('invalid_schedule', $e->errorCode);
        }
    }

    public function test_scheduler_publishes_only_due_approved_items(): void
    {
        config(['content.models' => [TestGuide::class]]);
        $due = $this->guide([], true);
        $future = $this->guide([], true);
        $draft = $this->guide([], true);
        foreach ([$due, $future] as $g) {
            $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);
        }
        $due->schedule(now()->addHour());
        $future->schedule(now()->addDays(2));

        $this->artisan('expa:publish-scheduled')->assertSuccessful();
        $this->assertSame(ContentStatus::Approved, $due->fresh()->status); // not due yet

        $this->travel(2)->hours();
        $this->artisan('expa:publish-scheduled')->assertSuccessful();

        $this->assertSame(ContentStatus::Published, $due->fresh()->status);
        $this->assertSame(ContentStatus::Approved, $future->fresh()->status);
        $this->assertSame(ContentStatus::Draft, $draft->fresh()->status);
    }

    public function test_scheduler_skips_items_that_became_unpublishable(): void
    {
        config(['content.models' => [TestGuide::class]]);
        $g = $this->guide([], true);
        $g->transitionTo(ContentStatus::Review)->transitionTo(ContentStatus::Approved);
        $g->schedule(now()->addHour());
        $g->update(['source_url' => null]); // source removed after approval

        $this->travel(2)->hours();
        $this->artisan('expa:publish-scheduled')->assertSuccessful();

        $this->assertSame(ContentStatus::Approved, $g->fresh()->status);
    }

    public function test_status_changes_are_audited(): void
    {
        $g = $this->guide([], true);
        $g->transitionTo(ContentStatus::Review);

        $log = AuditLog::firstWhere('action', 'content.status_changed');
        $this->assertSameJson(['status' => ['old' => 'draft', 'new' => 'review']], $log->changes);
        $this->assertSame($g->id, $log->subject_id);
    }

    public function test_api_exception_renders_as_localized_error_envelope(): void
    {
        Route::middleware('api')->get('api/v1/_test/publish', function () {
            $g = TestGuide::create([]);
            $g->transitionTo(ContentStatus::Approved);
        });

        $this->getJson('/api/v1/_test/publish', ['Accept-Language' => 'it'])
            ->assertStatus(422)
            ->assertJsonPath('error.code', 'invalid_status_transition')
            ->assertJsonPath('error.message', 'Il contenuto non può passare da draft a approved.');
    }

    private function publishError(TestGuide $g): ApiException
    {
        try {
            $g->transitionTo(ContentStatus::Published);
        } catch (ApiException $e) {
            $this->assertSame('content_not_publishable', $e->errorCode);

            return $e;
        }
        $this->fail('Expected publish to be rejected');
    }

    private function validSource(): array
    {
        return ['source_name' => 'x', 'source_type' => SourceType::Official, 'last_verified_at' => now()];
    }
}
