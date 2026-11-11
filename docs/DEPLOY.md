# Deploy portala na fiskultura.rs

Isti obrazac kao `evidencija-fv` i `kosarkaska-evidencija` (isti cPanel nalog): nema SSH-a, paketi idu
preko FTP-a, a jednokratni PHP fajl na serveru ih raspakuje i pokrene migracije, pa obriše sam sebe.

## Folderi na serveru

```
~/public_html/            <- document root glavnog domena (javno)
  index.html, *.js, *.css    <- Angular build; index.html je prerenderovana naslovna
  index.csr.html             <- prazan Angular za rute bez prerendera (prijava, admin, profil...)
  vesti/, udruzenja/, pitanja/, propisi/, sportovi/, aplikacije/  <- prerenderovane stranice (*/index.html)
  _prerendered.txt           <- spisak prerenderovanih stranica (brisanje starih pri sledećem deploy-u)
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
python deploy/deploy.py --seed              # PRVI deploy portala
python deploy/deploy.py                     # svaki sledeći: backend, pa frontend sa prerenderom + provera
python deploy/deploy.py --skip-tests
python deploy/deploy.py --frontend          # samo novi prerender i upload frontenda (posle novih vesti i odgovora)
python deploy/deploy.py --skip-build        # samo upload postojećih paketa
python deploy/deploy.py --check-links       # i provera linkova udruženja (organizations:check-links)
python deploy/deploy-staticna.py            # stara statična naslovna (samo za povratak, vidi dole)
```

1. `deploy/build-release.sh --backend`: backend testovi, `backend-production-build/` (composer `--no-dev`, bez
   `.env`, testova i `.exe`), zip `deploy/fiskultura-app.zip`; FTP: zip, produkcioni `.env` i `_deploy-<nasumično>.php`,
   pa raspakivanje i migracije (korak 3).
2. `deploy/build-release.sh --frontend` sa `SSR_API_ORIGIN=APP_URL`: Angular build koji **prerenderuje** sve javne
   stranice iz već ažuriranog živog API-ja (`/api/seo/routes` daje slug-ove vesti, udruženja i pitanja), spisak
   `_prerendered.txt`, zip `-web.zip`; FTP: zip, `index.php`, `.htaccess` (uvek) i novi `_deploy-*.php`.
3. HTTPS poziv tog fajla (zaštićen `DEPLOY_SECRET`-om): raspakivanje, brisanje starih JS/CSS i keša,
   `migrate --force`, `db:seed --force` uz `--seed` (u produkciji bez probnih naloga), `app:admin`
   ako je admin popunjen; fajl briše sam sebe. U rezultatu su i `php` (verzija), `php_missing` (potrebne PHP
   ekstenzije koje nedostaju; treba da bude prazno) i `mailbox` (izlaz `mailbox:check`: prijava na IMAP i SMTP za
   poštu u adminu, ništa se ne šalje). Organizacije i vesti iz `backend/database/data/*.json`
   uvozi `--seed` (`ContentSeeder`); ponovni uvoz preskače ono što već postoji.
4. Provera: `/`, `/prijava`, `/udruzenja`, `/vesti`, `/pitanja`, `/sitemap.xml`, `/robots.txt`, `/api/organizations`,
   `/portfolio/` → 200, `/api/auth/me` → 401.

## SEO i prerender (SSR)

Frontend je Angular SSR (`@angular/ssr`, `outputMode: server`). Hosting nema Node.js, pa se stranice renderuju pri
deploy-u (prerender, `src/app/app.routes.server.ts`) i Apache ih služi kao gotov HTML: naslovna, `/vesti`,
`/udruzenja`, `/propisi`, `/pitanja`, `/sportovi`, `/aplikacije` i svaka vest, udruženje i pitanje. Svaka stranica ima
title, description, canonical, robots, Open Graph, Twitter i JSON-LD (`SeoService`). Rute za nalog, admin i linkove iz
mejlova su `RenderMode.Client` (`index.csr.html`, `noindex`). Nova vest ili odgovor posle deploy-a radi odmah kao
obična Angular stranica (Google izvršava JS, meta se postavlja u pregledaču), a gotov HTML dobija pri sledećem deploy-u
ili uz `python deploy/deploy.py --frontend`. Ako hosting jednom dobije Node.js, `dist/frontend/server/server.mjs` može
da renderuje i nove stranice odmah (`RenderMode.Server`).

`/sitemap.xml` pravi Laravel (`SeoController`, uvek aktuelan), `robots.txt` je u `frontend/public`. Posle prvog
deploy-a: Google Search Console → dodati `fiskultura.rs` (DNS potvrda u cPanel-u) i poslati `sitemap.xml`.

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
- Linkovi udruženja (sajt, mreže, izvor članstva) se proveravaju komandom `organizations:check-links`
  (raspored: ponedeljkom u 4h — radi tek kad postoji cron ispod; do tada uz deploy `--check-links`).
  Link se isključuje na sajtu samo kad sigurno ne radi (nema domena / veze, 404, 410, 5xx); blokade botova
  (Facebook 400, 403) se vode kao „nije moguće proveriti“ i link ostaje aktivan.
- Cron (provera linkova i obaveštenja o vestima `notifications:send` na 10 minuta; bez njega obaveštenja ne stižu):
  `* * * * * /usr/local/bin/php /home/fiskultu/fiskultura_app/artisan schedule:run >> /dev/null 2>&1`
