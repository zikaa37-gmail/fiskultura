<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('name');
            $table->string('short_name', 60)->nullable();
            $table->enum('type', ['strukovno-udruzenje', 'skolski-sport', 'institucija', 'fakultet', 'sindikat', 'ostalo']);
            $table->enum('level', ['republički', 'pokrajinski', 'okružni', 'gradski', 'opštinski']);
            $table->string('city', 120)->nullable();
            $table->string('website')->nullable();
            $table->json('social')->nullable();
            $table->string('email', 190)->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['aktivno', 'neaktivno', 'nepoznato'])->default('nepoznato');
            $table->date('last_activity')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('member_source')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
