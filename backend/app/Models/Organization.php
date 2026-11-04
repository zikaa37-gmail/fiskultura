<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'name', 'short_name', 'type', 'level', 'city', 'website', 'social', 'email', 'description', 'status', 'last_activity', 'parent_id', 'member_source'])]
class Organization extends Model
{
    public const TYPES = ['strukovno-udruzenje', 'skolski-sport', 'institucija', 'fakultet', 'sindikat', 'ostalo'];

    public const LEVELS = ['republički', 'pokrajinski', 'okružni', 'gradski', 'opštinski'];

    public const STATUSES = ['aktivno', 'neaktivno', 'nepoznato'];

    protected function casts(): array
    {
        return [
            'social' => 'array',
            'link_checks' => 'array',
            'last_activity' => 'date',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function news(): HasMany
    {
        return $this->hasMany(News::class);
    }
}
