<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'debate_id', 'banned_by', 'reason', 'until', 'lifted_at', 'lifted_by'])]
class DebateBan extends Model
{
    protected function casts(): array
    {
        return ['until' => 'datetime', 'lifted_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function debate(): BelongsTo
    {
        return $this->belongsTo(Debate::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('lifted_at')->where(fn (Builder $inner) => $inner->whereNull('until')->orWhere('until', '>', now()));
    }

    public function scopeAffecting(Builder $query, Debate $debate): Builder
    {
        return $query->where(fn (Builder $inner) => $inner->whereNull('debate_id')->orWhere('debate_id', $debate->id));
    }

    public static function activeFor(User $user, ?Debate $debate = null): ?self
    {
        return self::active()
            ->where('user_id', $user->id)
            ->when($debate, fn (Builder $query) => $query->affecting($debate), fn (Builder $query) => $query->whereNull('debate_id'))
            ->orderByRaw('until is null desc')
            ->orderByDesc('until')
            ->first();
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'user' => $this->user ? ['id' => $this->user->id, 'name' => $this->user->name] : null,
            'scope' => $this->debate_id ? 'debate' : 'all',
            'debate' => $this->debate ? ['slug' => $this->debate->slug, 'title' => $this->debate->title] : null,
            'reason' => $this->reason,
            'until' => $this->until?->toIso8601String(),
            'moderator' => $this->moderator?->name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    public function message(): string
    {
        $when = $this->until ? 'do '.$this->until->copy()->setTimezone('Europe/Belgrade')->format('j. n. Y. H:i') : 'trajno';
        $where = $this->debate_id ? 'u ovoj temi' : 'u stručnim debatama';

        return "Moderator vam je zabranio pisanje {$where} ({$when}). Razlog: {$this->reason}";
    }
}
