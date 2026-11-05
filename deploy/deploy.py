"""Deploy portala na fiskultura.rs (cPanel, FTP, bez SSH-a), isti obrazac kao evidencija-fv.

    python deploy/deploy.py                 # backend (testovi, upload, migracije), pa frontend sa prerenderom iz živog API-ja
    python deploy/deploy.py --skip-tests    # build bez backend testova
    python deploy/deploy.py --skip-build    # samo upload postojećih paketa
    python deploy/deploy.py --frontend      # samo ponovni prerender i upload frontenda (npr. posle novih vesti)
    python deploy/deploy.py --seed          # i db:seed (u produkciji samo osnovni podaci, bez probnih naloga)
    python deploy/deploy.py --check-links   # i provera linkova udruženja (organizations:check-links, 1–3 min)

Dva prolaza: prvo backend (raspakivanje, migracije, seed), pa frontend build čije se stranice prerenderuju iz već
ažuriranog API-ja (SSR_API_ORIGIN = APP_URL). .htaccess se šalje svaki put (pravila za prerenderovane stranice).

Prvi admin: DEPLOY_ADMIN_EMAIL i DEPLOY_ADMIN_PASSWORD u deploy/.env — nalog se pravi ili ažurira pri svakom
deploy-u ako su popunjeni (lozinka ne ide u .env na serveru). Posle prvog deploy-a obriši lozinku iz deploy/.env.

Podešavanja (FTP_*, DEPLOY_*) i produkcioni backend .env su u deploy/.env (van gita, vidi deploy/.env.example).
"""

import ftplib
import io
import json
import os
import secrets
import shutil
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEPLOY = ROOT / 'deploy'
DEPLOY_ONLY_PREFIXES = ('FTP_', 'DEPLOY_')
REQUIRED = ('FTP_HOST', 'FTP_USER', 'FTP_PASSWORD', 'DEPLOY_APP_DIR', 'DEPLOY_WEB_DIR', 'DEPLOY_SECRET', 'APP_URL', 'APP_KEY', 'JWT_SECRET', 'DB_DATABASE')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
    'Accept': 'application/json, text/html;q=0.9, */*;q=0.8',
}


def read_env(path: Path) -> tuple[dict, list[str]]:
    values, lines = {}, path.read_text(encoding='utf-8').splitlines()
    for line in lines:
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            values[key.strip()] = value.strip().strip('"')
    return values, lines


def server_env(lines: list[str]) -> bytes:
    kept = [line for line in lines if not line.split('=', 1)[0].strip().startswith(DEPLOY_ONLY_PREFIXES)]
    return ('\n'.join(kept).rstrip() + '\n').encode('utf-8')


def upload(ftp: ftplib.FTP, data: bytes | Path, remote: str) -> None:
    size = data.stat().st_size if isinstance(data, Path) else len(data)
    print(f'  -> {remote} ({size / 1024 / 1024:.2f} MB)')
    if isinstance(data, Path):
        with data.open('rb') as handle:
            ftp.storbinary(f'STOR {remote}', handle, blocksize=256 * 1024)
    else:
        ftp.storbinary(f'STOR {remote}', io.BytesIO(data))


def bash() -> str:
    git = shutil.which('git')
    if os.name == 'nt' and git:
        for folder in Path(git).resolve().parents:
            candidate = folder / 'bin' / 'bash.exe'
            if candidate.exists() and (folder / 'usr').exists():
                return str(candidate)
    return 'bash'


def tls() -> ssl.SSLContext:
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


def status(url: str) -> int:
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30, context=tls()) as response:
            return response.status
    except urllib.error.HTTPError as error:
        return error.code


def run_build(parts: list[str], extra_env: dict | None = None) -> None:
    command = [bash(), str(DEPLOY / 'build-release.sh'), *parts]
    print('==> Build:', ' '.join(command[1:]))
    subprocess.run(command, cwd=ROOT, check=True, env={**os.environ, **(extra_env or {})})


