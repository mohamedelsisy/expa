<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Community\Models\Answer;
use App\Domains\Community\Models\Comment;
use App\Domains\Community\Models\Question;
use App\Domains\Community\Services\CommunityService;
use App\Domains\Geo\Models\City;
use App\Domains\Moderation\Services\ReportService;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Community Q&A (feature-flagged, moderation-first). Authors are never identified: clients only learn `mine`. */
class CommunityController extends Controller
{
    private const SORTS = ['-created_at', '-votes', 'created_at'];

    public function __construct(private CommunityService $svc) {}

    public function meta()
    {
        return ApiResponse::data([
            'topics' => collect(config('community.topics'))->map(fn ($t) => ['value' => $t, 'label' => __('community.topics.'.$t), 'sensitive' => in_array($t, config('community.sensitive_topics'), true)])->all(),
            'notice' => __('community.notice'),
            'limits' => config('community.limits'),
            'sorts' => self::SORTS,
        ]);
    }

    public function index(Request $request)
    {
        $request->validate([
            'topic' => ['nullable', Rule::in(config('community.topics'))], 'city' => ['nullable', 'string', 'max:80'],
            'tag' => ['nullable', 'string', 'max:40'], 'locale' => ['nullable', 'in:ar,en,it'], 'answered' => ['nullable', 'boolean'],
            'q' => ['nullable', 'string', 'max:100'], 'mine' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(self::SORTS)], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $viewer = $request->user('sanctum');
        $q = Question::visibleTo($viewer, $this->svc->blockedBy($viewer))->with('city.translations', 'officialGuide.translations');

        if ($request->boolean('mine')) {
            $viewer ? $q->where('community_questions.user_id', $viewer->id) : $q->whereRaw('1 = 0');
        }
        if ($t = $request->query('topic')) {
            $q->where('topic', $t);
        }
        if ($slug = $request->query('city')) {
            $q->where('city_id', City::where('slug', $slug)->value('id') ?? 0);
        }
        if ($tag = $request->query('tag')) {
            $q->whereIn('community_questions.id', DB::table('community_question_tags')->where('tag', $tag)->select('question_id'));
        }
        if ($l = $request->query('locale')) {
            $q->where('locale', $l);
        }
        if ($request->has('answered')) {
            $request->boolean('answered') ? $q->whereNotNull('accepted_answer_id') : $q->whereNull('accepted_answer_id');
        }
        if ($term = $request->query('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('body', 'like', $like));
        }
        match ($request->query('sort', '-created_at')) {
            '-votes' => $q->orderByDesc('votes_count')->orderByDesc('community_questions.id'),
            'created_at' => $q->orderBy('community_questions.id'),
            default => $q->orderByDesc('community_questions.id'),
        };

        $page = $q->paginate((int) $request->query('per_page', 20));

        return ApiResponse::data($page->getCollection()->map(fn (Question $x) => $this->question($x, $viewer))->values(), [
            'page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(), 'notice' => __('community.notice'),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $viewer = $request->user('sanctum');
        $blocked = $this->svc->blockedBy($viewer);
        $q = Question::visibleTo($viewer, $blocked)->with('city.translations', 'officialGuide.translations')->findOrFail($id);

        $answers = $q->answers()->visibleTo($viewer, $blocked)->get()->sortBy([fn ($a, $b) => ($b->id === $q->accepted_answer_id) <=> ($a->id === $q->accepted_answer_id), ['votes_count', 'desc'], ['id', 'asc']])->values();
        $comments = $q->comments()->visibleTo($viewer, $blocked)->orderBy('id')->get()->groupBy('answer_id');
        $voted = $viewer ? DB::table('community_votes')->where('user_id', $viewer->id)->get()->groupBy('votable_type')->map->pluck('votable_id') : collect();

        return ApiResponse::data($this->question($q, $viewer, true) + [
            'voted' => $viewer ? $voted->get('question', collect())->contains($q->id) : false,
            'comments' => ($comments->get('') ?? collect())->map(fn ($c) => $this->comment($c, $viewer))->values(),
            'answers' => $answers->map(fn (Answer $a) => $this->post($a, $viewer) + [
                'body' => $a->body, 'votes' => $a->votes_count, 'accepted' => $a->id === $q->accepted_answer_id,
                'voted' => $viewer ? $voted->get('answer', collect())->contains($a->id) : false,
                'comments' => ($comments->get($a->id) ?? collect())->map(fn ($c) => $this->comment($c, $viewer))->values(),
                'label' => __('community.answer_label'),
            ])->values(),
        ]);
    }

    public function store(Request $request)
    {
        $d = $request->validate([
            'title' => ['required', 'string', 'max:500'], 'body' => ['required', 'string', 'max:20000'],
            'topic' => ['nullable', Rule::in(config('community.topics'))], 'city_id' => ['nullable', 'integer', Rule::exists('cities', 'id')],
            'locale' => ['nullable', 'in:ar,en,it'],
            'tags' => ['nullable', 'array', 'max:'.config('community.limits.tags_max')], 'tags.*' => ['string', 'max:40', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
        ]);
        $q = $this->svc->createQuestion($request->user(), $d);

        return ApiResponse::data($this->question($q->load('city.translations'), $request->user(), true), status: 201);
    }

    public function destroyQuestion(Request $request, int $id)
    {
        $q = Question::where('user_id', $request->user()->id)->findOrFail($id);
        $q->delete();

        return response()->noContent();
    }

    public function storeAnswer(Request $request, int $id)
    {
        $d = $request->validate(['body' => ['required', 'string', 'max:20000']]);
        $q = Question::visibleTo($request->user())->public()->findOrFail($id);
        $a = $this->svc->createAnswer($request->user(), $q, $d['body']);

        return ApiResponse::data($this->post($a, $request->user()) + ['body' => $a->body, 'label' => __('community.answer_label')], status: 201);
    }

    public function destroyAnswer(Request $request, int $id)
    {
        $a = Answer::where('user_id', $request->user()->id)->with('question')->findOrFail($id);
        $a->delete();
        if ($a->question->accepted_answer_id === $a->id) {
            $a->question->forceFill(['accepted_answer_id' => null])->saveQuietly();
        }
        $a->question->refreshCounts();

        return response()->noContent();
    }

    public function storeComment(Request $request, int $id)
    {
        $d = $request->validate(['body' => ['required', 'string', 'max:5000'], 'answer_id' => ['nullable', 'integer']]);
        $q = Question::visibleTo($request->user())->public()->findOrFail($id);
        $a = isset($d['answer_id']) ? $q->answers()->public()->findOrFail($d['answer_id']) : null;
        $c = $this->svc->createComment($request->user(), $q, $a, $d['body']);

        return ApiResponse::data($this->comment($c, $request->user()), status: 201);
    }

    public function destroyComment(Request $request, int $id)
    {
        Comment::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function vote(Request $request, int $id, string $type)
    {
        $item = $this->votable($type, $id);
        $request->isMethod('DELETE') ? $this->svc->unvote($request->user(), $type, $item) : $this->svc->vote($request->user(), $type, $item);

        return ApiResponse::data(['votes' => $item->fresh()->votes_count, 'voted' => ! $request->isMethod('DELETE')]);
    }

    public function accept(Request $request, int $id)
    {
        $q = Question::findOrFail($id);
        if ($request->isMethod('DELETE')) {
            $this->svc->accept($request->user(), $q, null);
        } else {
            $d = $request->validate(['answer_id' => ['required', 'integer']]);
            $this->svc->accept($request->user(), $q, Answer::find($d['answer_id']));
        }

        return ApiResponse::data(['accepted_answer_id' => $q->fresh()->accepted_answer_id]);
    }

    public function report(Request $request, int $id, string $type, ReportService $reports)
    {
        $d = $request->validate(['reason' => ['required', Rule::in(config('moderation.report_reasons'))], 'note' => ['nullable', 'string', 'max:500']]);
        $item = CommunityService::modelFor($type)::visibleTo($request->user())->findOrFail($id);
        $reports->report($request->user(), 'community_'.$type, $item->id, $d['reason'], $d['note'] ?? null);

        return ApiResponse::data(['message' => __('moderation.report_received')], status: 201);
    }

    // ---- blocks ------------------------------------------------------------------------------

    public function blocks(Request $request)
    {
        $rows = DB::table('community_blocks')->where('user_id', $request->user()->id)->orderBy('id')->get(['id', 'created_at']);

        return ApiResponse::data($rows->map(fn ($r) => ['id' => $r->id, 'blocked_at' => $r->created_at])->values()); // identity of the blocked member is never returned
    }

    public function block(Request $request)
    {
        $d = $request->validate(['type' => ['required', Rule::in(['question', 'answer', 'comment'])], 'id' => ['required', 'integer']]);
        $content = CommunityService::modelFor($d['type'])::visibleTo($request->user())->findOrFail($d['id']);

        return ApiResponse::data(['id' => $this->svc->block($request->user(), $content)], status: 201);
    }

    public function unblock(Request $request, int $id)
    {
        DB::table('community_blocks')->where(['id' => $id, 'user_id' => $request->user()->id])->delete();

        return response()->noContent();
    }

    // ---- presentation ------------------------------------------------------------------------

    private function votable(string $type, int $id)
    {
        $class = ['question' => Question::class, 'answer' => Answer::class][$type] ?? abort(404);

        return $class::findOrFail($id);
    }

    private function post($p, ?User $viewer): array
    {
        return [
            'id' => $p->id, 'mine' => $viewer && $p->user_id === $viewer->id, 'status' => $viewer && $p->user_id === $viewer->id ? $p->status : null,
            'locale' => $p->locale ?? null, 'created_at' => $p->created_at?->toIso8601String(),
            'source_type' => 'third_party', 'verified' => false, // never an official or verified source
        ];
    }

    private function comment(Comment $c, ?User $viewer): array
    {
        return $this->post($c, $viewer) + ['body' => $c->body];
    }

    private function question(Question $q, ?User $viewer, bool $full = false): array
    {
        $sensitive = in_array($q->topic, config('community.sensitive_topics'), true);
        $guide = $q->officialGuide && $q->officialGuide->status->value === 'published' ? $q->officialGuide : null;
        $data = $this->post($q, $viewer) + [
            'title' => $q->title, 'topic' => $q->topic, 'topic_label' => $q->topic ? __('community.topics.'.$q->topic) : null,
            'city' => $q->city ? ['slug' => $q->city->slug, 'name' => $q->city->localized('name')] : null,
            'tags' => $q->tagList(), 'votes' => $q->votes_count, 'answers_count' => $q->answers_count, 'answered' => $q->accepted_answer_id !== null,
            'sensitive' => $sensitive,
            'label' => __('community.question_label'),
            // Moderator-pinned pointer to the official, sourced guide (a path the client opens, never an invented URL).
            'official_guide' => $guide ? ['slug' => $guide->slug, 'title' => $guide->localized('title'), 'path' => '/guides/'.$guide->slug] : null,
        ];
        if ($sensitive) {
            $data['notice'] = __('community.sensitive_notice');
        }
        if ($full) {
            $data['body'] = $q->body;
        } else {
            $data['excerpt'] = mb_substr($q->body, 0, 200);
        }

        return $data;
    }
}
