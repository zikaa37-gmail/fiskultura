# Zadaci

Spremni za GitHub Issues (naslov = `###`, telo = tekst ispod). Labela faze u zagradi. Koncept i
obrazloženje su u `koncept.md`.

## Opšti zadaci (važe kroz sve faze)

### #1 Konvencije i radni tok (opste)
`CLAUDE.md` po uzoru na `evidencija-fv` (signali, zoneless, OnPush, Material M3, prevodi, bez
komentara u kodu, `present()` u kontrolerima, `POST .../list` za liste sa filterima),
`docs/git-workflow.md` (issue → grana → PR), `docs/api-rute.md`.

### #2 Dizajn sistem iz statičke naslovne (opste)
Material M3 tema sa paletom iz `style.css` (primarna `#1d4ed8`, tercijarna limeta), Inter, tamna
tema, tokeni za akcent kartica (plava, limeta, narandžasta, nebo, ljubičasta, roze). Deljene
komponente: kartica modula, status-čip, sekcija sa naslovom, prazno stanje, loader, potvrda brisanja.
- [ ] Izgled kao na fiskultura.rs na 360 px i 1280 px, svetla i tamna tema

### #3 SEO osnova (opste)
`<title>`, description i og: tagovi po ruti (`Title` + `Meta` servis), prerender statičnih ruta,
Laravel ubacuje meta tagove za `/vesti/:slug` i `/udruzenja/:slug`, `sitemap.xml`, `rss.xml`,
`robots.txt`.

### #4 Izvori i uređivački proces (opste, sadrzaj)
Lista izvora koje urednik prati (sajtovi i FB stranice udruženja, Ministarstvo prosvete, ZUOV,
savez za školski sport, Zdravitas), učestalost provere, pravila prenošenja (sažetak + link, bez
kopiranja), pravila za fotografije (sopstvene ili uz dozvolu, deca samo uz saglasnost).

### #5 Deploy na cPanel (opste)
`deploy/` kao u `evidencija-fv`: build frontenda u `public_html`, Laravel van `public_html`,
`.htaccess` za SPA + `/api`, jednokratni PHP za migracije. Statička naslovna se zamenjuje tek kad
faza 1 prođe proveru.

## Faza 1 — kostur, javni portal, vesti, udruženja

### #6 Kostur frontenda (faza-1)
`frontend/`: Angular 22 standalone, zoneless, Material, `@ngx-translate` (`sr.json`), rute, shell
(top bar + footer kao na naslovnoj, mobilni meni), proxy `/api` na `127.0.0.1:8190`, port 5190.
- [ ] `ng build` i `ng test` prolaze

### #7 Kostur backenda (faza-1)
`backend/`: Laravel 13, MySQL `fiskultura`, `DB_PREFIX=fk_`, JWT + refresh (kao `evidencija-fv`),
CORS za lokal, `php artisan test` prolazi, `dev.mjs` u korenu diže oba.

### #8 Naslovna (faza-1)
Prenos statičke naslovne: hero, traka sa brojkama, kartice delova portala (sa slike) proširene
vestima, udruženjima i stručnom pomoći, „za koga", vežba dana. Najnovije 3 vesti i istaknuta
objava udruženja.

### #9 Stranica „Aplikacije" (faza-1)
Kartice za e-pripreme, Evidenciju FV, Jadžent i Zdravitas (naziv, opis, link, snimak ekrana).
Linkovi i u top baru / footeru.

### #10 Nalozi i uloge (faza-1)
Registracija korisnika (mejl + potvrda), prijava, zaboravljena lozinka, profil (škola, opština,
okrug). Uloge `user` (korisnik: nastavnici FV, učitelji i svi zainteresovani), `author`, `editor`, `admin`. Guard-ovi na frontendu, middleware na backendu.

### #11 Vesti — backend (faza-1)
Tabele `fk_news`, `fk_news_categories`, `fk_tags`, pivot; CRUD za urednika, javne rute
(`POST /api/news/list` sa filterima, `GET /api/news/{slug}`), status nacrt / objavljeno / zakazano,
naslovna slika (upload, WebP). Testovi.

### #12 Vesti — javni prikaz (faza-1)
`/vesti` (lista, filteri kategorija / organizacija / godina, pretraga, paginacija), `/vesti/:slug`
(tekst, izvor, srodne vesti, deljenje).

### #13 Admin: vesti (faza-1)
`/admin/vesti`: lista sa filterima, forma sa rich text editorom, slika, kategorija, oznake, izvor,
zakazano objavljivanje, pregled pre objave.

