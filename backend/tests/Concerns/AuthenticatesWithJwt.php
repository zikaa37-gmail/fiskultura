<?php

namespace Tests\Concerns;

use App\Models\User;
use App\Services\JwtService;

trait AuthenticatesWithJwt
{
    protected function withJwt(User $user): static
    {
        return $this->withToken(app(JwtService::class)->issueAccessToken($user));
    }
}
