<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'role', 'member_status', 'school', 'municipality', 'district', 'source', 'password'])]
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
        static::saved(function (User $user) {
            if ($user->email_verified_at && ($user->wasRecentlyCreated || $user->wasChanged('email_verified_at'))) {
                Subscription::ensureFor($user);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'blocked_at' => 'datetime',
            'directory_consent_at' => 'datetime',
            'surveys_consent_at' => 'datetime',
            'last_active_at' => 'datetime',
            'password' => 'hashed',
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

    public function isBlocked(): bool
    {
        return $this->blocked_at !== null;
    }
}
