<?php

namespace Tests\Feature\Community;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Community\Models\Answer;
use App\Domains\Community\Models\Comment;
use App\Domains\Community\Models\Question;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

/** RA-10: DELETE community/answers/{id} and admin moderation of answers and comments. */
class CommunityAnswerCommentRoutesTest extends TestCase
{
    use MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
        config(['community.enabled' => true, 'community.premoderation' => 'none']);
    }

    private function question($author): int
    {
        return $this->actingAs($author, 'sanctum')->postJson('/api/v1/community/questions', [
            'title' => 'How do I book the Questura appointment?', 'body' => 'I arrived last week and need to start my permit paperwork.', 'topic' => 'immigration', 'tags' => ['permesso'],
        ])->assertCreated()->json('data.id');
    }

    public function test_author_deletes_own_answer_others_cannot_and_unknown_is_404(): void
    {
        $asker = $this->member();
        $qid = $this->question($asker);
        $author = $this->member();
        $other = $this->member();
        $aid = $this->actingAs($author, 'sanctum')->postJson("/api/v1/community/questions/$qid/answers", ['body' => 'You usually start from the official portal.'])->assertCreated()->json('data.id');
        $this->assertSame(1, Question::find($qid)->answers_count);

        $this->app['auth']->forgetGuards();
        $this->deleteJson("/api/v1/community/answers/$aid")->assertUnauthorized();
        $this->actingAs($other, 'sanctum')->deleteJson("/api/v1/community/answers/$aid")->assertNotFound(); // not yours: indistinguishable from missing
        $this->assertNotNull(Answer::find($aid));

        // an accepted answer is un-accepted when deleted
        $this->actingAs($asker, 'sanctum')->putJson("/api/v1/community/questions/$qid/accepted-answer", ['answer_id' => $aid])->assertOk();
        $this->actingAs($author, 'sanctum')->deleteJson("/api/v1/community/answers/$aid")->assertNoContent();
        $this->assertNull(Answer::find($aid));
        $q = Question::find($qid);
        $this->assertNull($q->accepted_answer_id);
        $this->assertSame(0, $q->answers_count);
        $this->deleteJson('/api/v1/community/answers/999999')->assertNotFound();
    }

    public function test_moderators_hide_and_remove_answers_and_comments(): void
    {
        $asker = $this->member();
        $qid = $this->question($asker);
        $aid = $this->actingAs($this->member(), 'sanctum')->postJson("/api/v1/community/questions/$qid/answers", ['body' => 'You usually start from the official portal.'])->json('data.id');
        $cid = $this->actingAs($this->member(), 'sanctum')->postJson("/api/v1/community/questions/$qid/comments", ['body' => 'Thanks, that helped a lot.'])->assertCreated()->json('data.id');

        foreach (['user', 'provider', 'content_manager'] as $role) {
            $this->actingAs($this->staff($role), 'sanctum')->postJson("/api/v1/admin/community/answer/$aid/moderate", ['action' => 'approve'])->assertForbidden();
        }
        $mod = $this->staff('moderator');
        $this->actingAs($mod, 'sanctum');
        $this->postJson("/api/v1/admin/community/answer/$aid/moderate", ['action' => 'hide'])->assertUnprocessable(); // reason required
        $this->postJson("/api/v1/admin/community/answer/$aid/moderate", ['action' => 'bogus'])->assertUnprocessable();
        $this->postJson("/api/v1/admin/community/answer/$aid/moderate", ['action' => 'hide', 'reason' => 'Off topic'])->assertOk()->assertJsonPath('data.status', 'hidden');
        $this->postJson("/api/v1/admin/community/comment/$cid/moderate", ['action' => 'remove', 'reason' => 'Spam'])->assertOk();

        $this->assertSame('hidden', Answer::find($aid)->status);
        $this->assertSame('removed', Comment::find($cid)->status);
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/community/questions/$qid")->assertOk()->assertJsonPath('data.answers', []);

        $this->actingAs($mod, 'sanctum')->postJson("/api/v1/admin/community/answer/$aid/moderate", ['action' => 'approve'])->assertOk()->assertJsonPath('data.status', 'approved');
        $this->postJson('/api/v1/admin/community/answer/999999/moderate', ['action' => 'approve'])->assertNotFound();
        $this->postJson('/api/v1/admin/community/comment/999999/moderate', ['action' => 'approve'])->assertNotFound();
        $this->assertDatabaseHas('audit_logs', ['action' => 'community.hide', 'actor_id' => $mod->id]);
    }
}
