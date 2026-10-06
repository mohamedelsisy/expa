<?php

namespace Tests\Feature;

use App\Domains\Billing\Models\Plan;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\Jobs\Models\JobSource;
use App\Domains\Jobs\Services\JobNormalizer;
use App\Domains\Jobs\Services\SafeHttp;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Http\Requests\GuideRequest;
use App\Jobs\RunJobImport;
use App\Listeners\ReindexKnowledge;
use App\Listeners\ReindexSearch;
use Database\Seeders\PlanSeeder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_long_external_ids_are_hashed_to_fit_the_column(): void
    {
        $n = new JobNormalizer;
        $r = $n->normalize(['id' => str_repeat('x', 400), 'title' => 't'], new JobSource, ['external_id' => 'id']);
        $this->assertSame('sha1:'.sha1(str_repeat('x', 400)), $r['external_id']);
        $this->assertLessThanOrEqual(191, strlen($r['external_id']));
        $this->assertSame('short', $n->normalize(['id' => 'short'], new JobSource, ['external_id' => 'id'])['external_id']);
    }

    public function test_embedded_ipv4_ipv6_ranges_are_not_public(): void
    {
        $m = new \ReflectionMethod(SafeHttp::class, 'isPublic');
        foreach (['64:ff9b::7f00:1', '2002:c0a8:0101::1', '2001:0:4136:e378:8000:63bf:3fff:fdd2', '::ffff:10.0.0.1', '10.0.0.1', '100.64.1.1'] as $ip) {
            $this->assertFalse($m->invoke(new SafeHttp, $ip), $ip);
        }
        $this->assertTrue($m->invoke(new SafeHttp, '93.184.216.34'));
    }

    public function test_reindex_listeners_are_queued_after_commit_and_imports_have_a_timeout_below_retry_after(): void
    {
        foreach ([ReindexSearch::class, ReindexKnowledge::class] as $l) {
            $this->assertInstanceOf(ShouldQueue::class, app($l));
            $this->assertTrue(app($l)->afterCommit);
        }
        $this->assertLessThan(config('queue.connections.database.retry_after'), (new RunJobImport(1))->timeout);
    }

    public function test_placeholder_rights_notes_do_not_count_as_provenance(): void
    {
        foreach (['', 'todo', 'N/A', 'short note', 'TBD'] as $note) {
            $q = new PatenteQuestion(['rights_note' => $note]);
            $this->assertNotEmpty($q->extraPublishProblems(), "[$note]");
        }
        $this->assertSame([], (new PatenteQuestion(['rights_note' => 'Original text written by EXPA staff, CC0']))->extraPublishProblems());
    }

    public function test_paid_plans_are_seeded_inactive_when_configured_so(): void
    {
        config(['billing.seed_paid_plans_active' => false]);
        $this->seed(PlanSeeder::class);
        $this->assertTrue((bool) Plan::where('key', 'free')->value('active'));
        $this->assertFalse((bool) Plan::where('key', 'plus')->value('active'));
    }

    public function test_markdown_links_with_script_schemes_are_neutralised(): void
    {
        $req = new class extends GuideRequest
        {
            public function clean(array $t): array
            {
                $this->merge(['translations' => $t]);
                $this->prepareForValidation();

                return $this->input('translations');
            }
        };
        $out = $req->clean(['ar' => ['body' => '[x](javascript:alert(1)) [ok](https://www.poliziadistato.it) ![i](data:text/html,x) [rel](/guides/a)']]);
        $this->assertStringNotContainsString('javascript:', $out['ar']['body']);
        $this->assertStringNotContainsString('data:', $out['ar']['body']);
        $this->assertStringContainsString('(https://www.poliziadistato.it)', $out['ar']['body']);
        $this->assertStringContainsString('(/guides/a)', $out['ar']['body']);
    }

    public function test_official_domains_can_be_extended_by_config_and_patterns_can_be_switched_off(): void
    {
        $g = app(PublishGuard::class);
        $this->assertFalse($g->isOfficialHost('www.example-asl.it'));
        config(['content.official_domains_extra' => ['example-asl.it']]);
        $this->assertTrue($g->isOfficialHost('www.example-asl.it'));
        $this->assertFalse($g->isOfficialHost('example-asl.it.evil.it'));

        $this->assertTrue($g->isOfficialHost('comune.somewhere.it')); // pattern (default on)
        config(['content.official_domain_patterns_enabled' => false]);
        $this->assertFalse($g->isOfficialHost('comune.somewhere.it'));
        $this->assertTrue($g->isOfficialHost('comune.roma.it'), 'the explicit allow-list is unaffected');
    }
}
