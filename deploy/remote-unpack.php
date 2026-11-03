<?php

$secret = '__DEPLOY_SECRET__';
$appDir = dirname(__DIR__).'/__DEPLOY_APP_DIR__';
$webDir = __DIR__;

header('Content-Type: application/json');

if (! hash_equals($secret, (string) ($_POST['key'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'forbidden']);
    exit;
}

@set_time_limit(600);
$result = ['ok' => true];

function unzipTo(string $zip, string $dir): array
{
    $archive = new ZipArchive();
    if ($archive->open($zip) !== true) {
        throw new RuntimeException('Zip nije moguće otvoriti: '.basename($zip));
    }
    $names = [];
    for ($i = 0; $i < $archive->numFiles; $i++) {
        $names[] = $archive->getNameIndex($i);
    }
    if (! $archive->extractTo($dir)) {
        throw new RuntimeException('Raspakivanje nije uspelo: '.basename($zip));
    }
    $archive->close();
    unlink($zip);

    return $names;
}

try {
    if (is_file("$appDir/_deploy-app.zip")) {
        $result['app_files'] = count(unzipTo("$appDir/_deploy-app.zip", $appDir));
        foreach (["$appDir/storage/logs", "$appDir/storage/framework/cache/data", "$appDir/storage/framework/sessions", "$appDir/storage/framework/views"] as $dir) {
            if (! is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
        }
        foreach (array_merge(glob("$appDir/bootstrap/cache/*.php") ?: [], glob("$appDir/storage/framework/views/*.php") ?: []) as $file) {
            if (basename($file) !== '.gitignore') {
                unlink($file);
            }
        }
    }

    if (is_file("$appDir/_deploy.env")) {
        rename("$appDir/_deploy.env", "$appDir/.env");
        $result['env'] = true;
    }

    if (is_file("$webDir/_deploy-web.zip")) {
        $names = unzipTo("$webDir/_deploy-web.zip", $webDir);
        $keep = array_flip($names);
        $removed = 0;
        foreach (glob("$webDir/*.{js,css,map}", GLOB_BRACE) ?: [] as $file) {
            if (! isset($keep[basename($file)])) {
                unlink($file);
                $removed++;
            }
        }
        $result['web_files'] = count($names);
        $result['web_removed'] = $removed;
    }

    if (function_exists('opcache_reset')) {
        opcache_reset();
    }

    if (is_file("$appDir/vendor/autoload.php")) {
        require "$appDir/vendor/autoload.php";
        $laravel = require "$appDir/bootstrap/app.php";
        $console = $laravel->make(Illuminate\Contracts\Console\Kernel::class);
        $console->call('migrate', ['--force' => true]);
        $result['migrate'] = trim($console->output()) ?: 'ok';

        if (($_POST['seed'] ?? '') === '1') {
            $console->call('db:seed', ['--force' => true]);
            $result['seed'] = trim($console->output()) ?: 'ok';
        }

        if (($_POST['admin_email'] ?? '') !== '' && ($_POST['admin_password'] ?? '') !== '') {
            $console->call('app:admin', ['email' => $_POST['admin_email'], '--password' => $_POST['admin_password']]);
            $result['admin'] = trim($console->output()) ?: 'ok';
        }
    }
} catch (Throwable $exception) {
    http_response_code(500);
    $result = ['ok' => false, 'error' => $exception->getMessage()];
}

foreach (glob("$webDir/_deploy-*.php") ?: [] as $file) {
    @unlink($file);
}
echo json_encode($result);
