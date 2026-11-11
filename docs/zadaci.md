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

### #3 SEO osnova (opste) — urađeno (bez RSS)
`<title>`, description i og: tagovi po ruti (`Title` + `Meta` servis), prerender statičnih ruta,
Laravel ubacuje meta tagove za `/vesti/:slug` i `/udruzenja/:slug`, `sitemap.xml`, `rss.xml`,
`robots.txt`.
- [x] Angular SSR: prerender svih javnih stranica pri deploy-u (i svake vesti, udruženja i pitanja)
- [x] `SeoService`: title, description, canonical, robots, Open Graph, Twitter, JSON-LD (NewsArticle, QAPage, Organization, BreadcrumbList)
- [x] `sitemap.xml` (Laravel, uvek aktuelan), `robots.txt`, slika za deljenje `og-image.png`
- [ ] `rss.xml` za vesti
- [ ] Google Search Console: potvrda domena i slanje sitemap-a

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
`frontend/`: Angular 22 standalone, zoneless, Material, rute, shell
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
Tabele `fk_organizations`, veza vest → organizacija; seed iz `backend/database/data/organizations.json` i
`news.json` (objave se uvoze kao vesti kategorije „udruženja", sa izvorom).

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

### #15e Istraživanje: odobreni seminari za FV po školskoj godini (faza-1, sadrzaj)
Gde ZUOV objavljuje Katalog programa stalnog stručnog usavršavanja i liste odobrenih stručnih skupova,
u kom formatu (pretraga, PDF, Excel), koliko često se menjaju; izdvojiti sve programe za FV i školski
sport za tekuću i prethodnu školsku godinu u `backend/database/data/seminars.json`. Dopuniti iz sajtova
realizatora (SSPFVS, UPFK, fakulteti).

### #15f Seminari — backend (faza-1)
Tabele `fk_school_years`, `fk_seminars` (naziv, kataloški broj / rešenje, realizator →
organizacija, oblik, bodovi, trajanje, kompetencija, prioritet, ciljna grupa, cena, link, izvor) i
`fk_seminar_sessions` (datum, mesto, okrug, onlajn, link za prijavu); pivot seminar ↔ školska godina.
`POST /api/seminars/list` sa filterima, seed iz `backend/database/data/seminars.json`. Testovi.

### #15g Seminari — javni prikaz i admin (faza-1)
`/seminari` sa izborom školske godine, filterima i „uskoro", stranica seminara sa terminima;
`/admin/seminari` (unos, uvoz liste iz ZUOV-a, novi termin). Nov program / termin automatski predlaže
vest kategorije „Seminari" i ide u obaveštenja po okrugu i realizatoru.

### #15h Sačuvani seminari i podsetnik (faza-2)
Nastavnik čuva seminar, mejl podsetnik 7 dana i 1 dan pred termin; kasnije lična evidencija bodova.

### #16 Admin: korisnici i šifarnici (faza-1)
Lista korisnika, promena uloge, blokiranje; kategorije vesti, oznake, okruzi.

### #16a Slanje mejlova (faza-1)
SMTP `obavestenja@fiskultura.rs` (kredencijali u `backend/.env` i na serveru, ne u gitu),
Laravel Mailables sa zajedničkim šablonom u bojama portala, queue `database` + cron `schedule:run`,
ograničenje po satu (limit hostinga), tabela `fk_mail_log`. Sistemski mejlovi: potvrda naloga,
zaboravljena lozinka. SPF/DKIM/DMARC za domen proveriti u cPanel-u.
- [ ] Probni mejl stiže na Gmail i ne ide u spam

### #16b Pretplata na obaveštenja (faza-1) — urađeno
Tabela `fk_subscriptions` (mejl, korisnik opciono, šta prati: kategorije / udruženja / okrug / sportovi,
učestalost `instant` | `weekly`, kanal `mail`, potvrđeno, token za odjavu). Prijava bez naloga uz
dvostruki opt-in, odjava jednim klikom, stranica „Moja obaveštenja" za ulogovane.

### #16c Slanje obaveštenja o vestima (faza-1) — urađeno
Na objavu istaknute vesti → `instant` pretplatnicima koji prate tu kategoriju/organizaciju; nedeljni
pregled ponedeljkom u 7h. Kanal kroz interfejs (`NotificationChannel`), da se kasnije dodaju
WhatsApp / Viber / push bez promene logike. Admin vidi broj poslatih i odjava.
- [x] `/obavestenja` (prijava, podešavanja preko linka, „Moja obaveštenja“), potvrda i odjava jednim klikom
- [x] `notifications:send` na 10 minuta, limit po satu, `fk_notification_log`, admin kartica „Obaveštenja“
- [ ] Okrug i sportovi kao filteri kada vesti dobiju okrug / sport
- [ ] Cron `schedule:run` na serveru (bez njega se ništa ne šalje) i probni mejl na Gmail (#16a)

## Faza 1b — centar informisanja i pomoći kolegama

Cilj: fiskultura.rs je mesto na koje nastavnici FV iz cele Srbije dolaze po informaciju i pomoć.
Redosled: #38 → #39 → #16b/#16c (obaveštenja) → #40 → #41 → ostalo.

### #38 Propisi i literatura na portalu — jedan izvor (faza-1b) — urađeno (prvo izdanje)
Biblioteka na `/propisi`: zakoni, pravilnici (plan i program po razredu, ocenjivanje, norma, kalendar,
zaštita učenika), stručna literatura i korisni linkovi (Službeni glasnik, Ministarstvo, ZUOV, Zdravitas).
Zapis: naziv, vrsta, oblast, razredi / nivo, broj i datum glasila, važi od / do, link na zvaničan tekst,
kratko „šta je bitno za FV", istorija izmena (stara verzija ostaje vidljiva kao nevažeća).
Početni podaci: preuzeti iz kataloga „Literatura" u e-pripremama (`api/database/seeders/data`,
`RegulationCatalogSeeder`), bez dupliranja. Pretraga i filteri, admin za urednika.
- [x] Isti format kao katalog „Literatura“ u e-pripremama (vrste, oblasti, proverenost, istorija verzija)

### #39 E-pripreme čitaju propise sa portala (faza-1b, repo e-pripreme-fv) — urađeno (e-pripreme-fv PR #87)
Javni API portala `GET /api/regulations` (sa `updated_since`); e-pripreme zadržavaju svoj modul
„Literatura", ali ga pune sa portala (komanda za sinhronizaciju + nedeljni raspored), lokalne
izmene super admina se ne gaze. Kasnije isto i za druge aplikacije (Evidencija FV).
- [x] `regulations:sync` u e-pripremama (`--dry-run`, `--full`), ponedeljkom u 5:30, `edited_locally`
- [ ] #38 pušten na fiskultura.rs (sada `/api/regulations` vraća 404), pa prvo preuzimanje
  `deploy.py --regulations` u e-pripremama
- [ ] Cron `schedule:run` za e-pripreme u cPanelu (`e-pripreme-fv/docs/DEPLOY.md`)

### #40 Pitanja i odgovori — administracija i pravna pitanja (faza-1b) — urađeno
Proširenje #31: kategorije (norma i fond časova, ocenjivanje, oslobađanje od nastave, odgovornost i
bezbednost na času, takmičenja, Zdravitas, ES dnevnik). Odgovor ima poziv na propis iz #38 i datum
„važi na dan". „Postavi pitanje" (prijavljeni korisnik) → urednik odgovara i objavljuje anonimno; mejl
pitaocu. Napomena da odgovor nije pravni savet.
- [x] `/pitanja` (oblasti, pretraga), `/pitanja/:slug` sa propisima i „važi na dan“, `/pitanja/postavi` i „Moja pitanja“
- [x] Admin „Pitanja“: red na čekanju, originalno pitanje samo za urednika, mejl pitaocu pri objavi
- [x] 4 početna odgovora iz sažetaka propisa (`data/questions.json`); urednik treba da ih pročita pre puštanja

