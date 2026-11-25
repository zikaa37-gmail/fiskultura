<?php

namespace App\Models;

use App\Services\LinkChecker;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['organization_id', 'type', 'url', 'feed_url', 'mode'])]
class OrganizationSource extends Model
{
    public const TYPES = ['sajt', 'rss', 'facebook', 'instagram', 'youtube'];

    public const AUTO = 'auto';

    public const MANUAL = 'manual';

    public const MODES = [self::AUTO, self::MANUAL];

    protected function casts(): array
    {
        return ['last_checked_at' => 'datetime'];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function suggestions(): HasMany
    {
        return $this->hasMany(NewsSuggestion::class);
    }

    public static function syncFor(Organization $organization): int
    {
        $created = 0;
        foreach (LinkChecker::links($organization) as $field => $url) {
            $type = match ($field) {
                'website' => 'sajt',
                'facebook', 'instagram', 'youtube' => $field,
                default => null,
            };
            if (! $type || LinkChecker::statusFor($organization, $field) === LinkChecker::BROKEN) {
                continue;
            }
            $source = self::firstOrCreate(
                ['organization_id' => $organization->id, 'url' => $url],
                ['type' => $type, 'mode' => self::defaultMode($type)],
            );
            $created += $source->wasRecentlyCreated ? 1 : 0;
        }

        return $created;
    }

    public static function defaultMode(string $type): string
    {
        return in_array($type, ['sajt', 'rss'], true) ? self::AUTO : self::MANUAL;
    }
}
