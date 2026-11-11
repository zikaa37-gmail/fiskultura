<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('debates', function (Blueprint $table) {
            $table->string('intro_status', 20)->nullable()->after('summary_guidance');
            $table->text('intro_guidance')->nullable()->after('intro_status');
            $table->json('intro_draft')->nullable()->after('intro_guidance');
            $table->timestamp('intro_generated_at')->nullable()->after('intro_draft');
            $table->json('intro')->nullable()->after('intro_generated_at');
            $table->timestamp('intro_approved_at')->nullable()->after('intro');
            $table->string('intro_error', 500)->nullable()->after('intro_approved_at');
            $table->timestamp('intro_requested_at')->nullable()->after('intro_error');
        });

        DB::table('debates')->where('slug', 'koliko-nam-administracija-u-nastavi-fv-oduzima-vremena')->update([
            'intro_status' => 'pending',
            'intro_guidance' => 'Potraži po vestima na šta se obično žale nastavnici u školama vezano za vođenje administracije, pogotovo otkako se koristi ES dnevnik.',
            'intro_requested_at' => now(),
        ]);
        DB::table('debates')->where('status', 'open')->whereNull('intro_status')->update(['intro_status' => 'pending', 'intro_requested_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('debates', function (Blueprint $table) {
            $table->dropColumn(['intro_status', 'intro_guidance', 'intro_draft', 'intro_generated_at', 'intro', 'intro_approved_at', 'intro_error', 'intro_requested_at']);
        });
    }
};
