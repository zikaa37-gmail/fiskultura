<?php

namespace App\Services;

use App\Models\Debate;
use App\Models\Question;
use App\Models\User;

class Assignments
{
    public function moderator(): ?User
    {
        return $this->leastBusy(
            [User::EDITOR],
            fn (int $userId) => Debate::where('moderator_id', $userId)->whereIn('status', [Debate::PROPOSED, Debate::OPEN])->count(),
        ) ?? $this->leastBusy(
            [User::ADMIN],
            fn (int $userId) => Debate::where('moderator_id', $userId)->whereIn('status', [Debate::PROPOSED, Debate::OPEN])->count(),
        );
    }

    public function answerer(): ?User
    {
        return $this->leastBusy(
            [User::AUTHOR, User::EDITOR],
            fn (int $userId) => Question::where('assigned_to', $userId)->where('status', Question::PENDING)->count(),
        );
    }

    private function leastBusy(array $roles, callable $load): ?User
    {
        return User::whereIn('role', $roles)
            ->whereNull('blocked_at')
            ->orderBy('id')
            ->get()
            ->sortBy(fn (User $user) => [$load($user->id), $user->id])
            ->first();
    }
}
