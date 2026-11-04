<?php

use App\Models\Organization;
use App\Models\User;
use App\Services\LinkChecker;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
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

Artisan::command('organizations:check-links {--slug=}', function (LinkChecker $checker) {
    $counts = [LinkChecker::OK => 0, LinkChecker::BROKEN => 0, LinkChecker::UNKNOWN => 0];

    Organization::query()
        ->when($this->option('slug'), fn ($query, string $slug) => $query->where('slug', $slug))
        ->orderBy('id')
        ->each(function (Organization $organization) use ($checker, &$counts) {
            foreach ($checker->checkOrganization($organization) as $field => $check) {
                $counts[$check['status']]++;
                if ($check['status'] === LinkChecker::BROKEN) {
                    $this->warn("{$organization->slug} {$field}: ne radi ({$check['code']}) {$check['url']}");
                }
            }
        });

    $this->info("Linkovi: {$counts['ok']} rade, {$counts['broken']} ne rade, {$counts['unknown']} nije moguće proveriti.");

    return 0;
})->purpose('Proverava sajtove i mreže organizacija i pamti koji ne rade');

Schedule::command('organizations:check-links')->weeklyOn(1, '04:00');
