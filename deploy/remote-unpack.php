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
        $manifest = "$webDir/_prerendered.txt";
        $before = is_file($manifest) ? file($manifest, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
        $names = unzipTo("$webDir/_deploy-web.zip", $webDir);
        $after = is_file($manifest) ? file($manifest, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
        $stale = 0;
        foreach (array_diff($before, $after) as $page) {
            if (preg_match('#^[a-z0-9_-]+(/[a-z0-9_.%-]+)*/index\.html$#i', $page) && is_file("$webDir/$page")) {
                unlink("$webDir/$page");
                @rmdir(dirname("$webDir/$page"));
                $stale++;
            }
        }
        $result['pages'] = count($after);
        $result['pages_removed'] = $stale;
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

        $result['php'] = PHP_VERSION;
        $result['php_missing'] = array_values(array_filter(['openssl', 'json', 'mbstring', 'iconv', 'libxml', 'zip', 'fileinfo', 'pdo_mysql'], fn (string $extension) => ! extension_loaded($extension)));
        try {
            $console->call('mailbox:check');
            $result['mailbox'] = trim($console->output()) ?: 'ok';
        } catch (Throwable $exception) {
            $result['mailbox'] = 'greška: '.$exception->getMessage();
        }

        if (($_POST['seed'] ?? '') === '1') {
            $console->call('db:seed', ['--force' => true]);
            $result['seed'] = trim($console->output()) ?: 'ok';
        }

        if (($_POST['check_links'] ?? '') === '1') {
            $console->call('organizations:check-links');
            $result['links'] = trim($console->output()) ?: 'ok';
        }

        if (($_POST['admin_email'] ?? '') !== '' && ($_POST['admin_password'] ?? '') !== '') {
            $console->call('app:admin', ['email' => $_POST['admin_email'], '--password' => $_POST['admin_password']]);
            $result['admin'] = trim($console->output()) ?: 'ok';
        }

        foreach (json_decode((string) ($_POST['users'] ?? '[]'), true) ?: [] as $account) {
            $console->call('app:user', ['email' => $account['email'], 'role' => $account['role'], '--password' => $account['password'], '--name' => $account['name'] ?? '']);
            $result['users'][] = trim($console->output()) ?: 'ok';
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
