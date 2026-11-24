<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('district', 60)->nullable()->after('city');
        });

        Schema::create('founding_interests', function (Blueprint $table) {
            $table->id();
            $table->string('district', 60);
            $table->string('city', 120);
            $table->string('city_key', 120);
            $table->string('name', 120);
            $table->string('email', 190);
            $table->string('school', 190)->nullable();
            $table->timestamp('confirmation_sent_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();
            $table->unique(['email', 'city_key']);
            $table->index(['city_key', 'confirmed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('founding_interests');
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('district');
        });
    }
};
