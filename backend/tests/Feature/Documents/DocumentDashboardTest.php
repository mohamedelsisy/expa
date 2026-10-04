<?php

namespace Tests\Feature\Documents;

use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DocumentTypeSeeder::class);
        $u = User::factory()->create();
        app(ConsentService::class)->record($u, ['document_storage' => true, 'profile_personalization' => true]);
        $this->actingAs($u, 'sanctum');
    }

    private function doc(string $type, ?string $expiry, string $label = 'Doc'): array
    {
        return $this->postJson('/api/v1/my-documents', ['type' => $type, 'label' => $label, 'expiry_date' => $expiry])->assertCreated()->json('data');
    }

    private function actions(string $lang = 'en'): array
    {
        return $this->getJson('/api/v1/dashboard', ['Accept-Language' => $lang])->assertOk()->json('data.next_actions');
    }

    private function task(string $key): array
    {
        return collect($this->getJson('/api/v1/dashboard/tasks')->json('data'))->firstWhere('key', $key);
    }

    public function test_expiring_document_is_the_top_next_action_with_days_in_each_language(): void
    {
        $permit = $this->doc('residence_permit', now()->addDays(74)->toDateString(), 'Permit');

        $en = $this->actions('en')[0];
        $this->assertSame('"Permit" expires in 74 days', $en['title']);
        $this->assertSame(['type' => 'route', 'target' => 'my-documents/'.$permit['id']], $en['cta']);
        $this->assertStringContainsString('74', $this->actions('ar')[0]['title']);
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $this->actions('ar')[0]['title']);
        $this->assertSame('«Permit» scade tra 74 giorni', $this->actions('it')[0]['title']);
    }

    public function test_most_urgent_documents_come_first_and_expired_outranks_all(): void
    {
        $sixty = $this->doc('passport', now()->addDays(60)->toDateString(), 'Passport');
        $ten = $this->doc('insurance', now()->addDays(10)->toDateString(), 'Insurance');
        $expired = $this->doc('visa', now()->subDays(2)->toDateString(), 'Visa');

        $keys = array_column($this->actions(), 'key');
        $this->assertSame(["document.{$expired['id']}", "document.{$ten['id']}", "document.{$sixty['id']}"], array_slice($keys, 0, 3));
        $this->assertSame('onboarding.complete', $keys[3]); // profile prompt comes after every deadline
        $this->assertStringContainsString('has expired', $this->actions()[0]['title']);
    }

    public function test_documents_far_from_expiry_or_without_expiry_do_not_create_actions(): void
    {
        $this->doc('passport', now()->addDays(400)->toDateString());
        $this->doc('contract', null);

        $this->assertSame([], array_values(array_filter($this->actions(), fn ($a) => $a['type'] === 'document')));
    }

    public function test_other_users_documents_never_appear(): void
    {
        $this->doc('passport', now()->addDays(5)->toDateString(), 'Mine');
        $other = User::factory()->create();
        app(ConsentService::class)->record($other, ['document_storage' => true]);
        $this->actingAs($other, 'sanctum')->postJson('/api/v1/my-documents', ['type' => 'passport', 'label' => 'Theirs', 'expiry_date' => now()->addDays(3)->toDateString()])->assertCreated();

        $this->actingAs(User::first(), 'sanctum');
        $titles = implode('|', array_column($this->actions(), 'title'));
        $this->assertStringContainsString('Mine', $titles);
        $this->assertStringNotContainsString('Theirs', $titles);
    }

    public function test_residence_permit_step_auto_completes_only_with_an_expiry_date(): void
    {
        $this->assertSame('todo', $this->task('track_residence_permit')['status']);

        $permit = $this->doc('residence_permit', null);
        $this->assertSame('todo', $this->task('track_residence_permit')['status']); // no expiry yet

        $this->patchJson("/api/v1/my-documents/{$permit['id']}", ['expiry_date' => now()->addYear()->toDateString()])->assertOk();
        $t = $this->task('track_residence_permit');
        $this->assertSame('done', $t['status']);
        $this->assertTrue($t['auto']);

        $this->deleteJson("/api/v1/my-documents/{$permit['id']}")->assertNoContent();
        $this->assertSame('todo', $this->task('track_residence_permit')['status']);
    }

    public function test_other_auto_steps_and_score_effect(): void
    {
        $before = $this->getJson('/api/v1/dashboard')->json('data.score.overall');
        $this->doc('codice_fiscale', null);
        $this->doc('health_card', now()->addYears(5)->toDateString());

        $this->assertSame('done', $this->task('codice_fiscale')['status']);
        $this->assertSame('done', $this->task('tessera_sanitaria')['status']);
        $this->assertGreaterThan($before, $this->getJson('/api/v1/dashboard')->json('data.score.overall'));
        $this->assertFalse($this->task('spid')['auto']);
    }

    public function test_dismissed_step_stays_excluded_even_with_a_matching_document(): void
    {
        $this->putJson('/api/v1/dashboard/tasks/codice_fiscale', ['status' => 'dismissed'])->assertOk();
        $this->doc('codice_fiscale', null);

        $t = $this->task('codice_fiscale');
        $this->assertSame('dismissed', $t['status']);
        $this->assertFalse($t['applicable']);
    }
}
