<?php

use App\Mail\RegulationChangesMail;
use App\Models\Organization;
use App\Models\Regulation;
use App\Models\User;
use App\Services\LinkChecker;
use App\Services\PisChecker;
use App\Services\Notifications\NewsNotifier;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
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

Artisan::command('app:user {email} {role} {--password=} {--name=}', function (string $email, string $role) {
    $password = (string) $this->option('password');

    if (! in_array($role, User::ROLES, true)) {
        $this->error('Uloga mora biti jedna od: '.implode(', ', User::ROLES).'.');

        return 1;
    }
    if (strlen($password) < 8) {
        $this->error('Lozinka mora imati bar 8 znakova.');

        return 1;
    }

    $user = User::firstOrNew(['email' => Str::lower($email)]);
    $user->fill(['name' => $this->option('name') ?: ($user->name ?? Str::before($email, '@')), 'role' => $role, 'password' => $password]);
    $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now(), 'blocked_at' => null])->save();

    $this->info("Nalog {$user->email} ({$role}) je spreman.");

    return 0;
})->purpose('Pravi ili ažurira nalog sa zadatom ulogom i lozinkom (nalozi za testiranje)');

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

Artisan::command('regulations:check {--key=} {--no-mail}', function (PisChecker $checker) {
    $counts = ['baseline' => 0, 'same' => 0, 'changed' => 0, 'skipped' => 0, 'failed' => 0];
    $lines = [];

    Regulation::query()
        ->when($this->option('key'), fn ($query, string $key) => $query->where('key', $key))
        ->orderBy('sort')
        ->each(function (Regulation $regulation) use ($checker, &$counts, &$lines) {
            try {
                $result = $checker->check($regulation);
            } catch (Throwable $error) {
                $counts['failed']++;
                $this->warn("{$regulation->key}: {$error->getMessage()}");

                return;
            }
            $counts[$result['status']]++;
            if ($result['status'] === 'changed') {
                $lines[] = "{$regulation->title}: {$result['detail']}";
                $this->warn("{$regulation->key}: {$result['detail']}");
            }
        });

    $this->info("Propisi: {$counts['changed']} sa novim izmenama, {$counts['same']} bez promene, {$counts['baseline']} prvi put zabeleženo, {$counts['skipped']} van PIS-a, {$counts['failed']} neuspelo.");

    $recipients = User::query()->whereIn('role', [User::EDITOR, User::ADMIN])->whereNull('blocked_at')->whereNotNull('email_verified_at')->pluck('email');
    if ($lines && $recipients->isNotEmpty() && ! $this->option('no-mail')) {
        Mail::to($recipients->all())->send(new RegulationChangesMail($lines));
    }

    return 0;
})->purpose('Proverava u PIS-u da li su propisi iz kataloga dobili nove izmene i javlja urednicima');

Schedule::command('regulations:check')->weeklyOn(1, '05:00')->withoutOverlapping();
