# Fiskultura

## Project

Portal za nastavnike fizičkog vaspitanja u Srbiji (`fiskultura.rs`): vesti i objave, strukovna
udruženja, sportovi i pravila sa PDF uputstvima, stručna pomoć, obaveštenja mejlom, linkovi ka
aplikacijama (e-pripreme, Evidencija FV, Jadžent, Zdravitas). Koncept: `docs/koncept.md`, zadaci:
`docs/zadaci.md`, istraživanje udruženja: `docs/izvori/udruzenja.md`; podaci za uvoz u bazu:
`backend/database/data/*.json` (`ContentSeeder` / `ContentImporter`, uvoz je idempotentan).

- Koren repoa: **statička naslovna** koja je sada na `fiskultura.rs` (`index.html`, `style.css`,
  `main.js`, `deploy/deploy.py`). Ostaje dok portal ne zameni naslovnu (zadatak #5).
- `frontend/`: Angular 22 SPA (zoneless, OnPush, signali), Angular Material M3 (`mat.theme` u
  `src/styles.scss`, boje i tokeni preneti iz statičke naslovne), `@ngx-translate`
  (`public/translations/sr.json`) za tekst okvira (meni, footer, dugmad); sadržaj stranica je u
  `src/app/content/*.ts`. Port 5190, `/api` ide preko `proxy.conf.json` na `127.0.0.1:8190`.
- `backend/`: Laravel 13 API, prefiks tabela `fk_` (`DB_PREFIX`), lokalno SQLite, na serveru MySQL.
  Mejl: SMTP `obavestenja@fiskultura.rs` (lozinka samo u `backend/.env` i na serveru; lokalno
  `MAIL_MAILER=log`, za probu slanja `smtp`). Auth: JWT access (60 min) + refresh sa rotacijom kao u
  evidencija-fv, uloge `user` / `author` / `editor` / `admin`, middleware `jwt` i `role:...`,
  potvrda mejla i nova lozinka preko `UserTokenService` (u bazi samo hash). Rute: `docs/api-rute.md`.
  Lokalni nalozi (seed): `admin@`, `urednik@`, `autor@`, `korisnik@fiskultura.test`, lozinka `lozinka123`.

Isti obrasci kao `D:\Playground\Angular\evidencija-fv` (auth, kontroleri, deploy) i
`D:\Playground\Angular\kosarkaska-evidencija` (`features/rules` — igraonica pravila, kviz, SVG
sličice) — pogledaj te repoe ako nešto ovde nije eksplicitno napisano.

## Working conventions

- Sva komunikacija sa korisnikom ide isključivo na srpskom (latinica). Kod i identifikatori su na
  engleskom; rute i slug-ovi na srpskom (`/vesti`, `/udruzenja`, `/sportovi`).
- Bez komentara u kodu. Preserve unrelated user changes in the working tree.
- Angular: `input()`/`output()`/`model()`, `inject()`, `@if`/`@for`, `[class.x]`, bez `NgModule`-a,
  bez `standalone: true`, bez getter/setter-a, stanje u `signal()`/`computed()`, čitanje sa API-ja
  preko `httpResource`.
- Material dugmad: `mat-flat-button` glavna akcija, `mat-stroked-button` sporedna; boje preko
  `--mat-sys-*` i tokena iz `styles.scss` (`--color-primary`, `.accent-*`), ne `color="primary"`.
- **Mobile first**: većina posetilaca dolazi sa telefona. Osnovni stilovi su za telefon (od 360 px), šire
  ekrane dodaje `@media (min-width: ...)`; nikad obrnuto. Dodirne površine bar 44 px, bez horizontalnog
  skrola, modali na telefonu preko celog ekrana, filteri i forme u jednoj koloni. Svaka nova stranica se
  proverava na 360 px (svetla i tamna tema) pre PR-a.
- Liste vesti otvaraju vest u modalu (`NewsDialogService`); `/vesti/:slug` ostaje stalni link (deljenje, SEO).
  „Objave“ kod udruženja vode na `/vesti?udruzenje=<slug>`, ne na stranicu udruženja.
- Linkovi udruženja su kartice sa ikonicom (`app-org-links`); link koji `organizations:check-links` označi
  kao `broken` je onemogućen. Blokade botova (Facebook 400, 403) su `unknown` i link ostaje aktivan.
- Ikonice: `<app-icon name="...">` (`shared/icon/icon.ts`, putanje iz statičke naslovne).
- Prenete objave udruženja: sažetak svojim rečima + link na izvor, nikad kopiran tekst.
- Ne dodavati tajne u repozitorijum.

## Local development

```bash
node dev.mjs                       # backend 8190 + frontend 5190
cd backend && php artisan test
cd frontend && npx ng build && npx ng test
```
