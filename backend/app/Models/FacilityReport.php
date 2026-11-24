<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['scope', 'stats', 'summary', 'status', 'error', 'created_by'])]
class FacilityReport extends Model
{
    protected function casts(): array
    {
        return ['scope' => 'array', 'stats' => 'array', 'summary' => 'array'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'scope' => $this->scope,
            'stats' => $this->stats,
            'summary' => $this->summary,
            'status' => $this->status,
            'error' => $this->error,
            'author' => $this->author?->name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
