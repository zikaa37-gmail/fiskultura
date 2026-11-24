<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('moderator_pool')->default(false)->after('role');
        });

        Schema::create('debate_moderator_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debate_id')->constrained('debates')->cascadeOnDelete();
            $table->foreignId('moderator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('previous_moderator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 20);
            $table->timestamp('created_at')->nullable();
            $table->index('created_at');
        });

        Schema::create('debate_reopen_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debate_id')->constrained('debates')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('kind', 20);
            $table->text('body');
            $table->string('status', 20)->default('pending');
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->string('decision_note', 1000)->nullable();
            $table->timestamps();
            $table->index(['debate_id', 'status']);
        });

        Schema::create('user_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('kind', 30);
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('url', 500)->nullable();
            $table->json('channels')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'created_at']);
        });

        DB::table('debates')->whereNotNull('moderator_id')->orderBy('id')->get(['id', 'moderator_id', 'created_at'])
            ->each(fn (object $debate) => DB::table('debate_moderator_log')->insert([
                'debate_id' => $debate->id,
                'moderator_id' => $debate->moderator_id,
                'reason' => 'auto',
                'created_at' => $debate->created_at,
            ]));
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('debate_reopen_requests');
        Schema::dropIfExists('debate_moderator_log');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('moderator_pool');
        });
    }
};
