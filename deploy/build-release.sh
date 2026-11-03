#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/backend-production-build"
COMPOSER_PHAR="${COMPOSER_PHAR:-/c/Users/PC/composer/composer.phar}"

if [[ "${1:-}" != "--skip-tests" ]]; then
  echo "==> Backend testovi"
  (cd "$ROOT/backend" && php artisan test)
fi

echo "==> Backend: kopija bez vendor/, .env i testova"
rm -rf "$BUILD"
mkdir -p "$BUILD"
(cd "$ROOT/backend" && tar \
  --exclude='./vendor' --exclude='./node_modules' --exclude='./tests' \
  --exclude='./.env' --exclude='./.env.backup' --exclude='./.git*' --exclude='./phpunit.xml' \
  --exclude='./.phpunit.result.cache' \
  --exclude='./storage/logs/*.log' --exclude='./bootstrap/cache/*.php' \
  --exclude='./storage/framework/views/*.php' --exclude='./database/database.sqlite' \
  -cf - .) | (cd "$BUILD" && tar -xf -)

echo "==> Backend: composer install --no-dev"
(cd "$BUILD" && php "$COMPOSER_PHAR" install --no-dev --optimize-autoloader --no-interaction)
find "$BUILD" -iname "*.exe" -delete

echo "==> Frontend: produkcioni build"
(cd "$ROOT/frontend" && npm run build -- --configuration production)

echo "==> Pakovanje"
python "$ROOT/deploy/make_zip.py" "$BUILD" "$ROOT/deploy/fiskultura-app.zip"
python "$ROOT/deploy/make_zip.py" "$ROOT/frontend/dist/frontend/browser" "$ROOT/deploy/fiskultura-web.zip"

echo
echo "Gotovo:"
ls -lh "$ROOT/deploy/fiskultura-app.zip" "$ROOT/deploy/fiskultura-web.zip"
