# Handover — stanje i sledeći koraci (11. 11. 2026)

Kratak presek za nastavak rada. Konvencije su u `CLAUDE.md`, zadaci u `docs/zadaci.md`, deploy u
`docs/DEPLOY.md`, rute API-ja u `docs/api-rute.md`.

## 1. Stanje

- `main` = PR #48 (favicon, ikonice, logo; admin liste sa menijem opcija). Deploy pokrenut 11. 11.
- Admin: levi meni (Vesti / Sadržaj portala / Korisnici; urednik vidi samo prve dve grupe), hamburger levo za
  admin i desno za sajt na telefonu. Liste vesti, korisnika, pitanja, udruženja i propisa imaju opcije reda iza
  ikonice s tri tačke (`app-options-menu`).
- Korisnici: pun CRUD, lozinka admina pri unapređenju (korisnik → urednik/admin, urednik → admin), pojedinačna
  i grupna pozivnica za završetak registracije (`/zavrsi-registraciju?token=`, važi 14 dana).

## 2. Ručni koraci na produkciji (čekaju)

1. **Kontakti iz Excela**: posle deploy-a (migracija `phone`, `invited_at`) pokrenuti
   `D:\downloads\kontakti-fiskultura.sql` u phpMyAdmin-u. Upis je idempotentan; telefon je već u formatu
   `+381 …`. Pozivnice se šalju iz admina (Korisnici → filter „čekaju registraciju” → Pošalji pozive).
2. **Cron** `schedule:run` u cPanel-u (komanda u `DEPLOY.md`). Bez njega ne idu obaveštenja o vestima ni
   provere linkova i propisa.
3. **Mejl**: SPF / DKIM / DMARC za `fiskultura.rs` i probni mejl na Gmail (#16a) **pre prvih pozivnica**,
   da ne završe u spamu.
4. Google Search Console: potvrda domena i `sitemap.xml` (#3).

Lokalno: probni nalozi (`admin@`, `urednik@`, `autor@`, `korisnik@fiskultura.test`) nestali su iz lokalne
baze; vraćaju se sa `php artisan db:seed --class=UserSeeder`.

## 3. Šta može da se poboljša

Poređano po koristi u odnosu na trud.

### 3.1 Pravila sportova: jedna zajednička komponenta (najveća ušteda)

`features/sports/*` ima 10 foldera sa skoro istim fajlovima, koji se razlikuju samo po imenu klase, selektoru i
ključu u `localStorage`:

| Fajl | Kopija | Linija po kopiji |
| --- | --- | --- |
| `rules-progress.ts` | 10 | 58 |
| `rule-card-dialog.ts` | 10 | 106 |
| `rule-media.ts` | 10 | 33 |
| `rule-defs.ts` | 10 | 27 |
| `*-rules.ts` / `.html` | 10 | ~86 / ~113 |
| `*-rules.scss` | 10 | različiti (košarka 591, ostali ~110) |

Predlog: `shared/rules/` sa `RulesPage` (prima sadržaj i ključ napretka iz `data` rute), `RulesProgress`
(servis ili fabrika sa ključem), `RuleCardDialog`, `RuleMedia`. Po sportu ostaju samo `rules-content.ts` i
SVG sličice (`rule-picture.html`), koje se prosleđuju kao komponenta. Pomoćni fajlovi sami imaju 2.259 linija
u 10 kopija, pa je ušteda sa stranicama oko 2.000–3.000 linija, a nova
ispravka se pravi na jednom mestu umesto na deset. Raditi u koracima: prvo progress i dialog, pa stranica, pa
SCSS. Svaki sport se posle proveri na 360 px.

### 3.2 Admin liste: isti obrazac svuda

- **Udruženja** i **Propisi** još koriste stari `admin-toolbar` sa pretragom i ručnim „Ukupno”, umesto
  `app-filter-panel` + `app-list-header` (pravilo iz `CLAUDE.md`). Pitanja koriste `chip-row` za status umesto
  `app-list-filters`.
- Brisanje (`confirm` → `http.delete` → poruka → `reload`) je prepisano 6 puta (pitanja, udruženja, propisi,
  korisnici, vesti, profil). Predlog: `AdminActions.confirmDelete({ title, message, url, success })` u
  `core/` koji vraća `Observable<boolean>`.
- Red admin liste (`admin-row` → `admin-row-main` sa meta oznakama i naslovom → meni) ponavlja se u 5 lista.
  Predlog: `app-admin-row` sa `meta`, `title`, `link`, `options` i slotom za dodatni sadržaj.
- `state-chip` sa mapiranjem statusa u klasu (`state-ok`, `state-warn`, `state-muted`) ponavlja se u 10
  fajlova. Predlog: `app-state-chip [tone]`, ili mapa statusa → ton uz svaki model.

### 3.3 Admin forme

Četiri forme (`admin-news-form`, `-question-form`, `-regulation-form`, `-organization-form`) imaju isti tok:
učitaj po `id`, popuni, sačuvaj (POST/PUT), poruka, povratak na listu. Predlog: zajednička osnova (učitavanje
preko `httpResource` + `linkedSignal`, dugmad Sačuvaj/Odustani u `app-form-actions`, upozorenje pri izlasku sa
nesačuvanim izmenama, kojeg sada nema).

### 3.4 Veličina početnog paketa

Build javlja 867 kB početnog paketa uz budžet od 500 kB (upozorenje postoji i pre poslednjih izmena). Proveriti
`ng build --stats-json` šta ulazi u početni deo (Material moduli u zaglavlju, `simple-markdown`, sadržaj iz
`content/*.ts`) i prebaciti u lenje rute ono što ne treba naslovnoj. Ovo direktno utiče na brzinu na telefonu.

### 3.5 Testovi

Frontend ima 6 spec fajlova i 16 testova. Kandidati: `app-options-menu`, `app-list-filters`, `AuthService`
(osvežavanje tokena), `adminGuard` / redirekcija urednika. Backend ima 13 feature fajlova i dobru pokrivenost.

### 3.6 Sitno

- Pitanja, udruženja i propisi filtriraju se na klijentu i bez paginacije. Sada je to 45–50 stavki i u redu je,
  ali kad pitanja porastu preko ~200, prebaciti na server kao kod vesti.
- `.vscode/` nije u `.gitignore`.

## 4. Predlog redosleda

1. Ručni koraci sa produkcije (deo 2), da pozivnice mogu da krenu.
2. 3.2: admin liste na isti obrazac (mala grana, brzo se proveri).
3. 3.1: pravila sportova u zajedničku komponentu (veća grana, u koracima).
4. 3.4: početni paket.
5. Sledeći funkcionalni zadatak iz `zadaci.md` po izboru: #41 Kalendar, #43 Šabloni dokumenata ili #42 Oglasi.
