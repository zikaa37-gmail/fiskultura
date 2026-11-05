#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/backend-production-build"
COMPOSER_PHAR="${COMPOSER_PHAR:-/c/Users/PC/composer/composer.phar}"
SKIP_TESTS=0
PART=all

for arg in "$@"; do
  case "$arg" in
    --skip-tests) SKIP_TESTS=1 ;;
    --backend) PART=backend ;;
    --frontend) PART=frontend ;;
  esac
done

if [[ "$PART" != "frontend" ]]; then
  if [[ "$SKIP_TESTS" == "0" ]]; then
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

  python "$ROOT/deploy/make_zip.py" "$BUILD" "$ROOT/deploy/fiskultura-app.zip"
fi

if [[ "$PART" != "backend" ]]; then
  echo "==> Frontend: produkcioni build sa prerenderom (API: ${SSR_API_ORIGIN:-https://fiskultura.rs})"
  (cd "$ROOT/frontend" && npm run build -- --configuration production)

  BROWSER="$ROOT/frontend/dist/frontend/browser"
  (cd "$BROWSER" && find . -name index.html -not -path ./index.html | sed 's#^\./##' | sort > _prerendered.txt)
  PAGES=$(wc -l < "$BROWSER/_prerendered.txt")
  echo "   prerenderovanih stranica: $PAGES + naslovna"
  if (( PAGES < 20 )); then
    echo "Premalo prerenderovanih stranica ($PAGES): API ${SSR_API_ORIGIN:-https://fiskultura.rs}/api/seo/routes nije odgovorio. Deploy se prekida."
    exit 1
  fi

  python "$ROOT/deploy/make_zip.py" "$BROWSER" "$ROOT/deploy/fiskultura-web.zip"
fi

echo
echo "Gotovo:"
ls -lh "$ROOT/deploy/"fiskultura-*.zip
