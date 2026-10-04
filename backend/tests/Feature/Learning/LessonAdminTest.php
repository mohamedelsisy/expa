<?php

namespace Tests\Feature\Learning;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Learning\Models\ItalianLesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function payload(array $over = []): array
    {
        return array_replace_recursive([
            'slug' => 'saluti-test', 'level' => 'a0', 'type' => 'vocabulary', 'duration_minutes' => 2,
            'translations' => ['ar' => ['title' => 'تحيات', 'items' => [['it' => 'Ciao', 'gloss' => 'مرحبًا']]]],
        ], $over);
    }

    public function test_access_and_workflow_without_a_source_requirement(): void
    {
        $this->getJson('/api/v1/admin/italian/lessons')->assertUnauthorized();
        $this->as('user');
        $this->getJson('/api/v1/admin/italian/lessons')->assertForbidden();

        $this->as('editor');
        $id = $this->postJson('/api/v1/admin/italian/lessons', $this->payload())->assertCreated()->assertJsonPath('data.status', 'draft')->json('data.id');
        $go = fn (string $to) => $this->postJson("/api/v1/admin/italian/lessons/$id/transition", ['to' => $to]);
        $go('review')->assertOk();
        $go('approved')->assertForbidden();

        $this->as('content_manager');
        $go('approved')->assertOk();
        $go('published')->assertOk()->assertJsonPath('data.status', 'published'); // no source needed for teaching material
        $this->getJson('/api/v1/italian/lessons/saluti-test')->assertOk()->assertJsonPath('data.items.0.it', 'Ciao');
    }

    public function test_arabic_translation_is_still_required_to_publish(): void
    {
        $this->as('editor');
        $this->postJson('/api/v1/admin/italian/lessons', $this->payload(['translations' => ['ar' => null]]))
            ->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['translations']]]); // an empty shell is not created

        $p = $this->payload();
        unset($p['translations']['ar']);
        $p['translations']['en'] = ['title' => 'Greetings'];
        $id = $this->postJson('/api/v1/admin/italian/lessons', $p)->assertCreated()->json('data.id');
        $this->postJson("/api/v1/admin/italian/lessons/$id/transition", ['to' => 'review'])->assertOk();
        $this->as('content_manager');
        $this->postJson("/api/v1/admin/italian/lessons/$id/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/italian/lessons/$id/transition", ['to' => 'published'])
            ->assertStatus(422)->assertJsonFragment(['code' => 'missing_translation', 'locale' => 'ar']);
    }

    public function test_validation(): void
    {
        $this->as('editor');
        $bad = fn (array $o) => $this->postJson('/api/v1/admin/italian/lessons', array_replace_recursive($this->payload(['slug' => 's'.random_int(1, 99999)]), $o))->assertStatus(422);

        $bad(['level' => 'c2']);
        $bad(['level' => 'z9']);
        $bad(['type' => 'karaoke']);
        $bad(['scenario' => 'spaceship']);
        $bad(['duration_minutes' => 0]);
        $bad(['duration_minutes' => 31]);
        $noItalian = $this->payload(['slug' => 'no-it']);
        $noItalian['translations']['ar']['items'] = [['gloss' => 'no italian word']];
        $this->postJson('/api/v1/admin/italian/lessons', $noItalian)->assertStatus(422);
        $bad(['translations' => ['ar' => ['items' => [['it' => 'ciao', 'script' => '<script>']]]]]);
        $this->postJson('/api/v1/admin/italian/lessons', $this->payload(['slug' => 'ok-one', 'scenario' => 'comune', 'level' => 'c1']))->assertCreated();
    }

    public function test_html_is_stripped_from_lesson_text_and_items(): void
    {
        $this->as('editor');
        $res = $this->postJson('/api/v1/admin/italian/lessons', $this->payload(['translations' => ['ar' => [
            'body' => 'نص <b>مهم</b><script>x</script>', 'items' => [['it' => '<i>Ciao</i>', 'gloss' => '<img src=x onerror=1>مرحبًا']],
        ]]]))->assertCreated();

        $this->assertSame('نص مهمx', $res->json('data.translations.ar.body'));
        $this->assertSame('Ciao', $res->json('data.translations.ar.items.0.it'));
        $this->assertSame('مرحبًا', $res->json('data.translations.ar.items.0.gloss'));
    }

    public function test_list_filters_by_level_and_type(): void
    {
        ItalianLesson::factory()->of('a0', 'grammar')->translated()->create();
        ItalianLesson::factory()->of('a1', 'vocabulary')->translated()->create();
        $this->as('translator');

        $this->getJson('/api/v1/admin/italian/lessons?filter[level]=a0')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/italian/lessons?filter[type]=vocabulary')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/italian/lessons?filter[level]=c2')->assertStatus(422);
    }
}
