<?php

namespace App\Services;

use App\Models\Debate;
use App\Models\DebateModeratorLog;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class Assignments
{
    public function moderator(): ?User
    {
        $active = fn (int $userId) => self::activeDebates($userId);

        return $this->leastBusy(User::where('moderator_pool', true), $active)
            ?? $this->leastBusy(User::where('role', User::EDITOR), $active)
            ?? $this->leastBusy(User::where('role', User::ADMIN), $active);
    }

    public function answerer(): ?User
    {
        return $this->leastBusy(
            User::whereIn('role', [User::AUTHOR, User::EDITOR]),
            fn (int $userId) => Question::where('assigned_to', $userId)->where('status', Question::PENDING)->count(),
        );
    }

    public static function activeDebates(int $userId): int
    {
        return Debate::where('moderator_id', $userId)->whereIn('status', [Debate::PROPOSED, Debate::OPEN])->count();
    }

    public function logModerator(Debate $debate, ?int $previous, ?User $by, string $reason): void
    {
        if ($debate->moderator_id === $previous && $reason !== DebateModeratorLog::AUTO && $reason !== DebateModeratorLog::CREATOR) {
            return;
        }

        DebateModeratorLog::create([
            'debate_id' => $debate->id,
            'moderator_id' => $debate->moderator_id,
            'previous_moderator_id' => $previous,
            'assigned_by' => $by?->id,
            'reason' => $reason,
            'created_at' => now(),
        ]);
    }

    private function leastBusy(Builder $candidates, callable $load): ?User
    {
        return $candidates
            ->whereNull('blocked_at')
            ->orderBy('id')
            ->get()
            ->sortBy(fn (User $user) => [$load($user->id), $user->id])
            ->first();
    }
}
