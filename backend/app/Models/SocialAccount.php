<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['provider', 'api', 'username', 'external_id', 'token', 'token_expires_at', 'connected_by'])]
#[Hidden(['token'])]
class SocialAccount extends Model
{
    public const INSTAGRAM = 'instagram';

    public const FACEBOOK = 'facebook';

    protected function casts(): array
    {
        return [
            'token' => 'encrypted',
            'token_expires_at' => 'datetime',
        ];
    }

    public static function instagram(): self
    {
        return self::firstOrNew(['provider' => self::INSTAGRAM]);
    }

    public static function facebook(): self
    {
        return self::firstOrNew(['provider' => self::FACEBOOK]);
    }

    public function viaFacebook(): bool
    {
        return $this->api === 'facebook';
    }

    public function apiBase(): string
    {
        return $this->viaFacebook() ? 'https://graph.facebook.com' : 'https://graph.instagram.com';
    }

    public function connected(): bool
    {
        return (bool) $this->token;
    }

    public function present(): array
    {
        return [
            'connected' => $this->connected(),
            'username' => $this->username,
            'token_expires_at' => $this->token_expires_at?->toIso8601String(),
            'via_facebook' => $this->viaFacebook(),
        ];
    }
}
