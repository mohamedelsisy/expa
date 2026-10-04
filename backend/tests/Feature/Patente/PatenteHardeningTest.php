<?php

namespace Tests\Feature\Patente;

use App\Domains\Patente\Models\PatenteExam;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Enums\SourceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatenteHardeningTest extends TestCase
{
    use RefreshDatabase;

    private array $bank = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['patente.exam.questions' => 4, 'patente.exam.max_errors' => 1, 'patente.exam.minutes' => 20]);

        $t = new PatenteTopic(['slug' => 't', 'source_name' => 'S', 'source_url' => 'https://www.mit.gov.it/x', 'source_type' => SourceType::Official, 'last_verified_at' => now()]);
        $t->save();
        $t->setTranslations(['ar' => ['title' => 'ع', 'summary' => 's'], 'it' => ['title' => 'T', 'summary' => 's']]);
        $t->forceFill(['status' => 'published'])->save();
        foreach ([true, false, true, false] as $i => $truth) {
            $q = new PatenteQuestion(['slug' => "q$i", 'patente_topic_id' => $t->id, 'is_true' => $truth, 'rights_note' => 'TEST original', 'source_name' => 'S', 'source_url' => 'https://www.mit.gov.it/q', 'source_type' => SourceType::Official, 'last_verified_at' => now()]);
            $q->save();
            $q->setTranslations(['it' => ['statement' => "Affermazione $i", 'explanation' => "Spiegazione $i"], 'ar' => ['statement' => "عبارة $i", 'explanation' => "شرح $i"]]);
            $q->forceFill(['status' => 'published'])->save();
            $this->bank[$q->id] = $truth;
        }
    }

    private function user(bool $verified = true): User
    {
        $u = User::factory()->create($verified ? [] : ['email_verified_at' => null]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    public function test_exams_require_a_verified_email(): void
    {
        $this->user(verified: false);
        $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->assertForbidden()->assertJsonPath('error.code', 'email_not_verified');
        $this->assertSame(0, PatenteExam::count());
    }

    public function test_numeric_and_string_booleans_are_graded_correctly(): void
    {
        config(['patente.exam.min_submit_fraction' => 0]);
        $this->user();
        $exam = $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->json('data');
        // The client sends 1/0 and "1"/"0" instead of true/false; every one of them is a correct answer here.
        $answers = collect($exam['questions'])->values()->map(fn ($q, $i) => [
            'question_id' => $q['id'], 'answer' => [$this->bank[$q['id']] ? 1 : 0, $this->bank[$q['id']] ? '1' : '0', $this->bank[$q['id']], $this->bank[$q['id']] ? 1 : 0][$i],
        ])->all();

        $res = $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => $answers])->assertOk();
        $this->assertSame([4, 0, true], [$res->json('data.correct'), $res->json('data.errors'), $res->json('data.passed')]);
        foreach ($res->json('data.review') as $r) {
            $this->assertIsBool($r['your_answer']);
        }
    }

    public function test_an_exam_cannot_be_submitted_before_a_quarter_of_its_time_has_passed(): void
    {
        $this->user();
        $exam = $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->json('data');
        $blank = ['answers' => [['question_id' => $exam['questions'][0]['id'], 'answer' => null]]];

        $res = $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", $blank)->assertStatus(422)->assertJsonPath('error.code', 'exam_submitted_too_early');
        $this->assertNotEmpty($res->json('error.details.available_at.0'));
        $this->assertNull(PatenteExam::find($exam['id'])->finished_at);

        $this->travel(4)->minutes();
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", $blank)->assertStatus(422); // 5 min of 20 required
        $this->travel(61)->seconds();
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", $blank)->assertOk();
    }

    public function test_practice_sessions_have_no_minimum_time(): void
    {
        $this->user();
        $p = $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['t'], 'size' => 2])->json('data');
        $this->postJson("/api/v1/patente/exams/{$p['id']}/answers", ['answers' => [['question_id' => $p['questions'][0]['id'], 'answer' => true]]])->assertOk();
    }

    public function test_a_blank_submission_reveals_no_solutions(): void
    {
        config(['patente.exam.min_submit_fraction' => 0]);
        $this->user();
        $exam = $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->json('data');
        $first = $exam['questions'][0]['id'];

        $res = $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", ['answers' => [['question_id' => $first, 'answer' => true]]])->assertOk();
        $review = collect($res->json('data.review'))->keyBy('question_id');

        $this->assertNotNull($review[$first]['correct_answer']);            // answered → solution shown
        $this->assertNotNull($review[$first]['explanation']);
        foreach ($review as $id => $r) {
            if ($id !== $first) {
                $this->assertNull($r['correct_answer'], "unanswered $id must not leak its answer");
                $this->assertNull($r['explanation']);
                $this->assertNull($r['your_answer']);
            }
        }
        // …and the same view later via GET
        $again = collect($this->getJson("/api/v1/patente/exams/{$exam['id']}")->json('data.review'))->where('question_id', '!=', $first);
        $this->assertSame([null, null, null], $again->pluck('correct_answer')->values()->all());
    }

    public function test_daily_session_limits_bound_question_scraping(): void
    {
        config(['patente.daily_exam_limit' => 2, 'patente.daily_practice_limit' => 1]);
        $this->user();
        $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->assertCreated();
        $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->assertCreated();
        $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'], ['Accept-Language' => 'en'])->assertStatus(429)->assertJsonPath('error.code', 'exam_daily_limit');

        $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['t']])->assertCreated();
        $this->postJson('/api/v1/patente/exams', ['mode' => 'practice', 'topics' => ['t']])->assertStatus(429);

        $this->user(); // limits are per user
        $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->assertCreated();

        $this->travel(1)->day(); // and reset the next day
        $this->actingAs(User::first(), 'sanctum');
        $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->assertCreated();
    }

    public function test_a_second_submit_after_the_first_is_a_clean_409_not_a_500(): void
    {
        config(['patente.exam.min_submit_fraction' => 0]);
        $this->user();
        $exam = $this->postJson('/api/v1/patente/exams', ['mode' => 'exam'])->json('data');
        $body = ['answers' => collect($exam['questions'])->map(fn ($q) => ['question_id' => $q['id'], 'answer' => true])->all()];

        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", $body)->assertOk();
        $this->postJson("/api/v1/patente/exams/{$exam['id']}/answers", $body)->assertStatus(409)->assertJsonPath('error.code', 'exam_already_finished');
    }
}
