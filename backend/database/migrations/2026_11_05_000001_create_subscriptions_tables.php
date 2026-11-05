<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('email', 190)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('categories')->nullable();
            $table->json('organization_ids')->nullable();
            $table->string('frequency', 10)->default('weekly');
            $table->string('channel', 20)->default('mail');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamp('confirmation_sent_at')->nullable();
            $table->timestamp('last_digest_at')->nullable();
            $table->timestamps();

            $table->index(['frequency', 'confirmed_at', 'unsubscribed_at']);
        });

        Schema::create('notification_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->foreignId('news_id')->nullable()->constrained('news')->nullOnDelete();
            $table->string('kind', 20);
            $table->string('channel', 20);
            $table->string('status', 10);
            $table->text('error')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['kind', 'created_at']);
            $table->index(['news_id', 'subscription_id']);
        });

        Schema::table('news', function (Blueprint $table) {
            $table->timestamp('notified_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            $table->dropColumn('notified_at');
        });
        Schema::dropIfExists('notification_log');
        Schema::dropIfExists('subscriptions');
    }
};
