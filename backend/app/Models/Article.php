<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable(['slug', 'kind', 'topic_id', 'topic_proposal', 'debate_id', 'author_id', 'title', 'summary', 'body', 'status', 'editor_note', 'featured', 'submitted_at', 'reviewed_by', 'published_at'])]
class Article extends Model
{
    public const COLUMN = 'kolumna';

    public const ARTICLE = 'clanak';

    public const KINDS = [self::COLUMN, self::ARTICLE];

    public const DRAFT = 'draft';

    public const SUBMITTED = 'submitted';

    public const RETURNED = 'returned';

    public const PUBLISHED = 'published';

    public const STATUSES = [self::DRAFT, self::SUBMITTED, self::RETURNED, self::PUBLISHED];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'submitted_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function debate(): BelongsTo
    {
        return $this->belongsTo(Debate::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('status', self::PUBLISHED)->where('published_at', '<=', now());
    }

    public function isVisible(): bool
    {
        return $this->status === self::PUBLISHED && $this->published_at !== null && $this->published_at->lte(now());
    }

    public function isEditableBy(User $user): bool
    {
        return $user->hasRole(User::EDITOR, User::ADMIN)
            || ($this->author_id === $user->id && in_array($this->status, [self::DRAFT, self::RETURNED], true));
    }

    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::limit(Str::slug($title), 140, '') ?: 'tekst';
        $slug = $base;
        $suffix = 2;

        while (self::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
