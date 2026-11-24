<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['debate_id', 'user_id', 'kind', 'body', 'status', 'decided_by', 'decided_at', 'decision_note'])]
class DebateReopenRequest extends Model
{
    public const PENDING = 'pending';

    public const APPROVED = 'approved';

    public const REJECTED = 'rejected';

    protected $attributes = [
        'status' => self::PENDING,
    ];

    protected function casts(): array
    {
        return ['decided_at' => 'datetime'];
    }

    public function debate(): BelongsTo
    {
        return $this->belongsTo(Debate::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'body' => $this->body,
            'status' => $this->status,
            'author' => $this->user?->name ?? 'Bivši član',
            'decision_note' => $this->decision_note,
            'created_at' => $this->created_at?->toIso8601String(),
            'decided_at' => $this->decided_at?->toIso8601String(),
        ];
    }
}
