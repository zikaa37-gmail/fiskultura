<?php

use App\Models\News;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        News::query()->whereNull('notified_at')->where('published_at', '<=', now())->update(['notified_at' => now()]);

        User::query()->whereNotNull('email_verified_at')->whereNull('blocked_at')->each(fn (User $user) => Subscription::ensureFor($user));
    }

    public function down(): void {}
};
