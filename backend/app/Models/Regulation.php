<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

#[Fillable(['key', 'title', 'kind', 'areas', 'gazette', 'url', 'valid_from', 'valid_to', 'replaced_by', 'summary', 'verification', 'verification_note', 'sort'])]
class Regulation extends Model
{
    public const KINDS = ['zakon', 'nacrt', 'pravilnik', 'program', 'protokol', 'uputstvo', 'kalendar', 'strategija', 'ostalo'];

    public const AREAS = ['program', 'planiranje', 'ocenjivanje', 'oslobadjanje', 'kalendar', 'norma', 'usavrsavanje', 'evidencija', 'bezbednost', 'podaci', 'prostor-oprema', 'skolski-sport'];

    public const VERIFICATIONS = ['verified', 'secondary', 'unverified'];

    public const REVIEW_MONTHS = 6;

    public const IN_FORCE = 'vazi';

    public const UPCOMING = 'najava';

    public const DRAFT = 'nacrt';

    public const EXPIRED = 'prestao';

    public const PIS_ELI = '#^https://pravno-informacioni-sistem\.rs/eli/(rep/[a-z0-9/]+)/reg/?$#';

    protected $attributes = [
        'version' => 1,
        'sort' => 0,
        'verification' => 'unverified',
    ];

    private const TRACKED = ['title', 'kind', 'areas', 'gazette', 'url', 'valid_from', 'valid_to', 'replaced_by', 'summary', 'verification', 'verification_note'];

    protected function casts(): array
    {
        return [
            'areas' => 'array',
            'replaced_by' => 'array',
            'valid_from' => 'date',
            'valid_to' => 'date',
            'pis_checked_at' => 'datetime',
            'change_detected_at' => 'datetime',
            'checked_at' => 'datetime',
        ];
    }

    public function status(?Carbon $on = null): string
    {
        $on ??= Carbon::today();

        return match (true) {
            $this->kind === 'nacrt' => self::DRAFT,
            $this->valid_to !== null && $this->valid_to->lt($on) => self::EXPIRED,
            $this->valid_from !== null && $this->valid_from->gt($on) => self::UPCOMING,
            default => self::IN_FORCE,
        };
    }

    public function eliPath(): ?string
    {
        return $this->url && preg_match(self::PIS_ELI, $this->url, $match) ? $match[1] : null;
    }

    public function checker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function markChecked(User $by): void
    {
        $this->forceFill(['checked_at' => now(), 'checked_by' => $by->id, 'change_detected_at' => null, 'change_detail' => null]);
        $this->timestamps = false;
        $this->save();
        $this->timestamps = true;
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
            'replaced_by' => $this->getOriginal('replaced_by'),
            'summary' => $this->getOriginal('summary'),
            'verification' => $this->getOriginal('verification'),
            'verification_note' => $this->getOriginal('verification_note'),
        ];
    }
}
