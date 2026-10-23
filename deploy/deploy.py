import ftplib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / 'deploy' / '.env'
PUBLISHED = ['index.html', 'style.css', 'main.js', 'favicon.svg', 'robots.txt']


def read_env(path: Path) -> dict:
    values = {}
    for line in path.read_text(encoding='utf-8').splitlines():
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            values[key.strip()] = value.strip().strip('"')
    return values


def main() -> None:
    if not ENV_FILE.exists():
        sys.exit(f'Nedostaje {ENV_FILE} (vidi deploy/env.example).')
    env = read_env(ENV_FILE)
    missing = [key for key in ('FTP_HOST', 'FTP_USER', 'FTP_PASSWORD', 'DEPLOY_WEB_DIR') if not env.get(key)]
    if missing:
        sys.exit(f'U deploy/.env nedostaje: {", ".join(missing)}')

    ftp = ftplib.FTP(timeout=60)
    ftp.connect(env['FTP_HOST'], int(env.get('FTP_PORT', '21')))
    ftp.login(env['FTP_USER'], env['FTP_PASSWORD'])
    ftp.cwd(env['DEPLOY_WEB_DIR'])
    for name in PUBLISHED:
        path = ROOT / name
        if not path.exists():
            continue
        print(f'  -> {name}')
        with path.open('rb') as handle:
            ftp.storbinary(f'STOR {name}', handle)
    ftp.quit()
    print('Gotovo.')


if __name__ == '__main__':
    main()
