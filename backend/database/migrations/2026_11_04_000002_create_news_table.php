<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 160)->unique();
            $table->string('title');
            $table->text('summary');
            $table->longText('body')->nullable();
            $table->enum('category', ['vest', 'seminar', 'takmicenje', 'propis', 'konkurs', 'saopstenje', 'ostalo'])->default('vest');
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('source_url', 500)->nullable();
            $table->enum('source_type', ['sajt', 'facebook', 'instagram', 'youtube', 'mediji', 'ostalo'])->nullable();
            $table->date('source_published_at')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->boolean('featured')->default(false);
            $table->string('cover_image')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
