<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('regulations', function (Blueprint $table) {
            $table->json('replaced_by')->nullable()->after('valid_to');
            $table->string('pis_amendments', 2000)->nullable()->after('verification_note');
            $table->timestamp('pis_checked_at')->nullable()->after('pis_amendments');
            $table->timestamp('change_detected_at')->nullable()->after('pis_checked_at');
            $table->string('change_detail', 2000)->nullable()->after('change_detected_at');
            $table->timestamp('checked_at')->nullable()->after('change_detail');
            $table->foreignId('checked_by')->nullable()->after('checked_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('regulations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('checked_by');
            $table->dropColumn(['replaced_by', 'pis_amendments', 'pis_checked_at', 'change_detected_at', 'change_detail', 'checked_at']);
        });
    }
};
