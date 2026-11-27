<?php

namespace App\Models;

use App\Services\Facilities\FacilityCatalog;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['institution_id', 'user_id', 'facilities', 'status', 'review_note', 'reviewed_by', 'reviewed_at'])]
class FacilitySubmission extends Model
{
    public const PENDING = 'pending';

    public const APPROVED = 'approved';

    public const REJECTED = 'rejected';

    protected function casts(): array
    {
        return ['facilities' => 'array', 'reviewed_at' => 'datetime'];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function present(): array
    {
        $catalog = app(FacilityCatalog::class);

        return [
            'id' => $this->id,
            'status' => $this->status,
            'facilities' => $this->facilities,
            'proposed' => $catalog->describe($this->facilities),
            'current' => $catalog->describe($this->institution?->facilities),
            'note' => $this->facilities['napomena'] ?? null,
            'institution' => $this->institution ? ['id' => $this->institution->id, 'name' => $this->institution->name, 'place' => $this->institution->place, 'type' => $this->institution->type] : null,
            'user' => $this->user ? ['id' => $this->user->id, 'name' => $this->user->name, 'school' => $this->user->school, 'email' => $this->user->email] : null,
            'review_note' => $this->review_note,
            'reviewer' => $this->reviewer?->name,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
