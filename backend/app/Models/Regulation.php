<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Fillable(['key', 'title', 'kind', 'areas', 'gazette', 'url', 'valid_from', 'valid_to', 'summary', 'verification', 'verification_note', 'sort'])]
class Regulation extends Model
{
    public const KINDS = ['zakon', 'nacrt', 'pravilnik', 'program', 'protokol', 'uputstvo', 'kalendar', 'strategija', 'ostalo'];

    public const AREAS = ['program', 'planiranje', 'ocenjivanje', 'oslobadjanje', 'kalendar', 'norma', 'usavrsavanje', 'evidencija', 'bezbednost', 'podaci', 'prostor-oprema', 'skolski-sport'];

    public const VERIFICATIONS = ['verified', 'secondary', 'unverified'];

    protected $attributes = [
        'version' => 1,
        'sort' => 0,
        'verification' => 'unverified',
    ];

    private const TRACKED = ['title', 'kind', 'areas', 'gazette', 'url', 'valid_from', 'valid_to', 'summary', 'verification', 'verification_note'];

    protected function casts(): array
    {
        return [
            'areas' => 'array',
            'valid_from' => 'date',
            'valid_to' => 'date',
        ];
    }

    public function versions(): HasMany
    {
        return $this->hasMany(RegulationVersion::class)->orderByDesc('version');
    }

    public function revise(array $attributes, ?User $by = null, ?string $note = null): bool
    {
        $before = $this->snapshot();
        $this->fill($attributes);
        if (! $this->isDirty(self::TRACKED)) {
            $this->save();

            return false;
        }

        DB::transaction(function () use ($before, $by, $note) {
            $this->versions()->create([
                'version' => $this->version,
                'data' => $before,
                'note' => $note,
                'changed_by' => $by?->id,
                'created_at' => now(),
            ]);
            $this->version++;
            $this->save();
        });

        return true;
    }

    public function isUntouched(): bool
    {
        return $this->version === 1 && $this->created_at?->equalTo($this->updated_at);
    }

    private function snapshot(): array
    {
        return [
            'title' => $this->getOriginal('title'),
            'kind' => $this->getOriginal('kind'),
            'areas' => $this->getOriginal('areas'),
            'gazette' => $this->getOriginal('gazette'),
            'url' => $this->getOriginal('url'),
            'valid_from' => $this->getOriginal('valid_from')?->toDateString(),
            'valid_to' => $this->getOriginal('valid_to')?->toDateString(),
            'summary' => $this->getOriginal('summary'),
            'verification' => $this->getOriginal('verification'),
            'verification_note' => $this->getOriginal('verification_note'),
        ];
    }
}
