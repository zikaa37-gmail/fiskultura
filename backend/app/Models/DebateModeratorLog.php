<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['debate_id', 'moderator_id', 'previous_moderator_id', 'assigned_by', 'reason', 'created_at'])]
class DebateModeratorLog extends Model
{
    public const UPDATED_AT = null;

    public const AUTO = 'auto';

    public const MANUAL = 'manual';

    public const CREATOR = 'creator';

    protected $table = 'debate_moderator_log';

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function debate(): BelongsTo
    {
        return $this->belongsTo(Debate::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    public function previous(): BelongsTo
    {
        return $this->belongsTo(User::class, 'previous_moderator_id');
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