### #14 Udruženja — backend i seed (faza-1)
Tabele `fk_organizations`, veza vest → organizacija; seed iz `docs/izvori/udruzenja.json` i
`docs/izvori/objave.json` (objave se uvoze kao vesti kategorije „udruženja", sa izvorom).

### #15 Udruženja — javni prikaz i admin (faza-1)
`/udruzenja` (filteri po tipu, nivou, okrugu), `/udruzenja/:slug` (podaci + objave), `/admin/udruzenja`.

### #15a Mreža udruženja: SSPFVS i članice (faza-1)
`parent_id` na organizaciji (SSPFVS krovno, 15 redovnih članica sa https://sspfvs.wixsite.com/sspfvs/o-nama),
izvor podatka o članstvu. Na `/udruzenja` istaknut SSPFVS, ispod članice po okrugu, zatim ostale
organizacije (školski sport, institucije, fakulteti, sindikati).
- [ ] Za svaku članicu prikupiti sajt / FB / kontakt (sada većina nepoznato)

### #15b Pokrivenost i „Osnuj društvo u svom gradu" (faza-1)
Spisak okruga i gradova (šifarnik) sa statusom: postoji aktivno / postoji neaktivno / nema. Mapa
Srbije (SVG po okruzima) kasnije. Vodič za osnivanje (koraci, primer statuta, APR, učlanjenje u
SSPFVS — sadržaj dogovoriti sa SSPFVS) i forma „zainteresovan sam za društvo u <grad>" — kad se
skupi bar 3 kolege, obaveštenje SSPFVS-u i prijavljenima.

### #15c Izvori organizacija i red za urednika (faza-1)
Tabela `fk_organization_sources` (organizacija, tip: sajt / rss / facebook / instagram / youtube,
URL, način praćenja: automatski / ručno, poslednja provera). Komanda `sources:check` (cron, jednom
dnevno) čita RSS i javne stranice gde je dozvoljeno, nove stavke idu u `fk_news_suggestions`
(naslov, link, datum, izvor) — urednik ih jednim klikom pretvara u vest sa sažetkom. Forma
„Pošalji objavu" za udruženja bez naloga.

### #15d Oznaka izvora na vesti (faza-1)
Vest ima `organization_id`, `source_url`, `source_type` (sajt / Facebook / ...), `source_published_at`.
U prikazu: čip organizacije (link na `/udruzenja/:slug`), „Preuzeto sa: ...", datum originala, link.
Filteri na `/vesti`: organizacija, „SSPFVS i članice", okrug. Obaveštenja mejlom mogu da se prate
po organizaciji.

### #16 Admin: korisnici i šifarnici (faza-1)
Lista korisnika, promena uloge, blokiranje; kategorije vesti, oznake, okruzi.

### #16a Slanje mejlova (faza-1)
SMTP `obavestenja@fiskultura.rs` (kredencijali u `backend/.env` i na serveru, ne u gitu),
Laravel Mailables sa zajedničkim šablonom u bojama portala, queue `database` + cron `schedule:run`,
ograničenje po satu (limit hostinga), tabela `fk_mail_log`. Sistemski mejlovi: potvrda naloga,
zaboravljena lozinka. SPF/DKIM/DMARC za domen proveriti u cPanel-u.
- [ ] Probni mejl stiže na Gmail i ne ide u spam

### #16b Pretplata na obaveštenja (faza-1)
Tabela `fk_subscriptions` (mejl, korisnik opciono, šta prati: kategorije / udruženja / okrug / sportovi,
učestalost `instant` | `weekly`, kanal `mail`, potvrđeno, token za odjavu). Prijava bez naloga uz
dvostruki opt-in, odjava jednim klikom, stranica „Moja obaveštenja" za ulogovane.

### #16c Slanje obaveštenja o vestima (faza-1)
Na objavu istaknute vesti → `instant` pretplatnicima koji prate tu kategoriju/organizaciju; nedeljni
pregled ponedeljkom u 7h. Kanal kroz interfejs (`NotificationChannel`), da se kasnije dodaju
WhatsApp / Viber / push bez promene logike. Admin vidi broj poslatih i odjava.

## Faza 2 — sportske igre i PDF uputstva

### #17 Model sadržaja za sport (faza-2)
Sport → kartice pravila (naslov, sličica, kadrovi dobro/loše, objašnjenje) + kviz + „za čas" +
zvanični izvori. Sadržaj u TS fajlovima kao u `kosarkaska-evidencija/features/rules`
(`rules-content.ts`, `rule-picture`), kasnije u bazi ako urednik treba da ga menja.

### #18 Komponente pravila (faza-2)
Prenos i uopštavanje `rules` iz `kosarkaska-evidencija`: igraonica, kviz sa zvezdicama, napredak,
zvanična pravila; SVG sličice parametrizovane po terenu (košarka, odbojka, rukomet, fudbal).
Rute `/sportovi`, `/sportovi/:sport`.

### #19 Košarka (faza-2, sadrzaj)
Prenos sadržaja iz `kosarkaska-evidencija` prilagođen školskom času + „kako sa 30 dece".

### #20 Odbojka (faza-2, sadrzaj)
Teren, rotacija, servis, tri dodira, dvostruki dodir, mreža, prijem, poeni; mini odbojka za školu.

### #21 Rukomet (faza-2, sadrzaj)
Teren i prostor golmana, koraci (3), 3 sekunde, dupla lopta, faul, isključenje, sedmerac; mini rukomet.

### #22 Mali fudbal (faza-2, sadrzaj)
Teren, aut i korner, kazneni prostor, faul i akumulirani faul, golman, izmene u letu.

### #23 Slikovito PDF uputstvo po sportu (faza-2)
Print stranica `/sportovi/:sport/uputstvo` (A4, sličice + kratko pravilo + česte greške + „za čas"),
dugme „Preuzmi PDF"; zatim pre-generisani PDF pri build-u (headless Chrome) za brže preuzimanje.
- [ ] Čitljivo crno-belo, 2–6 strana

## Faza 3 — atletika, gimnastika, elementarne igre, plesovi, jadžent

### #24 Atletika (faza-3, sadrzaj)
Discipline iz programa (trčanja, skokovi, bacanja, štafeta): faze tehnike sa sličicama, česte greške,
metodski niz, merenje, ocenjivanje, pravila takmičenja (prestup, nulti skok, start). PDF uputstvo.

### #25 Gimnastika (faza-3, sadrzaj)
Elementi po spravi (tlo, preskok, greda, vratilo, razboj, krugovi, karike) i razredu, metodski niz,
čuvanje i pomaganje, mere sigurnosti. PDF uputstvo.

### #26 Elementarne igre (faza-3, sadrzaj)
Kartica igre (uzrast, učesnici, prostor, oprema, pravila, varijante): „Između dve vatre", „Graničar",
štafetne igre, igre hvatanja... Filter po uzrastu i delu časa. PDF zbirka.

### #27 Plesovi (faza-3, sadrzaj)
Narodna kola i društveni plesovi iz programa: koraci po taktovima, muzika, video link, uzrast. PDF.

### #28 Jadžent (faza-3)
Stranica sporta sa kratkim pravilima i linkom na https://jadzent.fiskultura.rs (i PDF pravila sa
tog sajta, uz dozvolu).

## Faza 4 — stručna pomoć

### #29 Blog / stručni tekstovi (faza-4)
Tabela tekstova sa autorom, temom, oznakama; autor piše, urednik odobrava; `/strucno`, `/strucno/:slug`,
profil autora.

### #30 Administracija nastavnika — vodiči (faza-4, sadrzaj)
ES dnevnik, ocenjivanje (formativno / sumativno, opisno), oslobađanje od nastave, planiranje,
izveštaji, sekcije; šabloni dokumenata za preuzimanje.

### #31 Pravna pitanja (faza-4)
Pitanja i odgovori sa propisom i datumom važenja, pretraga, „postavi pitanje" (ide uredniku),
napomena da nije pravni savet; biblioteka propisa sa linkovima na zvanične tekstove.

### #32 Predlozi za unapređenje nastave (faza-4)
Nastavnik šalje predlog, urednik objavljuje, glasanje i komentari.

## Faza 5 — takmičenja i obaveštavanje

### #33 Kalendar školskih takmičenja (faza-5)
Sport, nivo, mesto, datum, propozicije, rezultati; izvor savez za školski sport.

### #34 Za razmišljanje: WhatsApp / Viber kanal (faza-5, ideja)
Proceniti WhatsApp Channel / Viber zajednicu (ručno objavljivanje) naspram WhatsApp Business API-ja
(plaćeno po poruci, odobreni šabloni). Ne raditi pre nego što mejl obaveštenja zažive.

### #34a Za razmišljanje: AI pomoć (faza-5, ideja)
Asistent nad sadržajem portala (vodiči, pravna pitanja, propisi, vesti) sa citiranjem izvora; pomoć
uredniku pri sažimanju objava. Proceniti trošak, odgovornost i privatnost pre bilo kakve izrade.

### #35 Nalozi za udruženja (faza-5)
Udruženje dobija urednika ograničenog na svoje objave; pouzdana udruženja objavljuju bez odobrenja.
Prvo SSPFVS, pa članice.

## Faza 6 — zajednica

### #36 Prilozi nastavnika (vesti, tekstovi, igre) na odobrenje (faza-6)

### #37 Vežbaj kod kuće i izazov odeljenja (faza-6)
