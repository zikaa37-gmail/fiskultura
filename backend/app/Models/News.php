<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable(['slug', 'title', 'summary', 'body', 'category', 'organization_id', 'source_url', 'source_type', 'source_published_at', 'status', 'published_at', 'featured', 'cover_image', 'author_id'])]
class News extends Model
{
    public const CATEGORIES = ['vest', 'seminar', 'takmicenje', 'propis', 'konkurs', 'saopstenje', 'ostalo'];

    public const SOURCE_TYPES = ['sajt', 'facebook', 'instagram', 'youtube', 'mediji', 'ostalo'];

    public const DRAFT = 'draft';

    public const PUBLISHED = 'published';

    protected function casts(): array
    {
        return [
            'source_published_at' => 'date',
            'published_at' => 'datetime',
            'featured' => 'boolean',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('status', self::PUBLISHED)->where('published_at', '<=', now());
    }

    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::limit(Str::slug($title), 140, '') ?: 'vest';
        $slug = $base;
        $suffix = 2;

        while (self::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    public static function sourceTypeFor(?string $url, ?Organization $organization = null): ?string
    {
        if (! $url) {
            return null;
        }

        $host = Str::after(Str::lower((string) parse_url($url, PHP_URL_HOST)), 'www.');
        $organizationHost = $organization?->website ? Str::after(Str::lower((string) parse_url($organization->website, PHP_URL_HOST)), 'www.') : null;

        return match (true) {
            str_contains($host, 'facebook.com') || str_contains($host, 'fb.com') => 'facebook',
            str_contains($host, 'instagram.com') => 'instagram',
            str_contains($host, 'youtube.com') || str_contains($host, 'youtu.be') => 'youtube',
            $organizationHost !== null && $host === $organizationHost => 'sajt',
            default => 'mediji',
        };
    }
}