def ship(env: dict, lines: list[str], app_dir: str, web_dir: str, app_folder: str, files: list, payload: dict) -> dict:
    unpacker_name = f'_deploy-{secrets.token_hex(8)}.php'
    unpacker = (DEPLOY / 'remote-unpack.php').read_text(encoding='utf-8')
    unpacker = unpacker.replace('__DEPLOY_SECRET__', env['DEPLOY_SECRET']).replace('__DEPLOY_APP_DIR__', app_folder)
    ftp = ftplib.FTP(timeout=120)
    ftp.connect(env['FTP_HOST'], int(env.get('FTP_PORT') or 21))
    ftp.login(env['FTP_USER'], env['FTP_PASSWORD'])
    for folder in (app_dir, web_dir):
        try:
            ftp.mkd(folder)
        except ftplib.error_perm:
            pass
    for data, remote in files:
        upload(ftp, data, remote)
    upload(ftp, unpacker.encode('utf-8'), f'{web_dir}/{unpacker_name}')
    ftp.quit()

    print('==> Raspakivanje na serveru')
    base = env['APP_URL'].rstrip('/')
    body = urllib.parse.urlencode({'key': env['DEPLOY_SECRET'], **payload}).encode()
    request = urllib.request.Request(f'{base}/{unpacker_name}', data=body, headers=HEADERS, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=600, context=tls()) as response:
            result = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        result = {'ok': False, 'error': f'HTTP {error.code}: {error.read()[:300].decode("utf-8", "replace")}'}
    print('  ', result)
    return result


def main() -> int:
    sys.stdout.reconfigure(encoding='utf-8')
    args = set(sys.argv[1:])
    env_path = DEPLOY / '.env'
    if not env_path.exists():
        print('Nema deploy/.env — napravi ga po uzoru na deploy/.env.example')
        return 1
    env, lines = read_env(env_path)
    missing = [key for key in REQUIRED if not env.get(key)]
    if missing:
        print('Nedostaje u deploy/.env:', ', '.join(missing))
        return 1

    app_dir, web_dir = env['DEPLOY_APP_DIR'], env['DEPLOY_WEB_DIR']
    app_folder = Path(app_dir).name
    base = env['APP_URL'].rstrip('/')
    app_zip, web_zip = DEPLOY / 'fiskultura-app.zip', DEPLOY / 'fiskultura-web.zip'
    build = '--skip-build' not in args
    frontend_only = '--frontend' in args
    tests = ['--skip-tests'] if '--skip-tests' in args else []

    if not frontend_only:
        if build:
            run_build(['--backend', *tests])
        if not app_zip.exists():
            print(f'Nema {app_zip.name} — pokreni bez --skip-build')
            return 1
        print(f"==> Backend: FTP upload ({env['FTP_HOST']})")
        result = ship(env, lines, app_dir, web_dir, app_folder, [(app_zip, f'{app_dir}/_deploy-app.zip'), (server_env(lines), f'{app_dir}/_deploy.env')], {
            'seed': '1' if '--seed' in args else '0',
            'admin_email': env.get('DEPLOY_ADMIN_EMAIL', ''),
            'admin_password': env.get('DEPLOY_ADMIN_PASSWORD', ''),
            'check_links': '1' if '--check-links' in args else '0',
        })
        if not result.get('ok'):
            return 1

    if build:
        run_build(['--frontend'], {'SSR_API_ORIGIN': base})
    if not web_zip.exists():
        print(f'Nema {web_zip.name} — pokreni bez --skip-build')
        return 1
    index = (DEPLOY / 'index.php').read_text(encoding='utf-8').replace('__DEPLOY_APP_DIR__', app_folder)
    print(f"==> Frontend: FTP upload ({env['FTP_HOST']})")
    result = ship(env, lines, app_dir, web_dir, app_folder, [
        (web_zip, f'{web_dir}/_deploy-web.zip'),
        (index.encode('utf-8'), f'{web_dir}/index.php'),
        (DEPLOY / 'htaccess-production', f'{web_dir}/.htaccess'),
    ], {'seed': '0', 'admin_email': '', 'admin_password': '', 'check_links': '0'})
    if not result.get('ok'):
        return 1

    print('==> Provera')
    checks = {
        'naslovna (200)': status(f'{base}/'),
        'prijava (200)': status(f'{base}/prijava'),
        'udruženja (200)': status(f'{base}/udruzenja'),
        'vesti (200)': status(f'{base}/vesti'),
        'pitanja (200)': status(f'{base}/pitanja'),
        'sitemap (200)': status(f'{base}/sitemap.xml'),
        'robots (200)': status(f'{base}/robots.txt'),
        'api udruženja (200)': status(f'{base}/api/organizations'),
        'portfolio (200)': status(f'{base}/portfolio/'),
        'api bez tokena (401)': status(f'{base}/api/auth/me'),
    }
    print('  ', checks)
    if list(checks.values()) != [200, 200, 200, 200, 200, 200, 200, 200, 200, 401]:
        return 1

    print('Deploy je završen.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
