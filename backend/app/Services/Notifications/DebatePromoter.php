<?php

namespace App\Services\Notifications;

use App\Models\DebatePromotion;
use App\Models\NotificationLog;
use App\Models\Subscription;
use App\Services\Inbox;
use Illuminate\Database\Eloquent\Builder;
use Throwable;

class DebatePromoter
{
    private array $channels = [];

    public function __construct(iterable $channels)
    {
        foreach ($channels as $channel) {
            $this->channels[$channel->name()] = $channel;
        }
    }

    public static function recipients(?DebatePromotion $promotion = null): Builder
    {
        return Subscription::active()
            ->when($promotion, fn (Builder $query) => $query->whereNotIn('id', NotificationLog::where('debate_promotion_id', $promotion->id)->whereNotNull('subscription_id')->select('subscription_id')))
            ->orderBy('id');
    }

    public function run(int $budget, bool $dry = false): array
    {
        $result = ['sent' => 0, 'failed' => 0, 'limited' => false];

        foreach (DebatePromotion::with('debate.moderator')->whereNull('finished_at')->orderBy('id')->get() as $promotion) {
            foreach (self::recipients($promotion)->get() as $subscription) {
                if ($budget <= 0) {
                    $result['limited'] = true;

                    return $result;
                }
                $budget--;
                if ($dry) {
                    $result['sent']++;

                    continue;
                }
                $this->deliver($promotion, $subscription, $result);
            }
            if (! $dry) {
                $promotion->forceFill(['finished_at' => now()])->save();
            }
        }

        return $result;
    }

    private function deliver(DebatePromotion $promotion, Subscription $subscription, array &$result): void
    {
        $error = null;
        try {
            $channel = $this->channels[$subscription->channel] ?? throw new \RuntimeException("Kanal {$subscription->channel} ne postoji.");
            $notice = Notice::forDebate($subscription, $promotion);
            $channel->send($subscription, $notice);
            $result['sent']++;
            app(Inbox::class)->recordNotice($subscription, $notice);
        } catch (Throwable $caught) {
            $error = $caught;
            $result['failed']++;
        }

        NotificationLog::create([
            'subscription_id' => $subscription->id,
            'debate_promotion_id' => $promotion->id,
            'kind' => 'debate',
            'channel' => $subscription->channel,
            'status' => $error ? NotificationLog::FAILED : NotificationLog::SENT,
            'error' => $error ? mb_substr($error->getMessage(), 0, 1000) : null,
            'created_at' => now(),
        ]);
        $promotion->increment($error ? 'failed' : 'sent');
    }
}
