<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->string('url', 500);
            $table->string('feed_url', 500)->nullable();
            $table->string('mode', 10)->default('manual');
            $table->timestamp('last_checked_at')->nullable();
            $table->string('last_status', 20)->nullable();
            $table->string('last_error', 255)->nullable();
            $table->unsignedSmallInteger('last_found')->default(0);
            $table->timestamps();
            $table->unique(['organization_id', 'url']);
        });

        Schema::create('news_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organization_source_id')->nullable()->constrained()->nullOnDelete();
            $table->string('origin', 10);
            $table->string('title', 255);
            $table->string('url', 500)->nullable();
            $table->char('url_hash', 40)->nullable()->unique();
            $table->date('published_on')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('sender_name', 120)->nullable();
            $table->string('sender_email', 190)->nullable();
            $table->string('sender_organization', 190)->nullable();
            $table->string('status', 10)->default('new');
            $table->foreignId('news_id')->nullable()->constrained('news')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_suggestions');
        Schema::dropIfExists('organization_sources');
    }
};
