<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['debate_id', 'message', 'sent_by', 'recipients', 'sent', 'failed', 'finished_at'])]
class DebatePromotion extends Model
{
    protected function casts(): array
    {
        return ['finished_at' => 'datetime'];
    }

    public function debate(): BelongsTo
    {
        return $this->belongsTo(Debate::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'recipients' => $this->recipients,
            'sent' => $this->sent,
            'failed' => $this->failed,
            'finished' => $this->finished_at !== null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
