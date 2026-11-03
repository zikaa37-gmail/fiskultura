<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

Artisan::command('app:admin {email} {--password=} {--name=Administrator}', function (string $email) {
    $password = (string) $this->option('password');

    if (strlen($password) < 8) {
        $this->error('Lozinka admina mora imati bar 8 znakova.');

        return 1;
    }

    $user = User::firstOrNew(['email' => Str::lower($email)]);
    $user->fill(['name' => $user->name ?? $this->option('name'), 'role' => User::ADMIN, 'password' => $password]);
    $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now(), 'blocked_at' => null])->save();

    $this->info("Admin {$user->email} je spreman.");

    return 0;
})->purpose('Pravi ili ažurira administratorski nalog');
