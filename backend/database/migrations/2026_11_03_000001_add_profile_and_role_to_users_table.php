<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['teacher', 'author', 'editor', 'admin'])->default('teacher')->after('email');
            $table->string('school')->nullable()->after('role');
            $table->string('municipality')->nullable()->after('school');
            $table->string('district')->nullable()->after('municipality');
            $table->timestamp('blocked_at')->nullable()->after('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'school', 'municipality', 'district', 'blocked_at']);
        });
    }
};
