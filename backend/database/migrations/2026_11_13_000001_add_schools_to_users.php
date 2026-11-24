<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('schools')->nullable()->after('school');
        });

        DB::table('users')->whereNotNull('school')->where('school', '!=', '')->orderBy('id')->each(function (object $user) {
            DB::table('users')->where('id', $user->id)->update([
                'schools' => json_encode([['institution_id' => null, 'name' => $user->school, 'share' => 100]], JSON_UNESCAPED_UNICODE),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('schools');
        });
    }
};
