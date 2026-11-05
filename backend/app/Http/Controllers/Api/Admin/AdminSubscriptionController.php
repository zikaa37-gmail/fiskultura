<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use App\Models\Subscription;

class AdminSubscriptionController extends Controller
{
    public function stats()
    {
        $active = Subscription::active();
        $sent = fn (int $days, string $status = NotificationLog::SENT) => NotificationLog::where('status', $status)
            ->whereIn('kind', [Subscription::INSTANT, Subscription::WEEKLY])
            ->where('created_at', '>=', now()->subDays($days))
            ->count();

        return response()->json([
            'active' => (clone $active)->count(),
            'instant' => (clone $active)->where('frequency', Subscription::INSTANT)->count(),
            'weekly' => (clone $active)->where('frequency', Subscription::WEEKLY)->count(),
            'pending' => Subscription::whereNull('confirmed_at')->whereNull('unsubscribed_at')->count(),
            'unsubscribed' => Subscription::whereNotNull('unsubscribed_at')->count(),
            'unsubscribed_30d' => Subscription::where('unsubscribed_at', '>=', now()->subDays(30))->count(),
            'sent_7d' => $sent(7),
            'sent_30d' => $sent(30),
            'failed_30d' => $sent(30, NotificationLog::FAILED),
            'last_sent_at' => NotificationLog::where('status', NotificationLog::SENT)
                ->whereIn('kind', [Subscription::INSTANT, Subscription::WEEKLY])
                ->max('created_at'),
            'hourly_limit' => (int) config('notifications.hourly_limit'),
        ]);
    }
}
