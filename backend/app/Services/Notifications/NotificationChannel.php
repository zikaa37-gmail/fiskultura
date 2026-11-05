<?php

namespace App\Services\Notifications;

use App\Models\Subscription;

interface NotificationChannel
{
    public function name(): string;

    public function send(Subscription $subscription, Notice $notice): void;
}
