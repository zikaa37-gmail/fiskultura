<?php

namespace App\Providers;

use App\Services\Ai\Assistant;
use App\Services\Ai\ClaudeAssistant;
use App\Services\Notifications\MailChannel;
use App\Services\Notifications\NewsNotifier;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->tag([MailChannel::class], 'notification-channels');
        $this->app->when(NewsNotifier::class)->needs('$channels')->giveTagged('notification-channels');
        $this->app->bind(Assistant::class, fn () => new ClaudeAssistant(config('services.anthropic.key')));
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);
    }
}
