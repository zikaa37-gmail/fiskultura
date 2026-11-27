<?php

namespace App\Models;

use App\Support\Phone;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'phone', 'role', 'member_status', 'school', 'schools', 'municipality', 'district', 'byline', 'bio', 'source', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const USER = 'user';

    public const AUTHOR = 'author';

    public const EDITOR = 'editor';

    public const ADMIN = 'admin';

    public const ROLES = [self::USER, self::AUTHOR, self::EDITOR, self::ADMIN];

    public const MEMBER_STATUSES = ['nastavnik-os', 'nastavnik-ss', 'pripravnik', 'student', 'penzija', 'drugo'];

    public const SOURCE_PATTERN = '/^[a-z0-9-]{2,40}$/';

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if ($user->isDirty('schools')) {
                $user->schools = self::cleanSchools($user->schools);
                $user->school = $user->schools ? mb_substr(implode('; ', array_column($user->schools, 'name')), 0, 190) : null;
            } elseif ($user->isDirty('school')) {
                $name = trim((string) $user->school);
                $user->schools = $name !== '' ? [['institution_id' => null, 'name' => $name, 'share' => 100]] : null;
            }
        });
        static::saved(function (User $user) {
            if ($user->email_verified_at && ($user->wasRecentlyCreated || $user->wasChanged('email_verified_at'))) {
                Subscription::ensureFor($user);
            }
        });
    }

    protected function phone(): Attribute
    {
        return Attribute::make(set: fn (?string $value) => Phone::format($value) ?? (trim((string) $value) ?: null));
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'blocked_at' => 'datetime',
            'moderator_pool' => 'boolean',
            'invited_at' => 'datetime',
            'directory_consent_at' => 'datetime',
            'surveys_consent_at' => 'datetime',
            'author_requested_at' => 'datetime',
            'last_active_at' => 'datetime',
            'password' => 'hashed',
            'schools' => 'array',
        ];
    }

    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    public function userTokens(): HasMany
    {
        return $this->hasMany(UserToken::class);
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ADMIN;
    }

    public function scopeInDirectory(Builder $query): Builder
    {
        return $query->whereNotNull('email_verified_at')->whereNull('blocked_at')->whereNotNull('directory_consent_at');
    }

    public static function schoolRules(): array
    {
        return [
            'schools' => ['sometimes', 'nullable', 'array', 'max:6'],
            'schools.*.name' => ['required', 'string', 'max:190'],
            'schools.*.institution_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'schools.*.share' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    public static function cleanSchools(?array $schools): ?array
    {
        $clean = collect($schools ?? [])
            ->filter(fn ($school) => is_array($school) && trim((string) ($school['name'] ?? '')) !== '')
            ->map(fn (array $school) => [
                'institution_id' => isset($school['institution_id']) ? (int) $school['institution_id'] : null,
                'name' => trim((string) $school['name']),
                'share' => min(100, max(1, (int) ($school['share'] ?? 100))),
            ])
            ->unique(fn (array $school) => $school['institution_id'] ?? mb_strtolower($school['name']))
            ->take(6)
            ->values()
            ->all();

        return $clean ?: null;
    }

    public function worksAt(Institution $institution): bool
    {
        return collect($this->schools ?? [])->contains(fn (array $school) => ($school['institution_id'] ?? null) === $institution->id);
    }

    public function isBlocked(): bool
    {
        return $this->blocked_at !== null;
    }
}
