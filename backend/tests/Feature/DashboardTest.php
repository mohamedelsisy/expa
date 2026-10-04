<?php

namespace Tests\Feature;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Dashboard\Contracts\NextActionProvider;
use App\Domains\Dashboard\Models\UserTask;
use App\Domains\Dashboard\Services\NextActionAggregator;
use App\Domains\Dashboard\Services\ScoreCalculator;
use App\Domains\Dashboard\Services\SetupCatalog;
use App\Domains\Guides\Models\Guide;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use RuntimeException;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function user(array $profile = [], bool $consent = true): User
    {
        $u = User::factory()->create(['name' => 'Mohamed']);
        if ($consent) {
            app(ConsentService::class)->record($u, ['profile_personalization' => true]);
        }
        if ($profile) {
            $u->profile()->create($profile);
        }
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function applicableKeys(User $u): array
    {
        return collect(app(SetupCatalog::class)->forUser($u->fresh()))->where('applicable', true)->keys()->sort()->values()->all();
    }

    private function task(string $key, string $status): void
    {
        $this->putJson("/api/v1/dashboard/tasks/$key", ['status' => $status])->assertOk();
    }

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/v1/dashboard')->assertUnauthorized();
        $this->getJson('/api/v1/dashboard/tasks')->assertUnauthorized();
        $this->putJson('/api/v1/dashboard/tasks/spid', ['status' => 'done'])->assertUnauthorized();
    }

    public function test_new_user_without_consent_gets_only_universal_steps_and_a_clear_note(): void
    {
        $this->user(consent: false);

        $res = $this->getJson('/api/v1/dashboard', ['Accept-Language' => 'en'])->assertOk();
        $res->assertJsonPath('data.greeting.name', 'Mohamed')
            ->assertJsonPath('data.personalization.enabled', false)
            ->assertJsonPath('data.score.overall', 0)
            ->assertJsonPath('data.onboarding.completed', false);
        $this->assertNotNull($res->json('data.score.note'));
        $this->assertNotEmpty($res->json('data.score.how_calculated'));

        $keys = collect($this->getJson('/api/v1/dashboard/tasks')->json('data'))->where('applicable', true)->pluck('key')->sort()->values()->all();
        $this->assertSame(['bank_account', 'codice_fiscale', 'housing_contract', 'italian_start', 'medico_di_base', 'residenza', 'spid', 'tessera_sanitaria', 'track_residence_permit'], $keys);
    }

    public function test_profile_data_is_ignored_without_consent(): void
    {
        $u = $this->user(['segment' => 'self_employed', 'goals' => ['driving', 'business'], 'residence_type' => 'eu_citizen'], consent: false);

        $keys = $this->applicableKeys($u);
        $this->assertNotContains('patente_plan', $keys);
        $this->assertNotContains('partita_iva', $keys);
        $this->assertContains('track_residence_permit', $keys); // residence ignored too → generic default
    }

    public function test_consent_enables_profile_based_steps_and_withdrawal_reverts_them(): void
    {
        $u = $this->user(['segment' => 'self_employed', 'goals' => ['driving', 'business']]);
        $keys = $this->applicableKeys($u);
        foreach (['patente_plan', 'patente_theory', 'partita_iva'] as $k) {
            $this->assertContains($k, $keys);
        }
        $this->assertNotContains('job_search', $keys);

        app(ConsentService::class)->record($u, ['profile_personalization' => false]);
        $this->assertNotContains('patente_plan', $this->applicableKeys($u));
    }

    public function test_segment_and_goal_rules(): void
    {
        $this->assertContains('job_search', $this->applicableKeys($this->user(['segment' => 'newcomer'])));
        $this->assertContains('job_search', $this->applicableKeys($this->user(['segment' => 'family', 'goals' => ['work']])));
        $this->assertNotContains('job_search', $this->applicableKeys($this->user(['segment' => 'family'])));
        $this->assertContains('italian_a2', $this->applicableKeys($this->user(['segment' => 'student'])));
        $this->assertNotContains('italian_a2', $this->applicableKeys($this->user(['segment' => 'worker'])));
    }

    public function test_residence_permit_step_hidden_for_citizens(): void
    {
        foreach (['eu_citizen', 'italian_citizen'] as $type) {
            $this->assertNotContains('track_residence_permit', $this->applicableKeys($this->user(['residence_type' => $type])), $type);
        }
        $this->assertContains('track_residence_permit', $this->applicableKeys($this->user(['residence_type' => 'permesso'])));
    }

    public function test_score_math_is_weighted_mean_of_applicable_categories(): void
    {
        $this->user(['segment' => 'worker']); // universal steps only: documents 4, healthcare 2, banking 1, housing 1, italian 1
        $this->task('codice_fiscale', 'done');       // documents 1/4 = 25
        $this->task('tessera_sanitaria', 'done');    // healthcare 1/2 = 50
        $this->task('bank_account', 'done');         // banking 1/1 = 100

        $res = $this->getJson('/api/v1/dashboard')->assertOk();
        $cats = collect($res->json('data.score.categories'))->keyBy('key');

        $this->assertSame(25, $cats['documents']['percent']);
        $this->assertSame(50, $cats['healthcare']['percent']);
        $this->assertSame(100, $cats['banking']['percent']);
        $this->assertSame(0, $cats['housing']['percent']);
        $this->assertSame(0, $cats['italian']['percent']);
        $this->assertNull($cats['work']['percent']);    // nothing applicable → excluded, not counted as 0
        $this->assertNull($cats['driving']['percent']);
        // (25 + 50 + 100 + 0 + 0) / 5 = 35
        $res->assertJsonPath('data.score.overall', 35)->assertJsonPath('data.score.done_tasks', 3)->assertJsonPath('data.score.applicable_tasks', 9);
    }

    public function test_dismissed_steps_are_excluded_from_the_score(): void
    {
        $this->user(['segment' => 'worker']);
        $this->task('codice_fiscale', 'done');
        $this->task('residenza', 'dismissed');
        $this->task('spid', 'dismissed');
        $this->task('track_residence_permit', 'dismissed');

        $cats = collect($this->getJson('/api/v1/dashboard')->json('data.score.categories'))->keyBy('key');
        $this->assertSame(['done' => 1, 'total' => 1, 'percent' => 100], Arr::only($cats['documents'], ['done', 'total', 'percent']));
    }

    public function test_score_is_null_when_nothing_applies(): void
    {
        $result = app(ScoreCalculator::class)->calculate([
            'a' => ['category' => 'documents', 'applicable' => false, 'status' => 'todo'],
        ]);
        $this->assertNull($result['overall']);
        $this->assertSame(0, $result['applicable_tasks']);
    }

    public function test_score_reaches_100_only_when_everything_applicable_is_done(): void
    {
        $this->user(['segment' => 'worker']);
        $keys = $this->applicableKeys(auth()->user());
        foreach ($keys as $k) {
            $this->task($k, 'done');
        }
        $this->getJson('/api/v1/dashboard')->assertJsonPath('data.score.overall', 100);

        $this->task('spid', 'todo');
        $this->assertLessThan(100, $this->getJson('/api/v1/dashboard')->json('data.score.overall'));
    }

    public function test_task_status_endpoint_validation_and_isolation(): void
    {
        $a = $this->user(['segment' => 'worker']);
        $this->putJson('/api/v1/dashboard/tasks/not_a_task', ['status' => 'done'])->assertNotFound();
        $this->putJson('/api/v1/dashboard/tasks/spid', ['status' => 'finished'])->assertStatus(422);
        $this->putJson('/api/v1/dashboard/tasks/spid', [])->assertStatus(422);

        $this->task('spid', 'done');
        $this->assertNotNull(UserTask::where('user_id', $a->id)->where('task_key', 'spid')->value('completed_at'));

        $this->user(['segment' => 'worker']); // second user
        $spid = collect($this->getJson('/api/v1/dashboard/tasks')->json('data'))->firstWhere('key', 'spid');
        $this->assertSame('todo', $spid['status']);
    }

    public function test_reopening_a_task_removes_the_row_and_completion_time(): void
    {
        $u = $this->user();
        $this->task('spid', 'done');
        $this->task('spid', 'todo');
        $this->assertSame(0, UserTask::where('user_id', $u->id)->count());

        $this->task('spid', 'done');
        $this->task('spid', 'dismissed');
        $this->assertNull(UserTask::first()->completed_at);
    }

    public function test_task_titles_are_localized_and_keep_italian_terms(): void
    {
        $this->user();
        $ar = collect($this->getJson('/api/v1/dashboard/tasks', ['Accept-Language' => 'ar'])->json('data'))->keyBy('key');
        $this->assertStringContainsString('Codice Fiscale', $ar['codice_fiscale']['title']);
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $ar['codice_fiscale']['title']);
        $this->assertSame('الأوراق والوثائق', $ar['codice_fiscale']['category_label']);

        $it = collect($this->getJson('/api/v1/dashboard/tasks', ['Accept-Language' => 'it'])->json('data'))->keyBy('key');
        $this->assertSame('Ottieni il codice fiscale', $it['codice_fiscale']['title']);
    }

    public function test_every_catalog_entry_is_translated_in_every_locale(): void
    {
        foreach (array_keys(config('expa.locales')) as $locale) {
            app()->setLocale($locale);
            foreach (config('setup.tasks') as $key => $def) {
                foreach (['title', 'hint'] as $f) {
                    $this->assertNotSame("setup.tasks.$key.$f", __("setup.tasks.$key.$f"), "$locale $key.$f");
                }
                $this->assertArrayHasKey($def['category'], config('setup.categories'));
                $this->assertNotSame('setup.categories.'.$def['category'], __('setup.categories.'.$def['category']));
            }
            foreach (['how_calculated', 'personalization_off'] as $k) {
                $this->assertNotSame("setup.score.$k", __("setup.score.$k"), $locale);
            }
            foreach (['complete_onboarding', 'enable_personalization'] as $a) {
                $this->assertNotSame("dashboard.actions.$a.title", __("dashboard.actions.$a.title"), $locale);
            }
        }
    }

    public function test_catalog_integrity(): void
    {
        foreach (config('setup.tasks') as $key => $def) {
            $this->assertTrue(isset($def['guide']) || isset($def['route']), "$key must point to a guide or an in-app route");
            $this->assertNotEmpty($def['applies'], $key);
            $this->assertIsInt($def['priority'], $key);
        }
        $priorities = array_column(config('setup.tasks'), 'priority');
        $this->assertSame($priorities, array_values(array_unique($priorities)), 'priorities must be unique for stable ordering');
    }

    public function test_guide_link_only_when_the_guide_is_published(): void
    {
        $this->user();
        Guide::factory()->translated()->create(['slug' => 'codice-fiscale']); // draft
        $row = fn () => collect($this->getJson('/api/v1/dashboard/tasks')->json('data'))->firstWhere('key', 'codice_fiscale');
        $this->assertNull($row()['guide']);

        Guide::where('slug', 'codice-fiscale')->first()->forceFill(['status' => 'published'])->save();
        $this->assertSame('codice-fiscale', $row()['guide']['slug']);
        $this->assertNotEmpty($row()['guide']['title']);
    }

    public function test_next_actions_prioritise_onboarding_consent_then_setup_steps(): void
    {
        $this->user(consent: false);
        $actions = $this->getJson('/api/v1/dashboard', ['Accept-Language' => 'en'])->json('data.next_actions');

        $this->assertLessThanOrEqual(5, count($actions));
        $this->assertSame('onboarding.complete', $actions[0]['key']);
        $this->assertSame('consent.personalization', $actions[1]['key']);
        $this->assertSame('Complete your profile', $actions[0]['title']);
        $this->assertSame('task.track_residence_permit', $actions[2]['key']); // lowest priority number among setup steps
        $this->assertSame(['type' => 'task', 'target' => 'track_residence_permit'], $actions[2]['cta']);
    }

    public function test_next_actions_link_to_a_guide_when_published_and_skip_done_steps(): void
    {
        $this->user(['segment' => 'worker']);
        $this->task('track_residence_permit', 'done');
        Guide::factory()->published()->create(['slug' => 'codice-fiscale']);

        $actions = collect($this->getJson('/api/v1/dashboard')->json('data.next_actions'));
        $this->assertNull($actions->firstWhere('key', 'task.track_residence_permit'));
        $cf = $actions->firstWhere('key', 'task.codice_fiscale');
        $this->assertSame(['type' => 'guide', 'target' => 'codice-fiscale'], $cf['cta']);
    }

    public function test_onboarding_action_disappears_once_completed(): void
    {
        $u = $this->user(['segment' => 'worker']);
        $this->postJson('/api/v1/profile/onboarding/complete')->assertOk();

        $keys = collect($this->getJson('/api/v1/dashboard')->json('data.next_actions'))->pluck('key');
        $this->assertNotContains('onboarding.complete', $keys);
        $this->assertNotContains('consent.personalization', $keys);
        $this->assertTrue($u->fresh()->profile->onboarding_completed_at !== null);
    }

    public function test_aggregator_orders_by_priority_limits_and_survives_failing_providers(): void
    {
        $good = new class implements NextActionProvider
        {
            public function actionsFor(User $user): array
            {
                return [
                    ['key' => 'z.late', 'type' => 't', 'priority' => 200, 'title' => 'late', 'description' => null, 'cta' => ['type' => 'route', 'target' => 'x']],
                    ['key' => 'a.urgent', 'type' => 't', 'priority' => 0, 'title' => 'urgent', 'description' => null, 'cta' => ['type' => 'route', 'target' => 'x']],
                ];
            }
        };
        $broken = new class implements NextActionProvider
        {
            public function actionsFor(User $user): array
            {
                throw new RuntimeException('module down');
            }
        };

        $agg = new NextActionAggregator([$broken, $good]);
        $user = User::factory()->create();

        $this->assertSame(['a.urgent', 'z.late'], array_column($agg->actionsFor($user), 'key'));
        $this->assertCount(1, $agg->actionsFor($user, 1));
    }

    public function test_urgent_provider_actions_outrank_routine_ones_via_the_container_tag(): void
    {
        $this->user();
        $this->app->tag([UrgentFakeProvider::class], 'dashboard.action_providers');
        $this->app->bind(NextActionAggregator::class, fn ($app) => new NextActionAggregator($app->tagged('dashboard.action_providers')));

        $this->assertSame('doc.expiring', $this->getJson('/api/v1/dashboard')->json('data.next_actions.0.key'));
    }

    public function test_dashboard_query_count_is_bounded(): void
    {
        $this->user(['segment' => 'worker', 'goals' => ['driving', 'work']]);
        $count = 0;
        \DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/dashboard')->assertOk();

        $this->assertLessThanOrEqual(12, $count, "dashboard ran $count queries");
    }

    public function test_task_state_is_exported_and_erased_with_the_account(): void
    {
        app(AccessSynchronizer::class)->sync();
        $u = $this->user();
        $this->task('spid', 'done');

        $this->getJson('/api/v1/profile/export')->assertJsonPath('data.setup_tasks.0.task', 'spid');

        $this->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);
        $this->assertSame(0, UserTask::where('user_id', $u->id)->count());
    }
}

class UrgentFakeProvider implements NextActionProvider
{
    public function actionsFor(User $user): array
    {
        return [['key' => 'doc.expiring', 'type' => 'document', 'priority' => 0, 'title' => 'Expiring', 'description' => null, 'cta' => ['type' => 'route', 'target' => 'my-documents']]];
    }
}
