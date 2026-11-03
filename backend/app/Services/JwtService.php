<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use stdClass;
use Throwable;

class JwtService
{
    private const ALGORITHM = 'HS256';

    public function issueAccessToken(User $user): string
    {
        $now = time();

        return JWT::encode([
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + (int) config('auth_jwt.access_ttl_minutes') * 60,
        ], $this->secret(), self::ALGORITHM);
    }

    public function decode(string $token): ?stdClass
    {
        try {
            return JWT::decode($token, new Key($this->secret(), self::ALGORITHM));
        } catch (Throwable) {
            return null;
        }
    }

    private function secret(): string
    {
        return (string) config('auth_jwt.secret');
    }
}
