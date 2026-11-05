<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

#[Fillable(['slug', 'category', 'title', 'body', 'original', 'answer', 'regulation_keys', 'valid_on', 'status', 'editor_note', 'asked_by', 'answered_by', 'published_at'])]
class Question extends Model
{
    public const CATEGORIES = ['norma', 'ocenjivanje', 'oslobadjanje', 'bezbednost', 'takmicenja', 'zdravitas', 'es-dnevnik', 'planiranje', 'ostalo'];

    public const PENDING = 'pending';

    public const PUBLISHED = 'published';

    public const REJECTED = 'rejected';

    public const STATUSES = [self::PENDING, self::PUBLISHED, self::REJECTED];

    protected $attributes = [
        'status' => self::PENDING,
    ];

    protected function casts(): array
    {
        return [
            'regulation_keys' => 'array',
            'valid_on' => 'date',
            'published_at' => 'datetime',
            'asker_notified_at' => 'datetime',
        ];
    }

    public function asker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asked_by');
    }

    public function answerer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'answered_by');
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('status', self::PUBLISHED)->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function isUntouched(): bool
    {
        return $this->answered_by === null && $this->created_at?->equalTo($this->updated_at);
    }

    public function regulations(): Collection
    {
        $keys = $this->regulation_keys ?? [];
        if ($keys === []) {
            return collect();
        }

        $found = Regulation::whereIn('key', $keys)->get()->keyBy('key');

        return collect($keys)->map(fn (string $key) => $found->get($key))->filter()->values();
    }

    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::limit(Str::slug($title), 140, '') ?: 'pitanje';
        $slug = $base;
        $suffix = 2;

        while (self::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
