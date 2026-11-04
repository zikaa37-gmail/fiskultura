<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['regulation_id', 'version', 'data', 'note', 'changed_by', 'created_at'])]
class RegulationVersion extends Model
{
    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function regulation(): BelongsTo
    {
        return $this->belongsTo(Regulation::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
