<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debate_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debate_id')->constrained('debates')->cascadeOnDelete();
            $table->text('message');
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('recipients')->default(0);
            $table->unsignedInteger('sent')->default(0);
            $table->unsignedInteger('failed')->default(0);
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::table('notification_log', function (Blueprint $table) {
            $table->foreignId('debate_promotion_id')->nullable()->after('news_id')->constrained('debate_promotions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('notification_log', function (Blueprint $table) {
            $table->dropConstrainedForeignId('debate_promotion_id');
        });
        Schema::dropIfExists('debate_promotions');
    }
};
