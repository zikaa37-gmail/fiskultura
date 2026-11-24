<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\Notifications\Notice;
use Illuminate\Support\Collection;
use Throwable;

class Inbox
{
    public function record(User|iterable|null $users, string $kind, string $title, ?string $body = null, ?string $url = null, array $channels = ['mail']): void
    {
        $users = $users instanceof User ? collect([$users]) : collect($users ?? []);

        foreach ($users->filter()->unique('id') as $user) {
            try {
                UserNotification::create([
                    'user_id' => $user->id,
                    'kind' => $kind,
                    'title' => mb_substr($title, 0, 255),
                    'body' => $body,
                    'url' => $url,
                    'channels' => $channels,
                    'created_at' => now(),
                ]);
            } catch (Throwable $error) {
                report($error);
            }
        }
    }

    public function recordForEmails(iterable $emails, string $kind, string $title, ?string $body = null, ?string $url = null, array $channels = ['mail']): void
    {
        $this->record($this->usersByEmail($emails), $kind, $title, $body, $url, $channels);
    }

    public function recordNotice(Subscription $subscription, Notice $notice): void
    {
        if (! $subscription->user_id) {
            return;
        }

        $titles = collect($notice->items)->pluck('title')->take(5)->implode(' · ');
        $url = count($notice->items) === 1 ? parse_url($notice->items[0]['url'], PHP_URL_PATH) : '/vesti';

        $this->record(
            $subscription->user,
            $notice->kind === 'debate' ? 'debate_invitation' : 'news',
            $notice->subject,
            trim($notice->intro.($titles ? "\n{$titles}" : '')),
            $url ?: null,
            [$subscription->channel],
        );
    }

    private function usersByEmail(iterable $emails): Collection
    {
        $list = collect($emails)->filter()->map(fn (string $email) => mb_strtolower($email))->unique()->values();

        return $list->isEmpty() ? collect() : User::whereIn('email', $list)->get();
    }
}
