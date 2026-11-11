<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['slug', 'title', 'description', 'status', 'moderator_id', 'created_by', 'summary_draft', 'summary_draft_at', 'summary_draft_posts', 'summary', 'summary_approved_at', 'summary_posts', 'summary_guidance', 'posts_count', 'last_post_at', 'closed_at'])]
class Debate extends Model
{
    public const PROPOSED = 'proposed';

    public const OPEN = 'open';

    public const CLOSED = 'closed';

    public const REJECTED = 'rejected';

    public const STATUSES = [self::PROPOSED, self::OPEN, self::CLOSED, self::REJECTED];

    public const PUBLIC_STATUSES = [self::OPEN, self::CLOSED];

    protected $attributes = [
        'status' => self::PROPOSED,
    ];

    protected function casts(): array
    {
        return [
            'summary_draft' => 'array',
            'summary_draft_at' => 'datetime',
            'summary' => 'array',
            'summary_approved_at' => 'datetime',
            'last_post_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(DebatePost::class);
    }

    public function reopenRequests(): HasMany
    {
        return $this->hasMany(DebateReopenRequest::class);
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(DebatePromotion::class);
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->whereIn('status', self::PUBLIC_STATUSES);
    }

    public function canModerate(?User $user): bool
    {
        return $user !== null && ($user->isAdmin() || $this->moderator_id === $user->id);
    }

    public function refreshCounters(): void
    {
        $visible = $this->posts()->whereNull('hidden_at');
        $this->forceFill([
            'posts_count' => (clone $visible)->count(),
            'last_post_at' => (clone $visible)->max('created_at'),
        ])->save();
    }

    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::limit(Str::slug($title), 140, '') ?: 'tema';
        $slug = $base;
        $suffix = 2;

        while (self::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
