<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const SLUG = 'koliko-nam-administracija-u-nastavi-fv-oduzima-vremena';

    public function up(): void
    {
        if (DB::table('debates')->where('slug', self::SLUG)->exists()) {
            return;
        }

        $moderator = $this->userNamed(['igor zivanovic', 'igor živanović'])
            ?? DB::table('users')->where('role', 'admin')->whereNull('blocked_at')->orderBy('id')->value('id');
        if (! $moderator) {
            return;
        }
        $creator = $this->userNamed(['rade kraljevic', 'rade kraljević']);

        DB::table('debates')->insert([
            'slug' => self::SLUG,
            'title' => 'Koliko nam vođenje administracije u nastavi FV oduzima vremena i zašto? Šta može bolje i kako?',
            'description' => 'Dnevnik, planovi, izveštaji, Zdravitas, testiranja, takmičenja: koliko vremena nedeljno odlazi na papire umesto na decu i čas? Napišite šta vam oduzima najviše vremena, šta je suvišno ili se radi duplo i šta biste predložili da bude jednostavnije, kod nas u školi ili u propisima.',
            'status' => 'open',
            'moderator_id' => $moderator,
            'created_by' => $creator,
            'posts_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('debates')->where('slug', self::SLUG)->delete();
    }

    private function userNamed(array $names): ?int
    {
        return DB::table('users')->get(['id', 'name'])
            ->first(fn (object $user) => in_array(mb_strtolower(trim(preg_replace('/\s+/', ' ', $user->name))), $names, true))
            ?->id;
    }
};
