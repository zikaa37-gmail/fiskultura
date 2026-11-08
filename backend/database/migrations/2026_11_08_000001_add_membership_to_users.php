<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('member_status', 20)->nullable()->after('role');
            $table->string('source', 40)->nullable()->after('district');
            $table->timestamp('directory_consent_at')->nullable()->after('blocked_at');
            $table->timestamp('surveys_consent_at')->nullable()->after('directory_consent_at');
            $table->timestamp('last_active_at')->nullable()->after('surveys_consent_at');
            $table->index('member_status');
            $table->index('source');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['member_status']);
            $table->dropIndex(['source']);
            $table->dropColumn(['member_status', 'source', 'directory_consent_at', 'surveys_consent_at', 'last_active_at']);
        });
    }
};