### #41 Kalendar sa podsetnicima (faza-1b)
`/kalendar`: školski kalendar (iz pravilnika za tekuću godinu), takmičenja (#33), seminari (#15f),
rokovi (unos u Zdravitas, izveštaji, prijave za takmičenja). Filter po okrugu i vrsti; pretplata na
podsetnik mejlom (7 dana i 1 dan pre); izvoz u Google / Outlook kalendar (iCal).

### #42 Oglasi: konkursi škola i zamene (faza-1b)
Škola ili kolega objavljuje oglas (radno mesto nastavnika FV, zamena, honorarni rad u sekciji);
urednik odobrava; rok važenja, okrug, link na zvanični konkurs; obaveštenje mejlom po okrugu.

### #43 Šabloni dokumenata (faza-1b, sadrzaj)
Preuzimanje šablona: operativni plan, izveštaj sekcije, saglasnost roditelja za takmičenje,
zapisnik testiranja, molba za oslobađanje, plan rada aktiva. Word / PDF, oznaka verzije i propisa.

### #44 Glas struke: ankete i inicijative (faza-1b)
Urednik pokreće anketu (npr. „broj časova FZV nedeljno"); glasaju prijavljeni nastavnici (jedan glas,
okrug i nivo škole za analizu); rezultati javni po zatvaranju i šalju se SSPFVS-u i udruženjima.
Inicijative sa potpisima kolega (ime, škola, opština; javno samo broj).

### #45 Saradnja škola (faza-1b, kasnije)
Oglasna tabla po opštini: prijateljske utakmice, zajednički turniri, pozajmica opreme, zajednički
prevoz na takmičenja.

### #46 Linkovi udruženja: ručna potvrda (faza-1b) — urađeno
Automatska provera (`organizations:check-links`) za sajtove i YouTube; Facebook i Instagram server ne
može da proveri, pa urednik ručno označava link koji ne radi (admin, kvačica „ne radi"), a podaci
mogu da nose `brokenLinks`. Ručna oznaka se ne gubi dok automatska provera ne potvrdi da link radi.
Instagram kartica je uvek prikazana, posivljena dok udruženje nema nalog.

### #47 ZUOV i praćenje zvaničnih izvora (faza-1b, sadrzaj)
ZUOV je jedno od centralnih mesta za informisanje nastavnika. Radi se na posebnoj grani, posle
ishoda po razredima.

Istraživanje:
- sve što ZUOV objavljuje u vezi sa nastavom fizičkog i zdravstvenog vaspitanja (programi, priručnici,
  standardi, obuke, planovi realizacije);
- katalog stalnog stručnog usavršavanja, oblast 17
  (<https://zuov-katalog.rs/index.php?action=page/catalog/all&oblast=17>): svih 25 seminara sa
  linkom na stranicu programa u katalogu (naziv, autori, trajanje, bodovi, kompetencija, prioritet);
  prikaz na portalu uz seminare iz vesti.

Stranice ZUOV-a koje pratimo:
- <https://zuov.gov.rs/download-category/zdravstveno-vaspitanje/>
- <https://zuov.gov.rs/category/vesti/>
- <https://zuov.gov.rs/konkursi-za-prosvetne-radnike-i-skole/>
- <https://zuov.gov.rs/novi-pravilnici-vesti-i-obavestenja/>

Periodični pregled izvora:
- zapisan spisak mesta koja se proveravaju (zakoni i pravilnici u PIS-u, Prosvetni glasnik, ZUOV,
  Ministarstvo, konkursi, katalog seminara, udruženja), sa redosledom i učestalošću provere;
- PIS ima javni API: ELI adresa (`https://slgl.pravno-informacioni-sistem.rs/api/prins/eli/rep/pg/...`)
  daje GUID propisa, `https://reg.pravno-informacioni-sistem.rs/api/GetLawActViewByLawAdActGuid`
  daje naslov sa spiskom svih izmena (npr. „5/2019-6, 1/2020-1, …”) i HTML svake izmene. Nova
  izmena = novi broj glasnika u naslovu;
- komanda/zakazani posao beleži stanje svakog izvora (poslednja izmena, poslednja objava) i javlja
  uredniku šta je novo; ništa se ne objavljuje samo, urednik pregleda i odobri;
- kad se promeni propis: ažurirati propise, pitanja i odgovore, ishode i planove koji ga navode
  (polje „važi od”) i objaviti kratku vest sa linkom na zvanični tekst.
- [ ] Spisak izvora sa redom provere u `docs/izvori/pracenje.md`
- [ ] Seminari iz kataloga ZUOV (oblast 17) na portalu, sa linkom na katalog
- [ ] Provera izmena propisa preko PIS-a i novih objava ZUOV-a, izveštaj uredniku

### #48 Propisi: šta važi danas, istorija i provera (faza-1b, centralno)
Pravilo portala: ono što važi danas uvek je istaknuto. Raniji propisi ostaju kao istorija, a kratko
hronološko objašnjenje kaže šta se, kada i zašto promenilo, da nastavnici „jednom zauvek znaju šta je
prava istina”. Mnoge kolege rade po pravilima koja više ne važe (primer: fond časova FZV).

Sve ide u okviru `/propisi`, koja sada izgleda kao prost spisak i niko je ne otvara. Postaje glavno mesto
za pravila. Tabovi odvajaju ono što važi od starog, a jedan tab je priča. Tab se pamti u adresi
(`?tab=istorija`), pa se link deli tačno na željeni deo. Na telefonu su tabovi preko cele širine, a zaglavlje
tabova ostaje vidljivo pri skrolu.

Stranica `/propisi`:
- **Važeće** (podrazumevani tab):
  - kartice tema „Šta važi danas”, svaka sa jednom rečenicom šta važi i oznakom „menja se od …” kad je
    izmena objavljena;
  - „Novo u propisima”: poslednje izmene i ono što stupa na snagu, sa datumom;
  - katalog važećih propisa, uključujući i objavljene koji se primenjuju kasnije (oznaka „primenjuje se
    od …”);
- **Ranije**: propisi koji više ne važe. Svaki ima oznaku „ne važi od …” i link na propis koji ga je zamenio.
  Ništa se ne briše;
- **Kako se menjalo**: priča i opis. Hronološki pregled velikih promena (npr. reforma programa 2017–2021,
  fond časova, ocenjivanje 2024, novi programi od 2027/28): šta je bilo, šta je sad i zašto je bitno, sa
  linkovima na teme i zvanične tekstove.

Stranica teme `/propisi/:tema` (npr. `/propisi/fond-casova`) ima iste tabove:
- **Važi danas**:
  - pravilo u 2–5 rečenica, od kada važi, po kom propisu (link na PIS) i kad je poslednji put provereno;
  - **Šta se menja**: izmene koje su objavljene, a još se ne primenjuju (npr. od 2027/28);
  - **Česte zablude**: „mislio sam da…” → šta važi i od kada;
  - veze ka pitanjima i odgovorima, ishodima, vestima i aplikacijama koje se oslanjaju na temu;
- **Ranije**: prestali propisi o temi, sa periodom važenja i šta su propisivali;
- **Kako se menjalo**: priča o temi i vremenska linija, od najnovijeg ka starijem. Svaka stavka ima datum,
  propis i šta je promenio.

Mesto na sajtu:
- stavka „Propisi” u meniju vodi na novu stranicu; na naslovnoj je blok „Šta važi od 1. septembra” i
  „Novo u propisima”;
- propis ima polja `replaces` i `replacedBy`, pa se iz zastarelog propisa vidi koji ga je zamenio;
- odgovor, vest ili ishod koji se poziva na propis koji više ne važi dobija upozorenje i link na važeću temu.

Hronologija uz pomoć AI-ja:
- nacrt sažetka i vremenske linije piše AI, i to samo iz zvaničnih tekstova (PIS, „Prosvetni glasnik”,
  ZUOV);
- urednik ga čita, ispravlja i odobrava. Na stranici piše „pripremljeno uz pomoć AI-ja, proverio urednik,
  datum”;
- ništa se ne objavljuje bez odobrenja.

Mehanizam provere (nastavlja #47):
- komanda `sources:check` po rasporedu (cron) proverava listu izmena svakog propisa u PIS-u i nove objave
  ZUOV-a i Ministarstva;
- novi broj glasnika ili nova objava otvara stavku „za proveru” uredniku i šalje mu mejl;
- svaka tema ima rok provere: najmanje dva puta godišnje i obavezno pre 1. septembra. Tema sa isteklim rokom
  ide na spisak „za proveru” u administraciji;
- test proverava da svaka tema ima izvor iz kataloga propisa, datum provere i da važeći propis nije
  označen kao prestao.

Prve teme:
1. fond časova po razredima;
2. oslobađanje od praktičnog dela nastave;
3. ocenjivanje;
4. programi i ishodi po razredima;
5. norma i 40-časovna radna nedelja;
6. evidencija i dnevnik;
7. testiranje fizičkih sposobnosti;
8. bezbednost na času;
9. stručno usavršavanje.

Kontakti (dopuna, 6. 11. 2026):
- tab **Kontakti** na `/propisi`: Ministarstvo prosvete (sektori za OŠ i SŠ, zaštita od nasilja, pravni poslovi,
  licenca), prosvetna inspekcija, školske uprave, ZUOV, ZVKOV, Pedagoški zavod Vojvodine, Ministarstvo
  sporta, Inspektorat za rad i Poverenik. Uz svaku instituciju piše kada joj se obraćamo, a podaci su samo
  sa zvaničnih sajtova, sa datumom provere;
- stranica `/kontakt`: ko radi portal (uredništvo) i obrazac „Piši uredništvu”. Poruka ide mejlom
  urednicima, a odgovor ide direktno pošiljaocu. Link na stranicu je u podnožju.

- [ ] Teme u `frontend/src/app/content/rules/`, polje `replacedBy` u propisima, stari programi iz PIS-a
- [ ] Nova `/propisi` sa tabovima Važeće / Ranije / Kako se menjalo / Kontakti, `/propisi/:tema`, blok na
      naslovnoj, upozorenja na zastarelim propisima
- [ ] Prve teme (fond časova, programi i ishodi): AI nacrt, odobrenje urednika
- [ ] `regulations:check` (PIS, nedeljno), spisak „za proveru” u administraciji, rokovi provere tema
- [ ] Kontakti institucija i `/kontakt` sa obrascem za uredništvo

### #49 Zajednica nastavnika FV: registracija, trajna prijava, umrežavanje (faza-1b, centralno)
Cilj: okupiti sve nastavnike fizičkog vaspitanja i studente fakulteta sporta pod jednom kapom. Dugoročno to je
osnova za strukovnu komoru, koja bi imala reč o struci, a jednog dana i nadležnosti oko licenci. Prvi korak je
da ljudi počnu da koriste portal.

Pravilo: **sadržaj ostaje javan**, ništa se ne krije iza prijave. Registracija daje dodatnu vrednost, a nama
bazu kontakata struke.

Javno, bez naloga:
- vesti, propisi i teme, ishodi, pravila sportova, pitanja i odgovori, udruženja, kontakti.

Uz nalog:
- obaveštenja po izboru (oblast, okrug, nivo škole);
- postavljanje pitanja i praćenje odgovora, sačuvani propisi i teme;
- profil u imeniku struke: ime, škola ili fakultet, okrug, status (nastavnik OŠ ili SŠ, student, pripravnik,
  u penziji). Vidljiv je drugim članovima samo uz izričitu saglasnost;
- jedan nalog i za aplikacije (e-pripreme, Evidencija FV, Jadžent), kasnije;
- učešće u anketama i inicijativama struke (#44).

Prijava „jednom i zauvek”:
- posle registracije i potvrde mejla korisnik je odmah prijavljen. Refresh token traje 365 dana i obnavlja
  se pri svakom korišćenju (rotacija), pa se aktivan korisnik praktično nikad ne odjavljuje;
- „Zapamti me” je podrazumevano uključeno. Odjava sa svih uređaja je u profilu;
- registracija u jednom koraku (ime, mejl, lozinka, status), ostalo u profilu postepeno; razmotriti prijavu
  preko Google naloga.

Privlačenje novih članova:
- stranica **„Za nove nastavnike i studente”**: prvi koraci u struci (propisi, ishodi, planiranje,
  pripravnički staž, ispit za licencu, seminari);
- kampanja na fakultetima sporta i fizičkog vaspitanja u Beogradu, Novom Sadu i Nišu: plakat sa QR kodom,
  kratka prezentacija, posebna adresa po fakultetu (`?izvor=fsfv-bg` …) da se vidi odakle dolaze članovi;
- poziv na registraciju na pravom mestu (posle korisnog sadržaja), bez iskačućih prozora.

Baza kontakata i privatnost:
- saglasnost po svrsi (obaveštenja, imenik, ankete), u skladu sa Zakonom o zaštiti podataka o ličnosti;
- izvoz i brisanje sopstvenih podataka iz profila;
- uredništvo vidi statistiku: broj članova po statusu, okrugu i izvoru registracije.

Put ka komori (kasnije, posle dovoljnog broja članova):
- članstvo i statut, saradnja sa SSPFVS i udruženjima, stav struke o propisima;
- podaci o licenci i stažu se uvode tek kad za to postoji pravni osnov.

- [x] Analiza: iza prijave su samo postavljanje pitanja, profil i administracija; automatska prijava posle potvrde
  i refresh 365 dana sa rotacijom već postoje (sesija u `localStorage`, „zapamti me” je uvek uključeno)
- [x] Trajna prijava: `last_active_at` pri svakom osvežavanju, odjava sa svih uređaja u profilu
- [x] Registracija u jednom koraku (ime, mejl, lozinka, status), škola i mesto kasnije u profilu
- [x] Profil sa statusom i saglasnostima (imenik, ankete), izvoz i brisanje sopstvenih podataka
- [x] Imenik struke `/imenik`: vide ga samo članovi koji su i sami u njemu, bez mejlova
- [x] Stranica `/novi-nastavnici` (ZOSOV čl. 142, 144, 145, 147, 151) i poziv na registraciju posle sadržaja
- [x] Izvor registracije (`?izvor=fsfv-bg|fsfv-ns|fsfv-nis`), linkovi za kampanju u administraciji
- [x] Statistika članstva za uredništvo (Admin → Članstvo)
- [ ] Plakat sa QR kodom i kratka prezentacija za fakultete
- [ ] Prijava preko Google naloga (razmotriti)
- [ ] Ankete i inicijative struke (#44) za članove sa saglasnošću

### #50 Pitanja i odgovori + Debate, uz AI pomoć (faza-1b, centralno)
Sekcija „Pitanja i odgovori” dobija dva taba: **Pitanja i odgovori** (postojeći Q&A) i **Stručne debate** (javne
rasprave o temama struke). Uvod „Administracija i propisi u praksi” se uklanja, stranica počinje tabovima.
U tabu pitanja je dugme „Postavi pitanje”, u tabu debata „Predloži temu za razgovor”; ispod su filteri, pa rezultati.

Pitanja i odgovori:
- pitanje se pri prijemu automatski dodeljuje uredniku ili autoru (onom sa najmanje otvorenih pitanja);
  admin ručno menja kome je dodeljeno; autor u adminu vidi i odgovara samo na pitanja dodeljena njemu;
- „Predlog odgovora (AI)”: AI napiše nacrt odgovora uz propise sa portala; urednik ga čita, ispravlja i
  objavljuje. AI nikad ne objavljuje sam.

Debate:
- temu otvara urednik ili admin; svaki član može da predloži temu („Predloži temu za razgovor”), a urednik
  je odobri ili odbije; više tema može da teče paralelno;
- **moderator teme** je urednik koga aplikacija dodeli automatski (onaj sa najmanje aktivnih tema); admin
  ručno postavlja bilo kog drugog korisnika;
- u temi svaki prijavljeni član piše prilog i bira vrstu: pitanje, kritika, konstatacija, predlog; ostali
  lajkuju (jedan lajk po članu, može da se povuče); dugme „Hoću da kažem” otvara polje za prilog;
- pretraga i filter po vrsti priloga u svakoj temi; sortiranje „najnovije” i „najviše lajkova”;
- moderator ističe najbolje priloge, skriva neprimerene i zatvara temu (zatvorena tema ostaje za čitanje);
- **AI analiza debate**: na zahtev moderatora AI pročita sve priloge (sa lajkovima i istaknutima) i napravi
  sažetak: šta je rečeno, glavna mišljenja i koliko podrške imaju, zaključci, najbolji komentari i predlozi.
  Analiza je nacrt dok je moderator ne odobri; moderator može da da smernice („istakni predloge za normu”,
  „ne navodi imena”) i traži novu verziju. Članovi vide samo odobrenu analizu, sa datumom i brojem priloga.

Tehnički: `fk_debates`, `fk_debate_posts`, `fk_debate_post_likes`, `questions.assigned_to`; AI preko
zvaničnog Anthropic PHP SDK-a (`anthropic-ai/sdk`, model `claude-opus-5-5`), ključ `ANTHROPIC_API_KEY`
samo u `.env`; bez ključa AI dugmad javljaju da AI nije podešen, a sve ostalo radi.
- [x] Tabovi `/pitanja` i `/debate`, `/debate/:slug`, uklonjen uvod
- [x] Debate: teme, prilozi, lajkovi, pretraga, moderator (automatski + ručno od admina), predlog teme
- [x] AI analiza debate sa odobravanjem i smernicama moderatora
- [x] Dodela pitanja uredniku / autoru i AI predlog odgovora
- [x] Admin „Debate” (predlozi tema, moderatori, zatvaranje), testovi, provera na 360 px
- [ ] `ANTHROPIC_API_KEY` u `deploy/.env` i probna AI analiza na pravoj debati (moderator proveri kvalitet)
- [ ] Mejl dodeljenom uredniku/autoru kad stigne pitanje i moderatoru kad stigne predlog teme

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

### #29a Pozivi i profil kolumniste (faza-4)
Urednik šalje poziv (mejl, ime, predložena tema, rok) → tabela `fk_invitations` (token, hash u bazi,
važi 14 dana) → pozvani pravi nalog sa ulogom `author` ili je dobija postojeći korisnik. Profil
autora: zvanje, mesto, biografija, fotografija, linkovi; javno `/autori/:slug` sa svim tekstovima.
Rubrike (serijali) sa ritmom i podsetnikom autoru mejlom pred rok.

### #29b Kolumne — tok uređivanja (faza-4)
Tekst tipa `column` (pored `article`): nacrt → poslato → napomene urednika (interne) → odobreno →
objavljeno / zakazano; rich text editor, naslovna slika, oznake, napomena o stavovima autora.
`/kolumne` (lista po rubrici i autoru), `/kolumne/:slug`. Admin: red tekstova za pregled.

### #29c Reakcije (faza-4)
`fk_reactions` (korisnik, sadržaj — polimorfno: vest, kolumna, polemika, komentar — vrsta),
jedinstveno po korisniku i vrsti; `POST/DELETE /api/reactions`; brojači u listama bez N+1.

### #29d Komentari i moderacija (faza-4)
`fk_comments` (sadržaj, korisnik, roditelj — jedan nivo, tekst, status: objavljen / na odobrenju /
sakriven, izmenjen), prvi komentar novog korisnika na odobrenje, izmena 15 min, prijava komentara
(`fk_comment_reports`), urednik sakriva / zaključava diskusiju, pravila diskusije prihvaćena uz
datum. Ograničenje broja komentara po minutu. Mejl kad neko odgovori na moj komentar.

### #29e Polemike (faza-4)
`fk_debates` (naslov, pitanje, uvod, rok, status otvorena / zatvorena, zaključak), stavovi (kolumne
vezane za polemiku sa oznakom „za" / „protiv" / „drugi ugao"), glasanje čitalaca (jedan glas po
korisniku, rezultat posle glasanja), komentari, replike čitalaca na odobrenje. `/polemike`,
`/polemike/:slug`; zatvaranje na rok, zaključak urednika i PDF za udruženja.

### #29f Replike i povezani tekstovi (faza-4)
Tekst može biti „odgovor na" drugi tekst; prikaz niza replika ispod originala i na stranici
polemike.

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
