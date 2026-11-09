<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable(['email', 'user_id', 'categories', 'organization_ids', 'frequency', 'channel'])]
class Subscription extends Model
{
    public const INSTANT = 'instant';

    public const WEEKLY = 'weekly';

    public const FREQUENCIES = [self::INSTANT, self::WEEKLY];

    public const CONFIRM = 'confirm';

    public const MANAGE = 'manage';

    public const UNSUBSCRIBE = 'unsubscribe';

    protected $attributes = [
        'frequency' => self::INSTANT,
        'channel' => 'mail',
    ];

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'organization_ids' => 'array',
            'confirmed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
            'confirmation_sent_at' => 'datetime',
            'last_digest_at' => 'datetime',
        ];
    }

    public static function ensureFor(User $user): self
    {
        $subscription = self::firstOrNew(['email' => Str::lower($user->email)]);
        if (! $subscription->exists) {
            $subscription->fill(['frequency' => self::INSTANT, 'categories' => [], 'organization_ids' => []]);
            $subscription->forceFill(['last_digest_at' => now()]);
        }
        $subscription->user_id ??= $user->id;
        $subscription->confirmed_at ??= now();
        $subscription->save();

        return $subscription;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotNull('confirmed_at')->whereNull('unsubscribed_at');
    }

    public function isActive(): bool
    {
        return $this->confirmed_at !== null && $this->unsubscribed_at === null;
    }

    public function token(string $purpose): string
    {
        return hash_hmac('sha256', "subscription|{$purpose}|{$this->id}|{$this->email}", (string) config('app.key'));
    }

    public function hasToken(string $purpose, ?string $token): bool
    {
        return $token !== null && hash_equals($this->token($purpose), $token);
    }

    public function link(string $path, string $purpose): string
    {
        return rtrim((string) config('app.frontend_url'), '/')."/{$path}?id={$this->id}&token={$this->token($purpose)}";
    }

    public function follows(News $news): bool
    {
        $categories = $this->categories ?? [];
        $organizations = $this->organization_ids ?? [];

        return ($categories === [] || in_array($news->category, $categories, true))
            && ($organizations === [] || $news->organization_id === null || in_array((int) $news->organization_id, array_map('intval', $organizations), true));
    }
}
