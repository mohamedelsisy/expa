<?php

namespace Tests\Feature\Auth;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TokenHardeningTest extends TestCase
{
    use RefreshDatabase;

    private function login(string $email, string $device = 'phone')
    {
        return $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => 'Str0ngPassw0rd', 'device_name' => $device]);
    }

    public function test_staff_tokens_are_short_lived_and_user_tokens_follow_the_default(): void
    {
        app(AccessSynchronizer::class)->sync();
        $staff = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        $staff->syncRoleKeys(['editor']);
        $user = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        $user->syncRoleKeys(['user']);

        $this->login($staff->email)->assertOk();
        $this->login($user->email)->assertOk();

        $minutes = (int) config('expa.staff_token_minutes');
        $this->assertEqualsWithDelta(now()->addMinutes($minutes)->timestamp, $staff->tokens()->first()->expires_at->timestamp, 5);
        $this->assertNull($user->tokens()->first()->expires_at, 'ordinary tokens use the global sanctum expiration');
    }

    public function test_the_number_of_live_tokens_is_capped_and_the_oldest_are_revoked(): void
    {
        config(['expa.limits.tokens' => 3]);
        $u = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        foreach (range(1, 5) as $i) {
            $this->login($u->email, "dev$i")->assertOk();
        }
        $this->assertSame(['dev5', 'dev4', 'dev3'], $u->tokens()->orderByDesc('id')->pluck('name')->all());
    }

    public function test_a_user_can_list_and_revoke_only_their_own_devices(): void
    {
        $a = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        $b = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        $tokenA = $this->login($a->email, 'a-phone')->json('data.token');
        $this->login($a->email, 'a-laptop')->assertOk();
        $this->login($b->email, 'b-phone')->assertOk();

        $list = $this->withToken($tokenA)->getJson('/api/v1/auth/tokens')->assertOk();
        $this->assertSame(['a-laptop', 'a-phone'], collect($list->json('data'))->pluck('name')->sort()->values()->all());
        $this->assertStringNotContainsString('token', strtolower(json_encode(array_keys($list->json('data.0')))));

        $this->app['auth']->forgetGuards();
        $this->withToken($tokenA)->deleteJson('/api/v1/auth/tokens/'.$b->tokens()->first()->id)->assertNotFound();
        $laptop = $a->tokens()->where('name', 'a-laptop')->first();
        $this->app['auth']->forgetGuards();
        $this->withToken($tokenA)->deleteJson("/api/v1/auth/tokens/{$laptop->id}")->assertNoContent();
        $this->assertSame(1, $a->tokens()->count());
    }

    public function test_export_can_require_the_password(): void
    {
        $u = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        $this->actingAs($u, 'sanctum');
        $this->getJson('/api/v1/profile/export')->assertOk(); // default: unchanged for current clients

        $this->postJson('/api/v1/profile/export', ['password' => 'wrong'])->assertStatus(422);
        $this->postJson('/api/v1/profile/export', ['password' => 'Str0ngPassw0rd'])->assertOk()->assertJsonStructure(['data']);

        config(['privacy.export_requires_password' => true]);
        $this->getJson('/api/v1/profile/export')->assertForbidden()->assertJsonPath('error.code', 'password_required');
        $this->postJson('/api/v1/profile/export', ['password' => 'Str0ngPassw0rd'])->assertOk();
    }
}
