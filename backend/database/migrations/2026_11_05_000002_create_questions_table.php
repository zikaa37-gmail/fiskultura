<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 160)->unique();
            $table->string('category', 30);
            $table->string('title');
            $table->text('body')->nullable();
            $table->text('original')->nullable();
            $table->longText('answer')->nullable();
            $table->json('regulation_keys')->nullable();
            $table->date('valid_on')->nullable();
            $table->string('status', 12)->default('pending');
            $table->text('editor_note')->nullable();
            $table->foreignId('asked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('answered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('asker_notified_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
