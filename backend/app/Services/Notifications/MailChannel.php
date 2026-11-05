<?php

namespace App\Services\Notifications;

use App\Mail\NoticeMail;
use App\Models\Subscription;
use Illuminate\Support\Facades\Mail;

class MailChannel implements NotificationChannel
{
    public function name(): string
    {
        return 'mail';
    }

    public function send(Subscription $subscription, Notice $notice): void
    {
        Mail::to($subscription->email)->send(new NoticeMail($notice));
    }
}
