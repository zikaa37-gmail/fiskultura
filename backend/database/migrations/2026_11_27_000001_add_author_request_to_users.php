<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'author_requested_at')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('author_requested_at')->nullable()->after('bio');
            $table->text('author_request_note')->nullable()->after('author_requested_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['author_requested_at', 'author_request_note']);
        });
    }
};
