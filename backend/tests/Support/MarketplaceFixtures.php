<?php

namespace Tests\Support;

use App\Domains\Access\Models\Role;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Models\User;

/** TEST DATA ONLY. Obviously fake providers; nothing here may ever be used by a seeder. */
trait MarketplaceFixtures
{
    private int $seq = 0;

    protected function member(array $over = []): User
    {
        return User::factory()->create(array_replace(['created_at' => now()->subDays(10)], $over));
    }

    protected function staff(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);

        return $u;
    }

    protected function provider(array $over = [], ?User $owner = null, bool $published = true): ServiceProvider
    {
        $this->seq++;
        $p = new ServiceProvider(array_replace([
            'slug' => 'test-provider-'.$this->seq, 'category' => 'translator', 'display_name' => 'Test Provider '.$this->seq,
            'languages' => ['ar', 'it'], 'contact_email' => "provider{$this->seq}@example.test", 'contact_phone' => '+39 000 000 000'.$this->seq,
            'website' => 'https://provider.example.test', 'serves_online' => true,
        ], $over));
        if ($owner) {
            $p->user_id = $owner->id;
            $owner->roles()->syncWithoutDetaching([Role::where('key', 'provider')->value('id')]);
        }
        $p->save();
        $p->setTranslations(['ar' => ['headline' => 'مترجم تجريبي', 'description' => 'وصف'], 'en' => ['headline' => 'Test translator', 'description' => 'Description']]);
        if ($published) {
            $p->forceFill(['status' => 'published', 'published_at' => now()])->save();
        }

        return $p->fresh();
    }
}
