<?php

namespace Tests\Feature\Content;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Search\Models\SearchDocument;
use App\Domains\Study\Models\Scholarship;
use App\Enums\ContentStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private function staff(string $role): User
    {
        app(AccessSynchronizer::class)->sync();
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    public function test_every_content_model_is_registered_for_scheduled_publishing(): void
    {
        $registered = config('content.models');
        $found = [];
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator(app_path('Domains'))) as $f) {
            if ($f->isFile() && str_ends_with($f->getFilename(), '.php')) {
                $src = file_get_contents($f->getPathname());
                if (preg_match('/^namespace (.+);/m', $src, $ns) && preg_match('/^class (\w+)/m', $src, $cls) && preg_match('/use [^;]*HasContentLifecycle[^;]*;/', $src)) {
                    $found[] = $ns[1].'\\'.$cls[1];
                }
            }
        }
        $this->assertNotEmpty($found);
        $this->assertEqualsCanonicalizing($found, $registered, 'content.models must list every model that uses '.HasContentLifecycle::class);
        foreach ($registered as $class) {
            $this->assertTrue(method_exists($class, 'contentAttributes'), $class);
        }
    }

    public function test_scheduled_publishing_works_for_non_guide_modules(): void
    {
        $this->staff('content_manager');
        $svc = GovernmentService::factory()->translated()->create();
        $svc->forceFill(['status' => 'approved'])->save();
        $this->postJson("/api/v1/admin/government/services/{$svc->id}/schedule", ['publish_at' => now()->addHour()->toIso8601String()])->assertOk();

        $this->travel(2)->hours();
        $this->artisan('expa:publish-scheduled')->expectsOutputToContain('Published 1')->assertSuccessful();
        $this->assertSame(ContentStatus::Published, $svc->fresh()->status);
        $this->getJson('/api/v1/admin/stats')->assertOk();
    }

    public function test_an_unpublished_item_is_not_republished_by_a_stale_schedule(): void
    {
        $g = Guide::factory()->translated()->create();
        $g->forceFill(['status' => 'approved'])->save();
        $g->schedule(now()->addHour());

        $this->travel(2)->hours();
        $this->artisan('expa:publish-scheduled')->assertSuccessful();
        $g->refresh();
        $this->assertSame(ContentStatus::Published, $g->status);
        $this->assertNull($g->publish_at, 'the schedule is consumed by publishing');

        $g->transitionTo(ContentStatus::Approved); // admin unpublishes
        $this->travel(10)->minutes();
        $this->artisan('expa:publish-scheduled')->assertSuccessful();
        $this->assertSame(ContentStatus::Approved, $g->fresh()->status);
    }

    public function test_pending_review_stat_counts_every_module(): void
    {
        $this->staff('admin');
        $a = Guide::factory()->translated()->create();
        $b = ItalianLesson::factory()->translated()->create();
        $c = Scholarship::class;
        $a->forceFill(['status' => 'review'])->save();
        $b->forceFill(['status' => 'review'])->save();

        $this->assertSame(2, $this->getJson('/api/v1/admin/stats')->json('data.content.pending_review'));
    }

    public function test_four_eyes_also_blocks_the_last_editor_from_approving(): void
    {
        $editor = $this->staff('editor');
        $g = Guide::factory()->translated()->create();
        $g->forceFill(['created_by' => $editor->id, 'status' => 'draft'])->save();

        // A content manager rewrites the editor's draft, then tries to approve their own rewrite.
        $manager = $this->staff('content_manager');
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['italian_term' => 'Riscritto'])->assertOk();
        $this->postJson("/api/v1/admin/guides/{$g->id}/transition", ['to' => 'review'])->assertOk();
        $this->postJson("/api/v1/admin/guides/{$g->id}/transition", ['to' => 'approved'])->assertForbidden();
        $this->assertSame($manager->id, $g->fresh()->updated_by);

        $this->staff('content_manager'); // a genuinely independent second person
        $this->postJson("/api/v1/admin/guides/{$g->id}/transition", ['to' => 'approved'])->assertOk();
    }

    public function test_editing_content_in_review_sends_it_back_to_draft(): void
    {
        $this->staff('editor');
        $g = Guide::factory()->translated()->create();
        $g->forceFill(['status' => 'review'])->save();

        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['italian_term' => 'x'])->assertOk()->assertJsonPath('data.status', 'draft');
        $this->assertSame(ContentStatus::Draft, $g->fresh()->status);
    }

    public function test_editing_live_content_cannot_break_the_publishing_rules(): void
    {
        $this->staff('content_manager');
        $g = Guide::factory()->published()->create(['slug' => 'live']);

        // removing the source, pointing "official" at a non-allow-listed domain, blanking required text: all refused
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['source_url' => null])->assertStatus(422)->assertJsonPath('error.code', 'content_not_publishable');
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['source_url' => 'https://inps-fake.example.com/x', 'source_type' => 'official'])
            ->assertStatus(422)->assertJsonFragment(['code' => 'source_domain_not_official']);
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['translations' => ['ar' => ['title' => 'عنوان', 'summary' => '', 'what_is' => '']]])
            ->assertStatus(422)->assertJsonFragment(['code' => 'missing_translation', 'locale' => 'ar']);

        $fresh = $g->fresh();
        $this->assertNotNull($fresh->source_url);              // nothing was half-applied (transaction rolled back)
        $this->assertSame('https://www.inps.it/test-page', $fresh->source_url);
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['italian_term' => 'ok'])->assertOk(); // legitimate edits still work
    }

    public function test_soft_deleted_content_leaves_the_indexes_and_frees_its_slug(): void
    {
        $this->staff('admin');
        $g = Guide::factory()->translated()->create(['slug' => 'reusable']);
        $this->deleteJson("/api/v1/admin/guides/{$g->id}")->assertNoContent();

        $this->assertSame(0, SearchDocument::where('item_id', $g->id)->where('type', 'guide')->count());
        $this->assertNull(Guide::where('slug', 'reusable')->first());
        Guide::factory()->translated()->create(['slug' => 'reusable']); // would violate the unique index without the tombstone rename
    }
}
