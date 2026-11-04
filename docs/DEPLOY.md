# Deploy portala na fiskultura.rs

Isti obrazac kao `evidencija-fv` i `kosarkaska-evidencija` (isti cPanel nalog): nema SSH-a, paketi idu
preko FTP-a, a jednokratni PHP fajl na serveru ih raspakuje i pokrene migracije, pa obriše sam sebe.

## Folderi na serveru

```
~/public_html/            <- document root glavnog domena (javno)
  index.html, *.js, *.css    <- Angular build (zamenjuje statičnu naslovnu)
  index.php                  <- iz deploy/index.php, prosleđuje /api na Laravel
  .htaccess                  <- iz deploy/htaccess-production (HTTPS, SPA rute, /api)
  portfolio/, assets/, test/ <- ne diraju se (raspakivanje briše samo stare *.js/*.css u korenu)

~/fiskultura_app/         <- Laravel, NIJE javan
  app/ bootstrap/ config/ database/ routes/ storage/ vendor/ .env
```

Poddomeni (`e-pripreme`, `evidencija`, `jadzent`, `zakazivanje`...) imaju svoje foldere van
`public_html` i deploy ih ne dira.

Baza: deljena `fiskultu_porucivanje` (kao evidencija i košarkaška), razdvojena prefiksom `DB_PREFIX=fk_`.

## Podešavanja

`deploy/.env` (van gita, šablon `deploy/env.example`): FTP nalog, `DEPLOY_APP_DIR=fiskultura_app`,
`DEPLOY_WEB_DIR=public_html`, `DEPLOY_SECRET`, prvi admin (`DEPLOY_ADMIN_EMAIL`,
`DEPLOY_ADMIN_PASSWORD`, bar 8 znakova), i produkcioni backend `.env` (`APP_KEY`, `JWT_SECRET`,
baza, SMTP `obavestenja@fiskultura.rs`). Redovi `FTP_*` i `DEPLOY_*` ne idu na server.

## Komande

```bash
python deploy/deploy.py --htaccess --seed   # PRVI deploy portala (zamenjuje .htaccess statične naslovne)
python deploy/deploy.py                     # svaki sledeći: testovi + build + upload + migracije + provera
python deploy/deploy.py --skip-tests
python deploy/deploy.py --skip-build        # samo upload postojećih paketa
python deploy/deploy-staticna.py            # stara statična naslovna (samo za povratak, vidi dole)
```

1. `deploy/build-release.sh`: backend testovi, `backend-production-build/` (composer `--no-dev`, bez
   `.env`, testova i `.exe`), `npm run build -- --configuration production`, zipovi `deploy/fiskultura-app.zip` i `-web.zip`.
2. FTP: zipovi, produkcioni `.env`, `index.php`, `.htaccess` (samo uz `--htaccess` ili ako ga nema) i
   `_deploy-<nasumično>.php`.
3. HTTPS poziv tog fajla (zaštićen `DEPLOY_SECRET`-om): raspakivanje, brisanje starih JS/CSS i keša,
   `migrate --force`, `db:seed --force` uz `--seed` (u produkciji bez probnih naloga), `app:admin`
   ako je admin popunjen; fajl briše sam sebe. Organizacije i vesti iz `backend/database/data/*.json`
   uvozi `--seed` (`ContentSeeder`); ponovni uvoz preskače ono što već postoji.
4. Provera: `/`, `/prijava`, `/udruzenja`, `/vesti`, `/api/organizations`, `/portfolio/` → 200, `/api/auth/me` → 401.

Admin se pravi komandom `php artisan app:admin <mejl> --password=...` (pri deploy-u automatski). Posle
prvog deploy-a obriši `DEPLOY_ADMIN_PASSWORD` iz `deploy/.env`.

## Povratak na statičnu naslovnu

Ako nešto ne radi: `python deploy/deploy-staticna.py` vraća `index.html`, `style.css`, `main.js`,
`.htaccess` statične naslovne (Angular fajlovi ostaju, ali se ne učitavaju). Laravel u
`~/fiskultura_app` ne smeta.

## Napomene

- MySQL na serveru dozvoljava indeks do 1000 bajtova: `Schema::defaultStringLength(191)` u
  `AppServiceProvider`.
- Mejl: proveriti SPF / DKIM za fiskultura.rs u cPanel-u (Email Deliverability) pre prvih pravih mejlova.
- Cron (kasnije, za red mejlova i obaveštenja):
  `* * * * * /usr/local/bin/php /home/fiskultu/fiskultura_app/artisan schedule:run >> /dev/null 2>&1`
