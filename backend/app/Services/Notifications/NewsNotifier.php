<?php

namespace App\Services\Notifications;

use App\Models\News;
use App\Models\NotificationLog;
use App\Models\Subscription;
use App\Services\Inbox;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Throwable;

class NewsNotifier
{
    private array $channels = [];

    private int $budget = 0;

    public function __construct(iterable $channels)
    {
        foreach ($channels as $channel) {
            $this->channels[$channel->name()] = $channel;
        }
    }

    public function run(bool $dry = false, ?Carbon $now = null): array
    {
        $now ??= now();
        $this->budget = $this->remainingBudget($now);
        $result = ['instant' => 0, 'weekly' => 0, 'failed' => 0, 'news' => 0, 'limited' => false];

        $this->instant($now, $dry, $result);
        if (self::digestDue($now)) {
            $this->weekly($now, $dry, $result);
        }

        return $result;
    }

    public static function digestStart(Carbon $now): Carbon
    {
        return $now->copy()->startOfWeek(Carbon::MONDAY)->setTime((int) config('notifications.digest_hour'), 0);
    }

    public static function digestDue(Carbon $now): bool
    {
        return $now->gte(self::digestStart($now));
    }

    public function remainingBudget(Carbon $now): int
    {
        $sent = NotificationLog::where('created_at', '>', $now->copy()->subHour())->count();

        return max(0, (int) config('notifications.hourly_limit') - $sent);
    }

    public function record(?Subscription $subscription, string $kind, ?News $news = null, ?Throwable $error = null): void
    {
        NotificationLog::create([
            'subscription_id' => $subscription?->id,
            'news_id' => $news?->id,
            'kind' => $kind,
            'channel' => $subscription?->channel ?? 'mail',
            'status' => $error ? NotificationLog::FAILED : NotificationLog::SENT,
            'error' => $error ? mb_substr($error->getMessage(), 0, 1000) : null,
            'created_at' => now(),
        ]);
    }

    private function instant(Carbon $now, bool $dry, array &$result): void
    {
        $pending = News::visible()
            ->with('organization')
            ->whereNull('notified_at')
            ->where('published_at', '>=', $now->copy()->subDays((int) config('notifications.instant_window_days')))
            ->orderBy('published_at')
            ->get();

        foreach ($pending as $news) {
            $result['news']++;
            $done = NotificationLog::where('news_id', $news->id)->where('kind', Subscription::INSTANT)->pluck('subscription_id')->all();
            $recipients = Subscription::active()
                ->where('frequency', Subscription::INSTANT)
                ->whereNotIn('id', $done)
                ->orderBy('id')
                ->get()
                ->filter(fn (Subscription $subscription) => $subscription->follows($news));

            $finished = true;
            foreach ($recipients as $subscription) {
                if (! $this->deliver($subscription, Subscription::INSTANT, collect([$news]), $news, $dry, $result)) {
                    $finished = false;
                    break;
                }
            }

            if ($finished && ! $dry) {
                $news->forceFill(['notified_at' => $now])->save();
            }
            if (! $finished) {
                return;
            }
        }
    }

    private function weekly(Carbon $now, bool $dry, array &$result): void
    {
        $start = self::digestStart($now);
        $recipients = Subscription::active()
            ->where('frequency', Subscription::WEEKLY)
            ->where(fn ($query) => $query->whereNull('last_digest_at')->orWhere('last_digest_at', '<', $start))
            ->orderBy('id')
            ->get();
        if ($recipients->isEmpty()) {
            return;
        }

        $news = News::visible()
            ->with('organization')
            ->where('published_at', '>', $start->copy()->subWeek())
            ->where('published_at', '<=', $now)
            ->orderByDesc('featured')
            ->orderByDesc('published_at')
            ->get();

        foreach ($recipients as $subscription) {
            $since = max($start->copy()->subWeek(), $subscription->last_digest_at ?? $subscription->confirmed_at);
            $items = $news->filter(fn (News $item) => $item->published_at->gt($since) && $subscription->follows($item))->take(20);

            if ($items->isNotEmpty() && ! $this->deliver($subscription, Subscription::WEEKLY, $items, null, $dry, $result)) {
                return;
            }
            if (! $dry) {
                $subscription->forceFill(['last_digest_at' => $now])->save();
            }
        }
    }

    private function deliver(Subscription $subscription, string $kind, Collection $news, ?News $about, bool $dry, array &$result): bool
    {
        if ($this->budget <= 0) {
            $result['limited'] = true;

            return false;
        }
        $this->budget--;

        if ($dry) {
            $result[$kind]++;

            return true;
        }

        $channel = $this->channels[$subscription->channel] ?? null;
        try {
            if (! $channel) {
                throw new \RuntimeException("Kanal {$subscription->channel} ne postoji.");
            }
            $notice = Notice::forNews($subscription, $kind, $news);
            $channel->send($subscription, $notice);
            $this->record($subscription, $kind, $about);
            app(Inbox::class)->recordNotice($subscription, $notice);
            $result[$kind]++;
        } catch (Throwable $error) {
            $this->record($subscription, $kind, $about, $error);
            $result['failed']++;
        }

        return true;
    }
}
