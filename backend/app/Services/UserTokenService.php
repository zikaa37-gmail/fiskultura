<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserToken;
use Illuminate\Support\Str;

class UserTokenService
{
    public function issue(User $user, string $purpose, int $ttlMinutes): string
    {
        $user->userTokens()->where('purpose', $purpose)->whereNull('used_at')->update(['used_at' => now()]);

        $token = Str::random(64);

        $user->userTokens()->create([
            'purpose' => $purpose,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addMinutes($ttlMinutes),
        ]);

        return $token;
    }

    public function peek(string $token, string $purpose): ?User
    {
        $stored = UserToken::where('token_hash', hash('sha256', $token))->where('purpose', $purpose)->first();

        return $stored && $stored->isValid() ? $stored->user : null;
    }

    public function consume(string $token, string $purpose): ?User
    {
        $stored = UserToken::where('token_hash', hash('sha256', $token))->where('purpose', $purpose)->first();

        if (! $stored || ! $stored->isValid()) {
            return null;
        }

        $stored->update(['used_at' => now()]);

        return $stored->user;
    }
}
