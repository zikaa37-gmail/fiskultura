<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 20)->unique();
            $table->string('username')->nullable();
            $table->string('external_id')->nullable();
            $table->text('token')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->foreignId('connected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('instagram_posts', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 10);
            $table->text('caption')->nullable();
            $table->longText('image')->nullable();
            $table->string('token', 40)->unique();
            $table->string('status', 20)->index();
            $table->dateTime('scheduled_at')->index();
            $table->dateTime('published_at')->nullable();
            $table->string('media_id')->nullable();
            $table->string('permalink')->nullable();
            $table->text('error')->nullable();
            $table->json('networks')->nullable();
            $table->string('facebook_status', 20)->nullable();
            $table->string('facebook_post_id')->nullable();
            $table->string('facebook_permalink')->nullable();
            $table->text('facebook_error')->nullable();
            $table->string('source_type', 20)->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instagram_posts');
        Schema::dropIfExists('social_accounts');
    }
};
