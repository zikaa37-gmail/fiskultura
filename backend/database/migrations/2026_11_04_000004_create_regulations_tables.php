<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regulations', function (Blueprint $table) {
            $table->id();
            $table->string('key', 120)->unique();
            $table->string('title', 500);
            $table->enum('kind', ['zakon', 'nacrt', 'pravilnik', 'program', 'protokol', 'uputstvo', 'kalendar', 'strategija', 'ostalo']);
            $table->json('areas');
            $table->string('gazette', 500)->nullable();
            $table->string('url', 2048)->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->text('summary');
            $table->enum('verification', ['verified', 'secondary', 'unverified'])->default('unverified');
            $table->text('verification_note')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
        });

        Schema::create('regulation_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('regulation_id')->constrained('regulations')->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->json('data');
            $table->string('note', 500)->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->unique(['regulation_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regulation_versions');
        Schema::dropIfExists('regulations');
    }
};
