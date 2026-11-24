<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debates', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 160)->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('proposed')->index();
            $table->foreignId('moderator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('summary_draft')->nullable();
            $table->timestamp('summary_draft_at')->nullable();
            $table->unsignedInteger('summary_draft_posts')->nullable();
            $table->json('summary')->nullable();
            $table->timestamp('summary_approved_at')->nullable();
            $table->unsignedInteger('summary_posts')->nullable();
            $table->text('summary_guidance')->nullable();
            $table->unsignedInteger('posts_count')->default(0);
            $table->timestamp('last_post_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('debate_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debate_id')->constrained('debates')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('kind', 20);
            $table->text('body');
            $table->unsignedInteger('likes_count')->default(0);
            $table->timestamp('highlighted_at')->nullable();
            $table->timestamp('hidden_at')->nullable();
            $table->timestamps();
            $table->index(['debate_id', 'created_at']);
        });

        Schema::create('debate_post_likes', function (Blueprint $table) {
            $table->foreignId('debate_post_id')->constrained('debate_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->nullable();
            $table->primary(['debate_post_id', 'user_id']);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->foreignId('assigned_to')->nullable()->after('answered_by')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_to');
        });
        Schema::dropIfExists('debate_post_likes');
        Schema::dropIfExists('debate_posts');
        Schema::dropIfExists('debates');
    }
};
