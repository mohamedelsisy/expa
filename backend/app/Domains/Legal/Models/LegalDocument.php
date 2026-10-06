<?php

namespace App\Domains\Legal\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Enums\ContentStatus;
use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * One VERSION of a legal document. Exactly one version per slug is published at a time: publishing a new version
 * archives the previous one (history is kept, consents keep pointing at the version number they were given under).
 */
class LegalDocument extends Model
{
    use Auditable, HasSource, HasTranslations, SoftDeletes;
    use HasContentLifecycle {
        transitionTo as protected baseTransitionTo;
    }

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['title', 'body'];

    public array $requiredTranslatableFields = ['title', 'body'];

    // A source is optional for legal text (the reference to counsel's approval may go there) but never blocks publishing.
    protected bool $requiresSource = false;

    public static function contentAttributes(): array
    {
        return ['slug', 'version', 'sort_order', 'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    /** Latest published version of a document, or null when none was ever published. */
    public static function currentPublished(string $slug): ?self
    {
        return static::published()->where('slug', $slug)->with('translations')
            ->orderByDesc('published_at')->orderByDesc('id')->first();
    }

    public function transitionTo(ContentStatus $to): static
    {
        return DB::transaction(function () use ($to) {
            $this->baseTransitionTo($to);

            if ($to === ContentStatus::Published) {
                // Supersede: older published versions of the same document leave the public view.
                static::published()->where('slug', $this->slug)->whereKeyNot($this->getKey())->get()
                    ->each(fn (self $old) => $old->transitionTo(ContentStatus::Archived));
            }

            return $this;
        });
    }
}
