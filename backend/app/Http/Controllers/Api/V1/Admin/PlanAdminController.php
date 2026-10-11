<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Billing\Models\Plan;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Plan catalogue admin (activate, re-price, features, names). Plans themselves are not created or deleted here: the three
 * keys are seeded and referenced by subscriptions. A price change affects NEW checkouts only: running Stripe subscriptions
 * keep the price they were created with (and `subscription_items.unit_price_minor` keeps the snapshot).
 */
class PlanAdminController extends Controller
{
    /** Typo guard, not a product rule: EUR 1,000.00 per interval. */
    public const MAX_PRICE_MINOR = 100000;

    private const FIELDS = ['active', 'price_minor', 'currency', 'interval', 'features', 'translations'];

    public function __construct(private AuditLogger $audit) {}

    public function index()
    {
        return ApiResponse::data(Plan::with('translations')->orderBy('sort_order')->get()->map(fn (Plan $p) => $this->present($p))->values(), [
            'billing_available' => config('billing.provider') !== 'none',
            'max_price_minor' => self::MAX_PRICE_MINOR,
        ]);
    }

    public function show(string $key)
    {
        return ApiResponse::data($this->present(Plan::where('key', $key)->with('translations')->firstOrFail()));
    }

    public function update(Request $request, string $key)
    {
        $plan = Plan::where('key', $key)->with('translations')->firstOrFail();

        // Unknown fields (e.g. `key`, `sort_order`) are rejected loudly instead of being silently ignored.
        $unknown = array_diff(array_keys($request->all()), self::FIELDS);
        if ($unknown || ! $request->hasAny(self::FIELDS)) {
            throw ValidationException::withMessages(['payload' => ['Send at least one of: '.implode(', ', self::FIELDS).'; no other field is editable.']]);
        }

        $data = $request->validate([
            'active' => ['sometimes', 'boolean'],
            'price_minor' => ['sometimes', 'integer', 'min:0', 'max:'.self::MAX_PRICE_MINOR],
            'currency' => ['sometimes', 'string', Rule::in([config('billing.currency')])],
            'interval' => ['sometimes', 'string', Rule::in(['month', 'year'])],
            'features' => ['sometimes', 'array:ai_daily_limit,reminders_advanced,document_ai,human_credits'],
            'features.ai_daily_limit' => ['integer', 'min:0', 'max:100000'],
            'features.reminders_advanced' => ['boolean'],
            'features.document_ai' => ['boolean'],
            'features.human_credits' => ['integer', 'min:0', 'max:1000'],
            'translations' => ['sometimes', 'array:'.implode(',', array_keys(config('expa.locales')))],
            'translations.*' => ['array:name,description'],
            'translations.*.name' => ['required', 'string', 'min:1', 'max:80'],
            'translations.*.description' => ['nullable', 'string', 'max:500'],
        ]);

        $isFree = $plan->key === 'free';
        $price = $data['price_minor'] ?? $plan->price_minor;
        $active = $data['active'] ?? $plan->active;
        $errors = [];
        if ($isFree) {
            foreach (['price_minor' => $price !== 0, 'interval' => isset($data['interval']), 'active' => $active !== true] as $field => $violated) {
                if ($violated && array_key_exists($field, $data)) {
                    $errors[$field] = ['The free plan stays active, at price 0, without a billing interval.'];
                }
            }
        } elseif ($active && $price <= 0) {
            $errors['price_minor'] = ['An active paid plan needs a price above 0.'];
        }
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        $changes = [];
        DB::transaction(function () use ($plan, $data, &$changes) {
            foreach (['active', 'price_minor', 'currency', 'interval'] as $field) {
                if (array_key_exists($field, $data) && $plan->{$field} !== $data[$field]) {
                    $changes[$field] = ['old' => $plan->{$field}, 'new' => $data[$field]];
                    $plan->{$field} = $data[$field];
                }
            }
            if (isset($data['features'])) {
                $merged = array_replace($plan->features ?? [], $data['features']);
                foreach ($data['features'] as $k => $v) {
                    if (($plan->features[$k] ?? null) !== $v) {
                        $changes["features.$k"] = ['old' => $plan->features[$k] ?? null, 'new' => $v];
                    }
                }
                $plan->features = $merged;
            }
            $plan->save();

            foreach ($data['translations'] ?? [] as $locale => $fields) {
                $old = $plan->translation($locale);
                foreach ($fields as $f => $v) {
                    if (($old?->{$f}) !== $v) {
                        $changes["translations.$locale.$f"] = ['old' => $old?->{$f}, 'new' => $v];
                    }
                }
                $plan->setTranslations([$locale => $fields]);
            }
            if ($changes) {
                $this->audit->log('admin.plan.updated', $plan, $changes);
            }
        });

        $warnings = [];
        if (config("billing.stripe.price_ids.{$plan->key}") && array_intersect_key($changes, array_flip(['price_minor', 'currency', 'interval']))) {
            $warnings[] = 'stripe_price_id_overrides_price';
        }

        return ApiResponse::data($this->present($plan->fresh('translations')), $warnings ? ['warnings' => $warnings] : []);
    }

    private function present(Plan $p): array
    {
        return [
            'key' => $p->key,
            'active' => $p->active,
            'sort_order' => $p->sort_order,
            'price' => ['amount_minor' => $p->price_minor, 'currency' => $p->currency, 'interval' => $p->interval],
            'features' => $p->features ?? [],
            'translations' => $p->translations->mapWithKeys(fn ($t) => [$t->locale => ['name' => $t->name, 'description' => $t->description]])->all(),
            'active_subscriptions' => $p->subscriptions()->whereIn('status', ['active', 'trialing', 'past_due'])->count(),
            'stripe_price_id_configured' => (bool) config("billing.stripe.price_ids.{$p->key}"),
        ];
    }
}
