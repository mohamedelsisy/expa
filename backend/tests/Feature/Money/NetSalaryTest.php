<?php

namespace Tests\Feature\Money;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Money\Models\TaxTable;
use App\Domains\Money\Services\NetSalaryEstimator;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** All numbers below are FAKE test fixtures. EXPA ships no tax tables. */
class NetSalaryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function fake(array $over = []): TaxTable
    {
        $t = new TaxTable($over + [
            'slug' => 'fake-2099', 'tax_year' => 2099, 'contribution_rate' => 10, 'contribution_ceiling' => null, 'deduction_flat' => 1000,
            'brackets' => [['up_to' => 10000, 'rate' => 10], ['up_to' => 20000, 'rate' => 20], ['up_to' => null, 'rate' => 30]],
            'source_name' => 'FAKE source', 'source_url' => 'https://example.test/fake', 'source_type' => 'third_party', 'last_verified_at' => now()->subDay(),
        ]);
        $t->save();
        $t->setTranslations(['ar' => ['name' => 'جدول وهمي'], 'en' => ['name' => 'Fake table']]);

        return $t->fresh();
    }

    private function admin(): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys(['admin']);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    public function test_generic_formula_progressive_brackets_contributions_and_deduction(): void
    {
        $r = app(NetSalaryEstimator::class)->estimate($this->fake(), 40000.0, 12);
        $this->assertSame(4000.0, $r['contributions']);
        $this->assertSame(35000.0, $r['taxable_income']);
        $this->assertSame(7500.0, $r['income_tax']);
        $this->assertSame(28500.0, $r['net_annual']);
        $this->assertSame(2375.0, $r['net_monthly']);
        $this->assertCount(3, $r['brackets']);
    }

    public function test_contribution_ceiling_and_low_income_and_months(): void
    {
        $e = app(NetSalaryEstimator::class);
        $capped = $e->estimate($this->fake(['contribution_ceiling' => 20000]), 40000.0, 13);
        $this->assertSame(2000.0, $capped['contributions']);
        $this->assertSame(round($capped['net_annual'] / 13, 2), $capped['net_monthly']);
        $low = $e->estimate($this->fake(['slug' => 'fake-b']), 500.0);
        $this->assertSame(0.0, $low['income_tax']);
        $this->assertSame(450.0, $low['net_annual']);
    }

    public function test_endpoint_is_honest_when_no_table_is_published(): void
    {
        $this->fake(); // a DRAFT table must not be used
        $this->postJson('/api/v1/money/net-salary', ['gross_annual' => 30000], ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.available', false)->assertJsonPath('data.reason', 'tables_not_published')
            ->assertJsonMissingPath('data.estimate');
        $this->postJson('/api/v1/money/net-salary', [])->assertUnprocessable();
    }

    public function test_endpoint_uses_published_table_and_exposes_source(): void
    {
        $t = $this->fake();
        $t->forceFill(['status' => 'published', 'published_at' => now()])->save();
        $this->postJson('/api/v1/money/net-salary', ['gross_annual' => 40000, 'months' => 13])->assertOk()
            ->assertJsonPath('data.available', true)->assertJsonPath('data.tax_year', 2099)
            ->assertJsonPath('data.estimate.net_annual', 28500)->assertJsonPath('data.table.source.name', 'FAKE source')
            ->assertJsonStructure(['data' => ['disclaimer']]);
        $this->postJson('/api/v1/money/net-salary', ['gross_annual' => 40000, 'tax_year' => 2098])->assertOk()->assertJsonPath('data.available', false);
    }

    public function test_publishing_requires_complete_official_source_year_and_valid_brackets(): void
    {
        $this->admin();
        $payload = ['slug' => 'fake-2099', 'tax_year' => now()->year, 'brackets' => [['up_to' => 10000, 'rate' => 10], ['up_to' => null, 'rate' => 20]],
            'translations' => ['ar' => ['name' => 'وهمي'], 'en' => ['name' => 'Fake']]];
        $id = $this->postJson('/api/v1/admin/money/tax-tables', $payload)->assertCreated()->json('data.id');
        $this->postJson("/api/v1/admin/money/tax-tables/$id/transition", ['to' => 'review'])->assertOk();
        $this->actingAs(tap(User::factory()->create(), fn ($u) => $u->syncRoleKeys(['admin'])), 'sanctum');
        $this->postJson("/api/v1/admin/money/tax-tables/$id/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/money/tax-tables/$id/transition", ['to' => 'published'])->assertUnprocessable()
            ->assertJsonFragment(['code' => 'missing_source_field']);

        $this->putJson("/api/v1/admin/money/tax-tables/$id", ['source_name' => 'Fake', 'source_url' => 'https://example.test/x', 'source_type' => 'official', 'last_verified_at' => now()->toDateString()])->assertUnprocessable()->assertJsonFragment(['code' => 'source_domain_not_official']);
        $this->putJson("/api/v1/admin/money/tax-tables/$id", ['source_name' => 'Fake', 'source_url' => 'https://www.agenziaentrate.gov.it/x', 'source_type' => 'official', 'last_verified_at' => now()->toDateString()])->assertOk();
        $this->postJson("/api/v1/admin/money/tax-tables/$id/transition", ['to' => 'published'])->assertOk();
        $this->assertNotNull(TaxTable::currentFor(now()->year));
    }

    public function test_bracket_validation_and_permissions(): void
    {
        $this->assertTrue(TaxTable::bracketsValid([['up_to' => 1, 'rate' => 5], ['up_to' => null, 'rate' => 6]]));
        $this->assertFalse(TaxTable::bracketsValid([['up_to' => 5, 'rate' => 5]])); // last must be open-ended
        $this->assertFalse(TaxTable::bracketsValid([['up_to' => 5, 'rate' => 5], ['up_to' => 3, 'rate' => 6], ['up_to' => null, 'rate' => 7]]));
        $this->assertFalse(TaxTable::bracketsValid([['up_to' => null, 'rate' => 101]]));

        $this->getJson('/api/v1/admin/money/tax-tables')->assertUnauthorized();
        $cm = User::factory()->create();
        $cm->syncRoleKeys(['content_manager']);
        $this->assertTrue($cm->hasPermission('tax_tables.review'));
        $this->assertFalse($cm->hasPermission('tax_tables.publish')); // only admins publish numeric legal claims
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/v1/admin/money/tax-tables')->assertForbidden();
    }
}
