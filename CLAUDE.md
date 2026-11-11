# Fiskultura

## Project

Portal za nastavnike fizičkog vaspitanja u Srbiji (`fiskultura.rs`): vesti i objave, strukovna
udruženja, sportovi i pravila sa PDF uputstvima, stručna pomoć, obaveštenja mejlom, linkovi ka
aplikacijama (e-pripreme, Evidencija FV, Jadžent, Zdravitas). Koncept: `docs/koncept.md`, zadaci:
`docs/zadaci.md`, istraživanje udruženja: `docs/izvori/udruzenja.md`; podaci za uvoz u bazu:
`backend/database/data/*.json` (`ContentSeeder` / `ContentImporter`, uvoz je idempotentan).

- Koren repoa: **statička naslovna** koja je sada na `fiskultura.rs` (`index.html`, `style.css`,
  `main.js`, `deploy/deploy.py`). Ostaje dok portal ne zameni naslovnu (zadatak #5).
- `frontend/`: Angular 22 sa SSR-om (zoneless, OnPush, signali): javne stranice se prerenderuju pri deploy-u
  (`app.routes.server.ts`), SEO svake stranice ide kroz `core/seo/seo.service.ts` (ruta `data.seo` ili detalj sam
  zove `SeoService.set`); kod koji dira `localStorage`/`window` mora da radi i na serveru. Angular Material M3 (`mat.theme` u
  `src/styles.scss`, boje i tokeni u `src/theme/styles/colors.scss`, preneti iz statičke naslovne). Bez biblioteke za prevode: sav tekst je na
  srpskom, direktno u šablonima; duži sadržaj stranica je u `src/app/content/*.ts`. Port 5190, `/api` ide preko `proxy.conf.json` na `127.0.0.1:8190`.
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
- Tema je u `src/theme/`: `styles/` (`colors.scss` tokeni i tamna tema, `buttons.scss`) i `ui/` (direktive i
  komponente koje prilagođavaju Material). Dugmad: u `imports` ide `BUTTON_IMPORTS` iz `theme/ui/button`, ne
  `MatButtonModule`; direktiva `AppButton` prima `theme="primary|secondary|tertiary|danger"` i
  `size="xs|sm|md|lg|xl"` (podrazumevano `primary`, `md` = 44 px), zaobljenje 8 px. `mat-flat-button` glavna
  akcija, `mat-stroked-button` sporedna; `theme="tertiary"` (neutralno) za česte akcije u listama (otvori tekst,
  istorija, prikaži više), da stranica ne bude previše plava; `theme="danger"` za brisanje. Boje preko tokena,
  ne `color="primary"` ni klase za boju dugmeta. Polja (input, select, textarea): `FORM_FIELD_IMPORTS` iz
  `theme/ui/form-field` umesto `MatFormFieldModule`, direktiva `AppFormField` na `mat-form-field` prima isti
  `size` (stilovi u `form-fields.scss`); visine i zaobljenje su zajednički u `sizes.scss`, pa su dugme i polje
  iste veličine uvek iste visine.
- Kartice su male i stoje jedna do druge (na telefonu dve u redu gde stane); dugačak sadržaj ide u modal, a
  kartica ima naziv i kratak tekst. Boja kartice dolazi iz `.accent-*` (ikonica u `.tint-icon`, blaga pozadina).
  Oznake (oblast, status) su male labele, ne linkovi. Telefon i mejl su `tel:` i `mailto:` linkovi
  (`telHref`), mejl se lomi pre „@” i ima dugme za kopiranje. Dugme „na vrh” (`app-back-to-top`) je globalno.
- Za ljude, ne za advokate: na vrhu ide sažetak „šta važi i šta se menja” jednostavnim rečima, a spisak
  propisa je ispod ili sklopljen. Link na propis vodi na navedeni član (`regulationTextUrl`, sidra
  `#clan_N` na paragraf.rs).
- Razmaci: klase `mb-1`…`mb-5` (4, 8, 12, 16, 24 px) iz `styles.scss`, ne `style="..."`. Tekst iznad kartica
  ili liste (npr. `result-count`) uvek ima razmak do njih. Bez `ngTemplateOutlet`: deo šablona koji se ponavlja
  postaje mala komponenta.
- **Mobile first**: većina posetilaca dolazi sa telefona. Osnovni stilovi su za telefon (od 360 px), šire
  ekrane dodaje `@media (min-width: ...)`; nikad obrnuto. Dodirne površine bar 44 px, bez horizontalnog
  skrola, modali na telefonu preko celog ekrana, filteri i forme u jednoj koloni. Svaka nova stranica se
  proverava na 360 px (svetla i tamna tema) pre PR-a.
- Liste sa filterima: filteri su `app-list-filters` (`shared/list-filters`, polja i opcije se prosleđuju kao
  `FilterField[]`, vrednosti u `values`, izmena kroz `filterChange`, sažetak i „Poništi filtere” su ugrađeni), a
  poseban raspored ide direktno u `app-filter-panel`. Javna i admin lista iste vrste su jedna komponenta sa
  nivoom pristupa (`app-news-list`, `[admin]` iz `data` rute), filteri u query parametrima (`queryFilters([...])`
  i `matchesSearch` iz `shared/list-filters/query-filters.ts`). Opcije reda su `app-options-menu` (tri tačke), a
  brisanje sa potvrdom ide kroz `DeleteService.confirmDelete` (`core/delete.service.ts`). Filteri idu u `app-filter-panel` (`shared/filter-panel`, sklopiv panel sa sažetkom
  izabranog u zaglavlju; na telefonu sklopljen i polja preko cele širine, na desktopu otvoren i polja u redu),
  a ispod njega `app-list-header` (`Ukupno: N` levo, glavna akcija desno). Duga lista koja treba da se skroluje
  ispod filtera ide u `app-scroll-area` (`[fill]="true"` zauzme ostatak ekrana, pa filteri i paginacija ostaju
  vidljivi). Paginacija je uvek `app-pagination` (`shared/pagination`, strelice i brojevi strana; na telefonu
  strelice i „Strana N / M”).
- Svaki modal koristi `app-dialog-shell` (`shared/dialog-shell`): zaglavlje sa naslovom i X, telo (jedino se
  skroluje) i podnožje sa dugmadima (`dialogActions`); panel klasa `app-dialog-panel`, ne `mat-dialog-content`.
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
