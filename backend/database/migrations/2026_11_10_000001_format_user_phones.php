<?php

use App\Support\Phone;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->whereNotNull('phone')->orderBy('id')->each(function (object $user) {
            $formatted = Phone::format($user->phone);
            if ($formatted !== null && $formatted !== $user->phone) {
                DB::table('users')->where('id', $user->id)->update(['phone' => $formatted]);
            }
        });
    }

    public function down(): void {}
};
