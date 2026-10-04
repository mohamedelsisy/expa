<?php

namespace Tests\Feature\Learning;

use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\LessonProgress;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\StarterCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LearningTest extends TestCase
{
    use RefreshDatabase;

    private function user(array $consents = [], array $profile = []): User
    {
        $u = User::factory()->create();
        if ($consents) {
            app(ConsentService::class)->record($u, $consents);
        }
        if ($profile) {
            $u->profile()->create($profile);
        }
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function lesson(string $level, string $type, int $order = 0, array $over = []): ItalianLesson
    {
        return ItalianLesson::factory()->published()->of($level, $type, $order)->create($over + ['slug' => "$level-$type-$order-".random_int(1, 99999)]);
    }

    // ---- public catalogue ---------------------------------------------------------------------

    public function test_only_published_lessons_are_public_and_filterable(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'live']);
        $this->lesson('a1', 'grammar', 1, ['scenario' => 'comune']);
        ItalianLesson::factory()->translated()->create(['slug' => 'draft']);

        $this->getJson('/api/v1/italian/lessons')->assertOk()->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/italian/lessons?level=a1')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/italian/lessons?type=vocabulary')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/italian/lessons?scenario=comune')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/italian/lessons?level=c2')->assertStatus(422);
        $this->getJson('/api/v1/italian/lessons/live')->assertOk();
        $this->getJson('/api/v1/italian/lessons/draft')->assertNotFound();
    }

    public function test_levels_and_meta_are_localized(): void
    {
        $this->lesson('a0', 'vocabulary');
        $levels = collect($this->getJson('/api/v1/italian/levels', ['Accept-Language' => 'ar'])->assertOk()->json('data'));
        $this->assertSame(['a0', 'a1', 'a2', 'b1', 'b2', 'c1'], $levels->pluck('level')->all());
        $this->assertSame(1, $levels->firstWhere('level', 'a0')['lessons']);
        $this->assertSame('مبتدئ تمامًا (A0)', $levels->firstWhere('level', 'a0')['label']);

        $meta = $this->getJson('/api/v1/italian/meta', ['Accept-Language' => 'it'])->json('data');
        $this->assertCount(13, $meta['scenarios']);
        $this->assertSame('Al Comune', collect($meta['scenarios'])->firstWhere('value', 'comune')['label']);
        $this->assertSame('Pronuncia', collect($meta['types'])->firstWhere('value', 'pronunciation')['label']);
    }

    public function test_lesson_detail_is_localized_with_fallback_and_hides_progress_from_guests(): void
    {
        $l = ItalianLesson::factory()->of('a0', 'vocabulary')->create(['slug' => 'only-ar']);
        $l->setTranslations(['ar' => ['title' => 'تحية', 'items' => [['it' => 'ciao', 'gloss' => 'مرحبًا']]]]);
        $l->forceFill(['status' => 'published'])->save();

        $this->getJson('/api/v1/italian/lessons/only-ar', ['Accept-Language' => 'it'])
            ->assertJsonPath('data.title', 'تحية')->assertJsonPath('data.fallback', true)
            ->assertJsonPath('data.items.0.it', 'ciao')->assertJsonPath('data.progress', null)
            ->assertJsonPath('data.type_label', 'Vocabolario');
    }

    public function test_authenticated_lesson_requests_include_own_progress_only(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'v1']);
        $this->user();
        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'completed', 'score' => 80])->assertOk();

        $this->getJson('/api/v1/italian/lessons/v1')->assertJsonPath('data.progress', ['status' => 'completed', 'score' => 80]);
        $this->getJson('/api/v1/italian/lessons')->assertJsonPath('data.0.progress.status', 'completed');

        $this->user(); // someone else
        $this->getJson('/api/v1/italian/lessons/v1')->assertJsonPath('data.progress', null);
    }

    // ---- progress -----------------------------------------------------------------------------

    public function test_progress_endpoints_require_authentication(): void
    {
        $this->postJson('/api/v1/italian/lessons/x/progress', ['status' => 'completed'])->assertUnauthorized();
        $this->getJson('/api/v1/italian/progress')->assertUnauthorized();
        $this->getJson('/api/v1/italian/daily')->assertUnauthorized();
    }

    public function test_recording_progress_validation_and_unpublished_lessons(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'v1']);
        ItalianLesson::factory()->translated()->create(['slug' => 'draft']);
        $this->user();

        $this->postJson('/api/v1/italian/lessons/v1/progress', [])->assertStatus(422);
        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'mastered'])->assertStatus(422);
        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'completed', 'score' => 101])->assertStatus(422);
        $this->postJson('/api/v1/italian/lessons/draft/progress', ['status' => 'completed'])->assertNotFound();
        $this->postJson('/api/v1/italian/lessons/nope/progress', ['status' => 'completed'])->assertNotFound();
    }

    public function test_completed_lessons_never_regress_and_keep_the_best_score(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'v1']);
        $u = $this->user();

        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'started'])->assertOk()->assertJsonPath('data.status', 'started');
        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'completed', 'score' => 60])->assertOk();
        $first = LessonProgress::first()->completed_at;
        $this->travel(2)->hours();
        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'completed', 'score' => 40])->assertOk();
        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'started'])->assertOk()->assertJsonPath('data.status', 'completed');

        $p = LessonProgress::where('user_id', $u->id)->first();
        $this->assertSame(60, $p->score);
        $this->assertTrue($first->equalTo($p->completed_at));
        $this->assertSame(1, LessonProgress::count());
    }

    public function test_progress_summary_per_level_counts_published_lessons_only(): void
    {
        $a = $this->lesson('a0', 'vocabulary', 1, ['slug' => 'a']);
        $this->lesson('a0', 'grammar', 1, ['slug' => 'b']);
        $this->lesson('a1', 'vocabulary', 1, ['slug' => 'c']);
        $this->user();
        $this->postJson('/api/v1/italian/lessons/a/progress', ['status' => 'completed'])->assertOk();

        $res = $this->getJson('/api/v1/italian/progress', ['Accept-Language' => 'en'])->assertOk();
        $levels = collect($res->json('data.levels'))->keyBy('level');
        $this->assertSame(['total' => 2, 'completed' => 1, 'percent' => 50], Arr::only($levels['a0'], ['total', 'completed', 'percent']));
        $this->assertSame(0, $levels['a1']['percent']);
        $this->assertSame(0, $levels['c1']['total']);
        $res->assertJsonPath('data.completed_today', true)->assertJsonPath('data.streak', 1);

        $a->forceFill(['status' => 'archived'])->save(); // unpublished lessons stop counting
        $this->assertSame(0, collect($this->getJson('/api/v1/italian/progress')->json('data.levels'))->keyBy('level')['a0']['completed']);
    }

    public function test_streak_counts_consecutive_days_and_survives_until_the_day_is_missed(): void
    {
        foreach (range(1, 4) as $i) {
            $this->lesson('a0', 'vocabulary', $i, ['slug' => "v$i"]);
        }
        $u = $this->user();
        // seed three consecutive days ending yesterday directly
        foreach ([1, 2, 3] as $i => $ago) {
            $p = new LessonProgress(['status' => 'completed']);
            $p->user_id = $u->id;
            $p->italian_lesson_id = ItalianLesson::where('slug', 'v'.($i + 1))->value('id');
            $p->completed_at = now()->subDays($ago)->setTime(10, 0);
            $p->save();
        }

        $this->getJson('/api/v1/italian/progress')->assertJsonPath('data.streak', 3)->assertJsonPath('data.completed_today', false);
        $this->postJson('/api/v1/italian/lessons/v4/progress', ['status' => 'completed'])->assertOk()->assertJsonPath('data.streak', 4);

        $this->travel(2)->days(); // two days of silence breaks it
        $this->getJson('/api/v1/italian/progress')->assertJsonPath('data.streak', 0);
    }

    // ---- daily plan ---------------------------------------------------------------------------

    public function test_daily_plan_has_the_five_slots_in_order_with_minutes(): void
    {
        foreach (['vocabulary', 'grammar', 'conversation', 'pronunciation', 'mission'] as $i => $t) {
            $this->lesson('a0', $t, 1, ['duration_minutes' => $i + 1]);
        }
        $this->user();

        $res = $this->getJson('/api/v1/italian/daily', ['Accept-Language' => 'en'])->assertOk();
        $this->assertSame(['words', 'grammar', 'conversation', 'pronunciation', 'mission'], array_column($res->json('data.slots'), 'slot'));
        $res->assertJsonPath('data.level', 'a0')->assertJsonPath('data.minutes', 15)->assertJsonPath('data.total', 5)->assertJsonPath('data.done_today', 0)
            ->assertJsonPath('data.slots.0.type_label', 'Vocabulary');
    }

    public function test_plan_picks_the_first_uncompleted_lesson_and_moves_up_when_a_level_is_exhausted(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'v-a0-1']);
        $this->lesson('a0', 'vocabulary', 2, ['slug' => 'v-a0-2']);
        $this->lesson('a1', 'vocabulary', 1, ['slug' => 'v-a1-1']);
        $this->user();

        $slot = fn () => $this->getJson('/api/v1/italian/daily')->json('data.slots.0');
        $this->assertSame('v-a0-1', $slot()['lesson']['slug']);

        $this->postJson('/api/v1/italian/lessons/v-a0-1/progress', ['status' => 'completed'])->assertOk();
        $this->assertSame('v-a0-1', $slot()['lesson']['slug']); // finished today: stays visible, marked done
        $this->assertTrue($slot()['done_today']);

        $this->travel(1)->day();
        $this->assertSame('v-a0-2', $slot()['lesson']['slug']);
        $this->postJson('/api/v1/italian/lessons/v-a0-2/progress', ['status' => 'completed'])->assertOk();
        $this->travel(1)->day();
        $this->assertSame('v-a1-1', $slot()['lesson']['slug']); // A0 exhausted → next level
        $this->postJson('/api/v1/italian/lessons/v-a1-1/progress', ['status' => 'completed'])->assertOk();
        $this->travel(1)->day();
        $this->assertNull($slot()['lesson']);
    }

    public function test_plan_level_follows_the_profile_only_with_personalization_consent(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'v-a0']);
        $this->lesson('b1', 'vocabulary', 1, ['slug' => 'v-b1']);

        $this->user(profile: ['italian_level' => 'b1']);
        $this->getJson('/api/v1/italian/daily')->assertJsonPath('data.level', 'a0')->assertJsonPath('data.slots.0.lesson.slug', 'v-a0');

        $this->user(['profile_personalization' => true], ['italian_level' => 'b1']);
        $this->getJson('/api/v1/italian/daily')->assertJsonPath('data.level', 'b1')->assertJsonPath('data.slots.0.lesson.slug', 'v-b1');
    }

    public function test_plan_with_no_content_is_empty_not_an_error(): void
    {
        $this->user();
        $res = $this->getJson('/api/v1/italian/daily')->assertOk();
        $this->assertSame(0, $res->json('data.total'));
        $this->assertSame(0, $res->json('data.minutes'));
        $this->assertNull($res->json('data.slots.0.lesson'));
    }

    // ---- dashboard integration & privacy ------------------------------------------------------

    public function test_dashboard_nudges_daily_italian_and_auto_completes_the_start_step(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'v1']);
        $this->user();
        $step = fn () => collect($this->getJson('/api/v1/dashboard/tasks')->json('data'))->firstWhere('key', 'italian_start');
        $keys = fn () => array_column($this->getJson('/api/v1/dashboard', ['Accept-Language' => 'en'])->json('data.next_actions'), 'key');

        $this->assertContains('learning.daily', $keys());
        $this->assertSame('todo', $step()['status']);

        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'completed'])->assertOk();
        $this->assertNotContains('learning.daily', $keys()); // done today
        $this->assertSame('done', $step()['status']);
        $this->assertTrue($step()['auto']);

        $this->travel(1)->day();
        $action = collect($this->getJson('/api/v1/dashboard', ['Accept-Language' => 'en'])->json('data.next_actions'))->firstWhere('key', 'learning.daily');
        $this->assertStringContainsString('1-day streak', $action['description']);
        $this->assertSame(['type' => 'route', 'target' => 'learn-italian/daily'], $action['cta']);
    }

    public function test_no_learning_nudge_when_there_are_no_lessons(): void
    {
        $this->user();
        $this->assertNotContains('learning.daily', array_column($this->getJson('/api/v1/dashboard')->json('data.next_actions'), 'key'));
    }

    public function test_export_and_erasure_cover_progress(): void
    {
        $this->lesson('a0', 'vocabulary', 1, ['slug' => 'v1']);
        $u = $this->user();
        $this->postJson('/api/v1/italian/lessons/v1/progress', ['status' => 'completed', 'score' => 90])->assertOk();

        $this->getJson('/api/v1/profile/export')->assertJsonPath('data.learning_progress.0.lesson', 'v1')->assertJsonPath('data.learning_progress.0.score', 90);
        $this->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);
        $this->assertSame(0, LessonProgress::where('user_id', $u->id)->count());
    }

    // ---- starter curriculum -------------------------------------------------------------------

    public function test_starter_curriculum_is_complete_in_all_languages_and_idempotent(): void
    {
        $this->seed(StarterCurriculumSeeder::class);
        $this->seed(StarterCurriculumSeeder::class);

        $this->assertSame(6, ItalianLesson::published()->count());
        $this->assertSame(
            ['conversation', 'grammar', 'mission', 'pronunciation', 'vocabulary'],
            ItalianLesson::pluck('type')->map->value->unique()->sort()->values()->all(),
        );
        foreach (ItalianLesson::with('translations')->get() as $l) {
            $this->assertSame([], $l->missingLocales(), $l->slug);
            foreach ($l->translations as $t) {
                $this->assertNotEmpty($t->title);
                foreach ((array) $t->items as $item) {
                    $this->assertArrayHasKey('it', $item, "$l->slug $t->locale");
                }
            }
        }
        // Arabic vocabulary carries glosses; Italian carries the Italian word itself.
        $ar = ItalianLesson::firstWhere('slug', 'saluti-1')->translation('ar')->items;
        $this->assertSame(['it' => 'Buongiorno', 'gloss' => 'صباح الخير', 'example_it' => 'Buongiorno, signora!', 'example_gloss' => 'صباح الخير يا سيدتي!'], $ar[0]);
        $this->assertLessThanOrEqual(5, count($ar), 'vocabulary lessons teach at most 5 words');
    }

    public function test_starter_plan_works_end_to_end(): void
    {
        $this->seed(StarterCurriculumSeeder::class);
        $this->user();
        $res = $this->getJson('/api/v1/italian/daily', ['Accept-Language' => 'ar'])->assertOk();

        $this->assertSame(5, $res->json('data.total'));
        $this->assertSame('saluti-1', $res->json('data.slots.0.lesson.slug'));
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $res->json('data.slots.0.lesson.title'));
        $this->assertGreaterThan(5, $res->json('data.minutes'));
        $this->assertLessThanOrEqual(15, $res->json('data.minutes')); // "10 minutes" promise stays honest
    }

    public function test_lesson_list_does_not_n_plus_one(): void
    {
        foreach (range(1, 12) as $i) {
            $this->lesson('a0', 'vocabulary', $i);
        }
        $this->user();
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/italian/lessons?per_page=12')->assertOk();

        $this->assertLessThanOrEqual(5, $count, "ran $count queries");
    }
}
