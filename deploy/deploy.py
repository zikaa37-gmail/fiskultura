"""Deploy portala na fiskultura.rs (cPanel, FTP, bez SSH-a), isti obrazac kao evidencija-fv.

    python deploy/deploy.py                 # build (sa testovima) + upload + raspakivanje + migracije + provera
    python deploy/deploy.py --skip-tests    # build bez backend testova
    python deploy/deploy.py --skip-build    # samo upload postojećih paketa
    python deploy/deploy.py --seed          # i db:seed (u produkciji samo osnovni podaci, bez probnih naloga)
    python deploy/deploy.py --htaccess      # zameni .htaccess na serveru (PRVI deploy — tamo je onaj od statične naslovne)
    python deploy/deploy.py --check-links   # i provera linkova udruženja (organizations:check-links, 1–3 min)

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


def exists(ftp: ftplib.FTP, remote: str) -> bool:
    try:
        ftp.size(remote)
        return True
    except ftplib.error_perm:
        return False


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

    if '--skip-build' not in args:
        command = [bash(), str(DEPLOY / 'build-release.sh')] + (['--skip-tests'] if '--skip-tests' in args else [])
        print('==> Build:', ' '.join(command[1:]))
        subprocess.run(command, cwd=ROOT, check=True)

    app_zip, web_zip = DEPLOY / 'fiskultura-app.zip', DEPLOY / 'fiskultura-web.zip'
    for path in (app_zip, web_zip):
        if not path.exists():
            print(f'Nema {path.name} — pokreni bez --skip-build')
            return 1

    app_dir, web_dir = env['DEPLOY_APP_DIR'], env['DEPLOY_WEB_DIR']
    app_folder = Path(app_dir).name
    unpacker_name = f'_deploy-{secrets.token_hex(8)}.php'
    unpacker = (DEPLOY / 'remote-unpack.php').read_text(encoding='utf-8') \
        .replace('__DEPLOY_SECRET__', env['DEPLOY_SECRET']) \
        .replace('__DEPLOY_APP_DIR__', app_folder)
    index = (DEPLOY / 'index.php').read_text(encoding='utf-8').replace('__DEPLOY_APP_DIR__', app_folder)

    print(f"==> FTP upload ({env['FTP_HOST']})")
    ftp = ftplib.FTP(timeout=120)
    ftp.connect(env['FTP_HOST'], int(env.get('FTP_PORT') or 21))
    ftp.login(env['FTP_USER'], env['FTP_PASSWORD'])
    for folder in (app_dir, web_dir):
        try:
            ftp.mkd(folder)
        except ftplib.error_perm:
            pass
    upload(ftp, app_zip, f'{app_dir}/_deploy-app.zip')
    upload(ftp, server_env(lines), f'{app_dir}/_deploy.env')
    upload(ftp, web_zip, f'{web_dir}/_deploy-web.zip')
    upload(ftp, index.encode('utf-8'), f'{web_dir}/index.php')
    if '--htaccess' in args or not exists(ftp, f'{web_dir}/.htaccess'):
        upload(ftp, DEPLOY / 'htaccess-production', f'{web_dir}/.htaccess')
    else:
        print('  .htaccess već postoji na serveru — ne menja se (--htaccess za zamenu, vidi docs/DEPLOY.md)')
    upload(ftp, unpacker.encode('utf-8'), f'{web_dir}/{unpacker_name}')
    ftp.quit()

    base = env['APP_URL'].rstrip('/')
    print('==> Raspakivanje i migracije na serveru')
    payload = {
        'key': env['DEPLOY_SECRET'],
        'seed': '1' if '--seed' in args else '0',
        'admin_email': env.get('DEPLOY_ADMIN_EMAIL', ''),
        'admin_password': env.get('DEPLOY_ADMIN_PASSWORD', ''),
        'check_links': '1' if '--check-links' in args else '0',
    }
    request = urllib.request.Request(f'{base}/{unpacker_name}', data=urllib.parse.urlencode(payload).encode(), headers=HEADERS, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=600, context=tls()) as response:
            result = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        result = {'ok': False, 'error': f'HTTP {error.code}: {error.read()[:300].decode("utf-8", "replace")}'}
    print('  ', result)
    if not result.get('ok'):
        return 1

    print('==> Provera')
    checks = {
        'naslovna (200)': status(f'{base}/'),
        'prijava (200)': status(f'{base}/prijava'),
        'udruženja (200)': status(f'{base}/udruzenja'),
        'vesti (200)': status(f'{base}/vesti'),
        'api udruženja (200)': status(f'{base}/api/organizations'),
        'portfolio (200)': status(f'{base}/portfolio/'),
        'api bez tokena (401)': status(f'{base}/api/auth/me'),
    }
    print('  ', checks)
    if list(checks.values()) != [200, 200, 200, 200, 200, 200, 401]:
        return 1

    print('Deploy je završen.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
