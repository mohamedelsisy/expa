<?php

namespace Tests\Feature\Community;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Community\Models\Answer;
use App\Domains\Community\Models\Question;
use App\Domains\Guides\Models\Guide;
use App\Domains\Privacy\Providers\CommunityData;
use App\Domains\Privacy\Services\PersonalDataExporter;
use App\Domains\Privacy\Services\UserEraser;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

class CommunityTest extends TestCase
{
    use MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
        config(['community.enabled' => true, 'community.premoderation' => 'none']);
    }

    private function ask(User $u, array $over = [])
    {
        return $this->actingAs($u, 'sanctum')->postJson('/api/v1/community/questions', array_replace([
            'title' => 'How do I book the Questura appointment?', 'body' => 'I arrived last week and need to start my permit paperwork.', 'topic' => 'immigration', 'tags' => ['permesso'],
        ], $over));
    }

    private function answer(User $u, int $qid, string $body = 'You usually start from the official portal.')
    {
        return $this->actingAs($u, 'sanctum')->postJson("/api/v1/community/questions/{$qid}/answers", ['body' => $body]);
    }

    // ---- feature flag ------------------------------------------------------------------------

    public function test_every_endpoint_is_404_when_disabled_and_data_is_kept(): void
    {
        $u = $this->member();
        $qid = $this->ask($u)->assertCreated()->json('data.id');
        config(['community.enabled' => false]);
        $mod = $this->staff('moderator');
        foreach ([['get', '/api/v1/community/meta'], ['get', '/api/v1/community/questions'], ['get', "/api/v1/community/questions/$qid"]] as [$m, $url]) {
            $this->json($m, $url)->assertNotFound()->assertJsonPath('error.code', 'not_found');
        }
        $this->actingAs($u, 'sanctum')->postJson('/api/v1/community/questions', [])->assertNotFound();
        $this->actingAs($u, 'sanctum')->getJson('/api/v1/community/blocks')->assertNotFound();
        $this->actingAs($mod, 'sanctum')->getJson('/api/v1/admin/community/queue')->assertNotFound();
        $this->assertSame(1, Question::count()); // nothing was removed
        $this->assertCount(1, app(CommunityData::class)->export($u)['questions']); // GDPR export still sees it
        config(['community.enabled' => true]);
        $this->getJson("/api/v1/community/questions/$qid")->assertOk();
    }

    public function test_default_config_is_disabled(): void
    {
        $this->assertFalse((include base_path('config/community.php'))['enabled']);
    }

    // ---- posting & public safety -------------------------------------------------------------

    public function test_question_flow_labels_and_no_author_identity(): void
    {
        $u = $this->member(['name' => 'Mohamed Secret']);
        $r = $this->ask($u)->assertCreated()->assertJsonPath('data.status', 'approved')->assertJsonPath('data.sensitive', true)->assertJsonPath('data.source_type', 'third_party')->assertJsonPath('data.verified', false);
        $this->assertNotEmpty($r->json('data.notice'));
        $qid = $r->json('data.id');

        $this->app['auth']->forgetGuards();
        $list = $this->getJson('/api/v1/community/questions')->assertOk()->assertJsonCount(1, 'data');
        $json = json_encode($list->json());
        $this->assertStringNotContainsString('Mohamed', $json);
        $this->assertStringNotContainsString($u->email, $json);
        $this->assertArrayNotHasKey('user_id', $list->json('data.0'));
        $this->assertFalse($list->json('data.0.mine'));

        $other = $this->member();
        $a = $this->answer($other, $qid)->assertCreated();
        $this->assertSame(__('community.answer_label'), $a->json('data.label'));
        $this->getJson("/api/v1/community/questions/$qid")->assertJsonPath('data.answers.0.label', __('community.answer_label'))->assertJsonPath('data.answers_count', 1);
    }

    public function test_validation_links_shorteners_duplicates_and_email_verification(): void
    {
        $u = $this->member();
        $this->ask($this->member(), ['title' => 'short'])->assertUnprocessable();
        $this->ask($this->member(), ['topic' => 'astrology'])->assertUnprocessable();
        $this->ask($this->member(), ['tags' => ['Bad Tag']])->assertUnprocessable();
        $this->ask($this->member(), ['body' => 'Look at https://bit.ly/xyz for the permit information please'])->assertUnprocessable()->assertJsonPath('error.code', 'link_not_allowed');
        $this->ask($this->member(), ['body' => 'a https://a.example/1 b https://a.example/2 c https://a.example/3 permit information'])->assertUnprocessable()->assertJsonPath('error.code', 'too_many_links');
        $this->ask($this->member(['email_verified_at' => null]))->assertForbidden();

        // https link: allowed but flagged and held for moderation; http link: stripped
        config(['community.premoderation' => 'none']);
        $r = $this->ask($u, ['title' => 'Where is the official page?', 'body' => 'I found https://www.poliziadistato.it/x and http://evil.test/y online'])->assertCreated();
        $r->assertJsonPath('data.status', 'pending');
        $this->assertSame('I found https://www.poliziadistato.it/x and [link removed] online', Question::find($r->json('data.id'))->body);
        $this->assertTrue(Question::find($r->json('data.id'))->flagged);

        $this->ask($this->member())->assertCreated();
        $this->ask($this->member())->assertUnprocessable()->assertJsonPath('error.code', 'duplicate_content');
    }

    public function test_new_accounts_are_held_and_throttled(): void
    {
        config(['community.premoderation' => 'new_users']);
        $fresh = $this->member(['created_at' => now()]);
        $r = $this->ask($fresh)->assertCreated()->assertJsonPath('data.status', 'pending');
        $this->ask($fresh, ['title' => 'Another different question title', 'body' => 'A different body with enough words here.'])->assertStatus(429)->assertJsonPath('error.code', 'new_account_throttled');
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/community/questions')->assertJsonCount(0, 'data'); // pending is not public
        $this->getJson('/api/v1/community/questions/'.$r->json('data.id'))->assertNotFound();
        $this->actingAs($fresh, 'sanctum')->getJson('/api/v1/community/questions/'.$r->json('data.id'))->assertOk()->assertJsonPath('data.status', 'pending'); // the author still sees it

        // an established account with no approved history is still held until it earns trust
        $est = $this->member();
        $this->ask($est, ['title' => 'Question from an established member', 'body' => 'Body from the established member account.'])->assertCreated()->assertJsonPath('data.status', 'pending');
    }

    public function test_post_rate_limit(): void
    {
        $u = $this->member();
        for ($i = 0; $i < 3; $i++) {
            $this->ask($u, ['title' => "Distinct question number $i here", 'body' => "Distinct body text number $i for the test."])->assertCreated();
        }
        $this->ask($u, ['title' => 'One question too many in a minute', 'body' => 'Another distinct body for the limit test.'])->assertStatus(429);
    }

    // ---- votes, accepted answer, comments, delete ---------------------------------------------

    public function test_votes_one_per_user_no_self_vote_and_accepted_answer(): void
    {
        $asker = $this->member();
        $qid = $this->ask($asker)->json('data.id');
        $helper = $this->member();
        $aid = $this->answer($helper, $qid)->json('data.id');
        $voter = $this->member();

        $this->actingAs($asker, 'sanctum')->putJson("/api/v1/community/question/$qid/vote")->assertForbidden(); // own question
        $this->actingAs($helper, 'sanctum')->putJson("/api/v1/community/answer/$aid/vote")->assertForbidden();
        $this->actingAs($voter, 'sanctum')->putJson("/api/v1/community/answer/$aid/vote")->assertOk()->assertJsonPath('data.votes', 1);
        $this->putJson("/api/v1/community/answer/$aid/vote")->assertOk()->assertJsonPath('data.votes', 1); // idempotent: still one
        $this->assertDatabaseCount('community_votes', 1);
        $this->deleteJson("/api/v1/community/answer/$aid/vote")->assertOk()->assertJsonPath('data.votes', 0);
        $this->putJson('/api/v1/community/answer/99999/vote')->assertNotFound();

        $this->actingAs($voter, 'sanctum')->putJson("/api/v1/community/questions/$qid/accepted-answer", ['answer_id' => $aid])->assertForbidden();
        $this->actingAs($asker, 'sanctum')->putJson("/api/v1/community/questions/$qid/accepted-answer", ['answer_id' => $aid])->assertOk();
        $this->getJson("/api/v1/community/questions/$qid")->assertJsonPath('data.answers.0.accepted', true)->assertJsonPath('data.answered', true);
        $this->getJson('/api/v1/community/questions?answered=1')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/community/questions?answered=0')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/community/questions?sort=-votes')->assertOk();
        $this->getJson('/api/v1/community/questions?sort=drop')->assertUnprocessable();
    }

    public function test_comments_and_author_delete_only_own(): void
    {
        $asker = $this->member();
        $qid = $this->ask($asker)->json('data.id');
        $other = $this->member();
        $cid = $this->actingAs($other, 'sanctum')->postJson("/api/v1/community/questions/$qid/comments", ['body' => 'Same here, following'])->assertCreated()->json('data.id');
        $this->getJson("/api/v1/community/questions/$qid")->assertJsonPath('data.comments.0.body', 'Same here, following');
        $this->actingAs($asker, 'sanctum')->deleteJson("/api/v1/community/comments/$cid")->assertNotFound(); // not theirs
        $this->actingAs($other, 'sanctum')->deleteJson("/api/v1/community/comments/$cid")->assertNoContent();
        $this->actingAs($other, 'sanctum')->deleteJson("/api/v1/community/questions/$qid")->assertNotFound();
        $this->actingAs($asker, 'sanctum')->deleteJson("/api/v1/community/questions/$qid")->assertNoContent();
        $this->getJson("/api/v1/community/questions/$qid")->assertNotFound();
        $this->assertSoftDeleted('community_questions', ['id' => $qid]);
    }

    // ---- moderation --------------------------------------------------------------------------

    public function test_moderation_queue_permissions_actions_and_audit(): void
    {
        config(['community.premoderation' => 'all']);
        $u = $this->member();
        $qid = $this->ask($u)->assertCreated()->assertJsonPath('data.status', 'pending')->json('data.id');

        foreach (['user', 'provider', 'content_manager', 'support_agent'] as $role) {
            $this->actingAs($this->staff($role), 'sanctum')->getJson('/api/v1/admin/community/queue')->assertForbidden();
        }
        $mod = $this->staff('moderator');
        $this->actingAs($mod, 'sanctum');
        $this->getJson('/api/v1/admin/community/queue')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.type', 'question');
        $this->postJson("/api/v1/admin/community/question/$qid/moderate", ['action' => 'hide'])->assertUnprocessable(); // reason required
        $this->postJson("/api/v1/admin/community/question/$qid/moderate", ['action' => 'approve'])->assertOk()->assertJsonPath('data.status', 'approved');
        $this->getJson('/api/v1/community/questions')->assertJsonCount(1, 'data');
        $this->postJson("/api/v1/admin/community/question/$qid/moderate", ['action' => 'hide', 'reason' => 'Off topic'])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/community/questions')->assertJsonCount(0, 'data');
        $this->actingAs($u, 'sanctum')->getJson("/api/v1/community/questions/$qid")->assertOk()->assertJsonPath('data.status', 'hidden'); // the author sees its state
        $this->actingAs($mod, 'sanctum')->postJson("/api/v1/admin/community/question/$qid/moderate", ['action' => 'remove', 'reason' => 'Spam'])->assertOk();
        $this->actingAs($u, 'sanctum')->getJson("/api/v1/community/questions/$qid")->assertNotFound();
        $this->assertDatabaseHas('audit_logs', ['action' => 'community.hide', 'actor_id' => $mod->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'community.remove']);
    }

    public function test_reports_flow_into_moderation_and_can_remove_content(): void
    {
        $qid = $this->ask($this->member())->json('data.id');
        $reporter = $this->member();
        $this->actingAs($reporter, 'sanctum')->postJson("/api/v1/community/question/$qid/report", ['reason' => 'nonsense'])->assertUnprocessable();
        $this->postJson("/api/v1/community/question/$qid/report", ['reason' => 'spam'])->assertCreated();
        $this->postJson("/api/v1/community/question/$qid/report", ['reason' => 'spam'])->assertStatus(409);
        $mod = $this->staff('moderator');
        $this->actingAs($mod, 'sanctum');
        $rid = $this->getJson('/api/v1/admin/community/reports')->assertJsonCount(1, 'data')->assertJsonPath('data.0.type', 'question')->json('data.0.id');
        $this->postJson("/api/v1/admin/community/reports/$rid/resolve", ['status' => 'resolved', 'action' => 'remove', 'reason' => 'Spam confirmed'])->assertOk();
        $this->assertSame('removed', Question::find($qid)->status);
    }

    public function test_official_guide_pin_only_published_guides_and_only_moderators(): void
    {
        $qid = $this->ask($this->member())->json('data.id');
        $guide = Guide::factory()->published()->create(['slug' => 'permesso-guide']);
        $draft = Guide::factory()->create(['slug' => 'draft-guide']);
        $this->actingAs($this->member(), 'sanctum')->putJson("/api/v1/admin/community/questions/$qid/official-guide", ['guide_slug' => 'permesso-guide'])->assertForbidden();
        $this->actingAs($this->staff('moderator'), 'sanctum');
        $this->putJson("/api/v1/admin/community/questions/$qid/official-guide", ['guide_slug' => $draft->slug])->assertNotFound();
        $this->putJson("/api/v1/admin/community/questions/$qid/official-guide", ['guide_slug' => $guide->slug])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/community/questions/$qid")->assertJsonPath('data.official_guide.slug', 'permesso-guide')->assertJsonPath('data.official_guide.path', '/guides/permesso-guide');
    }

    public function test_shadow_ban_mute_and_restriction_rules(): void
    {
        $bad = $this->member();
        $good = $this->member();
        $mod = $this->staff('moderator');
        $this->actingAs($good, 'sanctum')->putJson("/api/v1/admin/community/users/{$bad->id}/restriction", ['shadow_banned' => true, 'reason' => 'spam'])->assertForbidden();
        $this->actingAs($mod, 'sanctum');
        $this->putJson("/api/v1/admin/community/users/{$bad->id}/restriction", ['shadow_banned' => true])->assertUnprocessable(); // reason required
        $this->putJson("/api/v1/admin/community/users/{$bad->id}/restriction", ['shadow_banned' => true, 'reason' => 'spam ring'])->assertOk();
        $this->putJson("/api/v1/admin/community/users/{$mod->id}/restriction", ['shadow_banned' => true, 'reason' => 'x'])->assertForbidden(); // not even self / staff
        $this->putJson('/api/v1/admin/community/users/'.$this->staff('admin')->id.'/restriction', ['shadow_banned' => true, 'reason' => 'x'])->assertForbidden();

        // the shadow-banned author sees a normal success; nobody else sees the post
        $r = $this->ask($bad)->assertCreated()->assertJsonPath('data.status', 'approved');
        $this->getJson('/api/v1/community/questions/'.$r->json('data.id'))->assertOk();
        $this->actingAs($good, 'sanctum')->getJson('/api/v1/community/questions/'.$r->json('data.id'))->assertNotFound();
        $this->getJson('/api/v1/community/questions')->assertJsonCount(0, 'data');
        $this->postJson('/api/v1/community/question/'.$r->json('data.id').'/report', ['reason' => 'spam'])->assertNotFound();

        $this->actingAs($mod, 'sanctum')->putJson("/api/v1/admin/community/users/{$good->id}/restriction", ['muted_until' => now()->addDay()->toIso8601String(), 'reason' => 'cool off'])->assertOk();
        $this->ask($good)->assertForbidden()->assertJsonPath('error.code', 'community_muted');
        $this->actingAs($mod, 'sanctum')->deleteJson("/api/v1/admin/community/users/{$good->id}/restriction")->assertNoContent();
        $this->ask($good, ['title' => 'A genuinely different question', 'body' => 'And a genuinely different body text.'])->assertCreated();
        $this->assertDatabaseHas('audit_logs', ['action' => 'community.user_restricted']);
    }

    public function test_blocking_hides_member_content_without_revealing_identity(): void
    {
        $author = $this->member();
        $viewer = $this->member();
        $qid = $this->ask($author)->json('data.id');
        $this->actingAs($viewer, 'sanctum');
        $this->getJson('/api/v1/community/questions')->assertJsonCount(1, 'data');
        $this->postJson('/api/v1/community/blocks', ['type' => 'question', 'id' => $qid])->assertCreated();
        $this->getJson('/api/v1/community/questions')->assertJsonCount(0, 'data');
        $list = $this->getJson('/api/v1/community/blocks')->assertJsonCount(1, 'data');
        $this->assertSame(['id', 'blocked_at'], array_keys($list->json('data.0')));
        $this->actingAs($author, 'sanctum')->getJson('/api/v1/community/questions')->assertJsonCount(1, 'data'); // unaffected for others
        $this->postJson('/api/v1/community/blocks', ['type' => 'question', 'id' => $qid])->assertUnprocessable(); // cannot block self
        $this->actingAs($viewer, 'sanctum')->deleteJson('/api/v1/community/blocks/'.$list->json('data.0.id'))->assertNoContent();
        $this->getJson('/api/v1/community/questions')->assertJsonCount(1, 'data');
    }

    // ---- GDPR --------------------------------------------------------------------------------

    public function test_erasure_anonymises_content_keeps_threads_and_removes_votes_and_blocks(): void
    {
        $author = $this->member();
        $other = $this->member();
        $qid = $this->ask($author)->json('data.id');
        $aid = $this->answer($other, $qid)->json('data.id');
        $this->actingAs($author, 'sanctum')->putJson("/api/v1/community/answer/$aid/vote")->assertOk();
        $this->actingAs($other, 'sanctum')->putJson("/api/v1/community/question/$qid/vote")->assertOk();
        $this->postJson('/api/v1/community/blocks', ['type' => 'question', 'id' => $qid])->assertCreated();
        $this->assertSame(1, Answer::find($aid)->fresh()->votes_count);

        $export = app(CommunityData::class)->export($author);
        $this->assertCount(1, $export['questions']);
        $this->assertSame(1, $export['votes_count']);

        app(CommunityData::class)->erase($author);
        $q = Question::find($qid);
        $this->assertNull($q->user_id);
        $this->assertSame('How do I book the Questura appointment?', $q->title); // thread integrity
        $this->assertSame(0, Answer::find($aid)->votes_count); // their vote disappears with them
        $this->assertDatabaseCount('community_votes', 1); // the other member's vote stays
        $this->assertDatabaseCount('community_blocks', 0);
        $this->assertSame(1, Answer::where('question_id', $qid)->count());
        $this->getJson("/api/v1/community/questions/$qid")->assertOk()->assertJsonPath('data.mine', false);
    }

    public function test_full_account_erasure_covers_marketplace_and_community(): void
    {
        $u = $this->member();
        $p = $this->provider();
        $this->ask($u)->assertCreated();
        $this->actingAs($u, 'sanctum')->postJson("/api/v1/providers/{$p->slug}/leads", ['message' => 'I need help translating a contract', 'consent_share_contact' => true])->assertCreated();
        $this->assertTrue(collect(app()->tagged('privacy.providers'))->map->key()->contains('community'));
        $export = app(PersonalDataExporter::class)->export($u);
        $this->assertArrayHasKey('community', $export['data'] ?? $export);

        app(UserEraser::class)->erase($u);
        $this->assertNull(Question::first()->user_id);
        $this->assertDatabaseCount('provider_leads', 0);
    }
}
