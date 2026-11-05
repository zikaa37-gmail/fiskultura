<?php

use App\Models\Organization;
use App\Models\User;
use App\Services\LinkChecker;
use App\Services\Notifications\NewsNotifier;
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

Artisan::command('notifications:send {--dry-run}', function (NewsNotifier $notifier) {
    $dry = (bool) $this->option('dry-run');
    $result = $notifier->run($dry);

    $this->info(($dry ? 'Probno: ' : '')."Vesti za odmah: {$result['news']}, poslato odmah: {$result['instant']}, nedeljnih pregleda: {$result['weekly']}, neuspelih: {$result['failed']}.");
    if ($result['limited']) {
        $this->warn('Dostignut je limit po satu; ostatak ide u sledećem pokretanju.');
    }

    return 0;
})->purpose('Šalje obaveštenja o istaknutim vestima i nedeljni pregled pretplatnicima');

Schedule::command('notifications:send')->everyTenMinutes()->withoutOverlapping();
