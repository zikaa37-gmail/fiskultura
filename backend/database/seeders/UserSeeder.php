<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public const DEV_PASSWORD = 'lozinka123';

    public function run(): void
    {
        $accounts = [
            ['name' => 'Administrator', 'email' => 'admin@fiskultura.test', 'role' => User::ADMIN],
            ['name' => 'Urednik', 'email' => 'urednik@fiskultura.test', 'role' => User::EDITOR],
            ['name' => 'Autor', 'email' => 'autor@fiskultura.test', 'role' => User::AUTHOR],
            ['name' => 'Nastavnik', 'email' => 'nastavnik@fiskultura.test', 'role' => User::TEACHER, 'school' => 'OŠ „Vuk Karadžić"', 'municipality' => 'Zemun', 'district' => 'Grad Beograd'],
        ];

        foreach ($accounts as $account) {
            $user = User::updateOrCreate(['email' => $account['email']], [...$account, 'password' => self::DEV_PASSWORD]);
            $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now()])->save();
        }
    }
}
