<?php

namespace App\Models;

use App\Services\Facilities\FacilityCatalog;
use App\Support\SerbianText;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['type', 'name', 'place', 'municipality', 'district', 'region', 'address', 'postal_code', 'phone', 'email', 'website', 'fax', 'director', 'pib', 'registry_number', 'bank_accounts', 'extra', 'facilities', 'facilities_origin', 'facilities_source', 'facilities_updated_at', 'facilities_updated_by', 'source'])]
class Institution extends Model
{
    public const PRIMARY = 'osnovna';

    public const SECONDARY = 'srednja';

    public const FACULTY = 'fakultet';

    public const TYPES = [self::PRIMARY, self::SECONDARY, self::FACULTY];

    public const REGIONS = ['Srbija', 'Republika Srpska'];

    protected function casts(): array
    {
        return ['extra' => 'array', 'facilities' => 'array', 'facilities_origin' => 'array', 'facilities_updated_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::saving(fn (Institution $institution) => $institution->search = SerbianText::fold(implode(' ', array_filter([$institution->name, $institution->place, $institution->municipality, $institution->district]))));
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FacilitySubmission::class);
    }

    public function applyFacilities(array $facilities, string $origin, string $source, ?User $by = null): void
    {
        $groups = array_keys(array_diff_key($facilities, ['napomena' => true]));
        $this->fill([
            'facilities' => [...($this->facilities ?? []), ...$facilities] ?: null,
            'facilities_origin' => [...($this->facilities_origin ?? []), ...array_fill_keys($groups, $origin)],
            'facilities_source' => $source,
            'facilities_updated_at' => now(),
            'facilities_updated_by' => $by?->id,
        ])->save();
    }

    public function scopeMatching(Builder $query, ?string $text): Builder
    {
        foreach (array_slice(array_filter(explode(' ', SerbianText::fold($text))), 0, 6) as $word) {
            $query->where('search', 'like', "%{$word}%");
        }

        return $query;
    }

    public function label(): string
    {
        return $this->place && ! str_contains(SerbianText::fold($this->name), SerbianText::fold($this->place)) ? "{$this->name}, {$this->place}" : $this->name;
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'name' => $this->name,
            'label' => $this->label(),
            'place' => $this->place,
            'municipality' => $this->municipality,
            'district' => $this->district,
            'region' => $this->region,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'fax' => $this->fax,
            'director' => $this->director,
            'pib' => $this->pib,
            'registry_number' => $this->registry_number,
            'bank_accounts' => $this->bank_accounts ? array_values(array_filter(array_map('trim', preg_split('/[
;,]+/', $this->bank_accounts)))) : [],
            'extra' => $this->extra ?? (object) [],
            'facilities' => $this->facilities ?? (object) [],
            'facility_flags' => app(FacilityCatalog::class)->flags($this->facilities),
            'facility_known' => app(FacilityCatalog::class)->known($this->facilities),
            'facilities_origin' => $this->facilities_origin ?? (object) [],
            'pending_submissions' => (int) ($this->pending_submissions_count ?? 0),
            'facilities_source' => $this->facilities_source,
            'facilities_updated_at' => $this->facilities_updated_at?->toIso8601String(),
        ];
    }
}
