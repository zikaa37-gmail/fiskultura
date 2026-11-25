<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('organizations', 'district')) {
            Schema::table('organizations', function (Blueprint $table) {
                $table->string('district', 60)->nullable()->after('city');
            });
        }

        if (! Schema::hasTable('founding_interests')) {
            Schema::create('founding_interests', function (Blueprint $table) {
                $table->id();
                $table->string('district', 60);
                $table->string('city', 120);
                $table->string('city_key', 50);
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

            return;
        }

        Schema::table('founding_interests', function (Blueprint $table) {
            $table->string('city_key', 50)->change();
        });

        Schema::table('founding_interests', function (Blueprint $table) {
            if (! Schema::hasIndex('founding_interests', ['email', 'city_key'], 'unique')) {
                $table->unique(['email', 'city_key']);
            }
            if (! Schema::hasIndex('founding_interests', ['city_key', 'confirmed_at'])) {
                $table->index(['city_key', 'confirmed_at']);
            }
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
