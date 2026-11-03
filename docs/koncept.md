# Fiskultura — portal za fizičko vaspitanje

## Ideja

**Mesto na koje „difovci" dolaze po obaveštenja i novosti** iz fizičkog vaspitanja i školskog sporta
u Srbiji, i po pomoć u poslu. Danas su informacije razbacane po sajtovima strukovnih društava,
Facebook i Viber grupama, sajtu Ministarstva i ZUOV-a, a pitanja o administraciji, propisima i
struci se rešavaju „pitaj kolegu".

Fiskultura to spaja:

1. **Vesti i objave** — školski sport, propisi, seminari, konkursi, saopštenja strukovnih udruženja.
2. **Strukovna udruženja** — baza svih društava pedagoga fizičke kulture i saveza za školski sport u
   Srbiji, sa sajtovima, kontaktima i njihovim objavama na jednom mestu.
3. **Stručna pomoć** — blog / stručni tekstovi, administracija (dnevnik, ocenjivanje, planovi,
   izveštaji), pravna pitanja (norma, fond časova, zaštita na času, odgovornost), predlozi za
   unapređenje nastave.
4. **Sportovi i pravila** — za svaki sport koji se obrađuje u školi: pravila prilagođena času
   (interaktivna „igraonica" + kviz po uzoru na `kosarkaska-evidencija/features/rules`) i
   **slikovito PDF uputstvo** za štampu.
5. **Aplikacije za nastavnike** — portal linkuje i predstavlja postojeće aplikacije umesto da ih
   ponovo pravi.

Domen `fiskultura.rs` je kratak, srpski i tačno opisuje temu.

## Postojeće aplikacije (linkuju se, ne prave se ponovo)

| Aplikacija | Adresa | Repo | Šta radi |
|---|---|---|---|
| e-pripreme | https://e-pripreme.fiskultura.rs | [zikaa37-gmail/e-pripreme-fv](https://github.com/zikaa37-gmail/e-pripreme-fv) | vežbe sa slikama, godišnji/mesečni plan, pripreme za čas, šabloni |
| Evidencija FV | https://evidencija.fiskultura.rs | [zikaa37-gmail/evidencija-fv](https://github.com/zikaa37-gmail/evidencija-fv) | evidencija učenika na času, odeljenja, napomene, izveštaji |
| Jadžent | https://jadzent.fiskultura.rs | [zikaa37-gmail/jadzent](https://github.com/zikaa37-gmail/jadzent) (privatan) | sajt sporta jadžent: pravila, novosti, galerija |
| Zdravitas (država) | https://admin.zdravitas.gov.rs | — | zvanični unos merenja fizičkih sposobnosti |

Zato se „Baza vežbi" i „Pripreme za čas" sa stare naslovne vode kao e-pripreme, a „Testiranje"
upućuje na Zdravitas (+ kasnije izveštaji iz e-priprema).

## Korisnici

| Uloga | Šta radi | Nalog |
|---|---|---|
| Posetilac (nastavnik, učenik, roditelj) | čita vesti, udruženja, pravila, stručne tekstove, preuzima PDF | ne |
| Nastavnik | čuva vesti/tekstove, prati udruženja i teme, šalje vest ili pitanje, komentariše | da (besplatan) |
| Autor | piše stručne tekstove (blog), ide na odobrenje | da |
| Urednik | vesti, objave udruženja, pravila, PDF uputstva, odobravanje priloga | da |
| Admin | korisnici i uloge, šifarnici, podešavanja | da |

## Moduli

### 1. Vesti i objave
- Vest: naslov, slug, sažetak, tekst (rich text), naslovna slika, kategorija (školski sport, propisi,
  seminari, konkursi, udruženja, stručno), oznake, izvor (URL + organizacija), datum objave,
  nacrt / objavljeno / zakazano, istaknuto.
- Javno: `/vesti`, `/vesti/:slug`, filteri po kategoriji, organizaciji i godini, pretraga.
- Prenete objave udruženja se **ne kopiraju** — sažetak svojim rečima + link na izvor.
- RSS (`/rss.xml`) i kasnije newsletter.

### 2. Strukovna udruženja — mreža na jednom mestu
- **SSPFVS je krovno udruženje Srbije** (Srpski savez profesora fizičkog vaspitanja i sporta,
  osnovan 2014, član EUPEA, https://sspfvs.wixsite.com/sspfvs). Lokalna društva (gradska, opštinska,
  okružna, pokrajinska) su njegove članice; portal prikazuje tu hijerarhiju (`parent`).
- **Pokrivenost Srbije** — mapa / spisak okruga i gradova: gde društvo postoji, gde je aktivno, a gde
  ga nema. Za mesta bez društva: „Osnuj društvo u svom gradu" — vodič (koraci, primer statuta,
  registracija u APR-u, učlanjenje u SSPFVS) i forma „zainteresovan sam" koja okuplja kolege iz istog
  grada i šalje kontakt SSPFVS-u. Cilj: da SSPFVS uz pomoć portala pokrene društvo u svakom gradu.
- **Praćenje objava** — za svaku organizaciju se vode izvori (sajt, RSS, Facebook, Instagram,
  YouTube). Portal redovno proverava izvore koji to dozvoljavaju (RSS, javne stranice sajta) i nove
  objave stavlja u **red za urednika**; Facebook i ostalo urednik prati ručno ili udruženje šalje
  objavu preko forme / svog naloga.
- **Oznaka izvora na svakoj objavi** — čip organizacije (sa linkom na njen profil na portalu),
  „Preuzeto sa: <sajt / Facebook>", datum originalne objave i link na original. Prenosi se sažetak,
  ne ceo tekst. Filter vesti po organizaciji i po „samo SSPFVS i članice".
- **Nalog za udruženje** — društvo dobija urednika ograničenog na svoje objave (bez čekanja
  odobrenja kad je pouzdano), čime portal postaje zajednički kanal obaveštavanja svih društava.
- Saradnja sa SSPFVS: dogovor o razmeni objava i da portal bude zvanični zbirni pregled mreže.
- Organizacija: naziv, skraćenica, tip (strukovno udruženje, školski sport, institucija, fakultet,
  sindikat), nivo (republički → opštinski), grad/okrug, sajt, društvene mreže, kontakt, opis, status,
  krovna organizacija i izvor podatka o članstvu.
- Javno: `/udruzenja` (lista + filteri po nivou i okrugu, kasnije mapa), `/udruzenja/:slug` sa
  objavama te organizacije.
- Početni podaci: `docs/izvori/udruzenja.json` i `docs/izvori/objave.json` (seed za bazu).
- Udruženje može da dobije nalog urednika za svoje objave (kasnije).

### 3. Stručna pomoć
- **Blog / stručni tekstovi** — autori (nastavnici, profesori fakulteta), teme: metodika, inkluzija,
  zdravlje, ocenjivanje, sportske igre, rad sa talentovanima, ...
- **Administracija** — vodiči: elektronski dnevnik (ES dnevnik), formativno i sumativno ocenjivanje,
  oslobađanje od nastave, godišnji/operativni plan, izveštaji, sekcije i školski sport.
- **Pravna pitanja** — pitanja i odgovori sa pozivom na propis (Zakon o osnovama sistema, pravilnici
  o planu i programu, o ocenjivanju, o normi, o zaštiti učenika); svaki odgovor ima datum i
  „važi na dan", i napomenu da nije pravni savet.
- **Predlozi za unapređenje nastave** — nastavnici šalju predlog, urednik objavljuje; glasanje.
- Propisi: biblioteka linkova na zvanične tekstove (Službeni glasnik, Ministarstvo, ZUOV).

### 3a. Kolumne, reakcije i polemike
- **Kolumne po pozivu** — urednik poziva ljude od struke (nastavnici, profesori fakulteta, treneri,
  predstavnici udruženja, roditelji, učenici) da pišu na zadatu ili slobodnu temu. Poziv stiže mejlom
  sa linkom; pozvani pravi nalog sa ulogom **kolumnista** (`author`) i profilom (ime, zvanje, mesto,
  kratka biografija, fotografija, linkovi). Kolumnista može imati stalnu rubriku (serijal) sa
  ritmom (npr. jednom mesečno).
- Tok teksta: nacrt → slanje uredniku → uredničke napomene (interno, ne vide čitaoci) → odobreno →
  objavljeno / zakazano. Kolumna nosi napomenu „Stavovi autora ne moraju da odražavaju stavove
  portala".
- **Reakcije** (samo prijavljeni korisnici, jedna po vrsti): „Slažem se", „Ne slažem se",
  „Korisno", „Podržavam"; broj reakcija vidljiv svima.
- **Komentari** (samo prijavljeni, pod imenom i prezimenom): odgovor na komentar (jedan nivo),
  izmena 15 minuta posle objave, prijava neprimerenog komentara, urednik sakriva / zaključava;
  prvi komentar novog korisnika ide na odobrenje. Pravila diskusije (bez uvreda, bez ličnih podataka
  dece, bez reklama) prihvataju se pri prvom komentaru.
- **Polemike** — urednik otvara temu za raspravu (npr. „Treba li fizičko vaspitanje svaki dan?"):
  uvodni tekst + pitanje, poziva dva ili više autora sa različitim stavovima, čitaoci glasaju
  (za / protiv / neodlučan, rezultat se vidi posle glasanja), komentarišu i šalju svoju repliku
  (ide uredniku). Tema ima rok; na kraju urednik objavljuje zaključak i šalje ga udruženjima /
  SSPFVS-u kao glas struke.
- **Replika** — kolumnista ili korisnik može napisati odgovor na tekst; prikazuje se kao povezan
  niz („Odgovor na: ...").
- Obaveštenja: novi tekst kolumniste koga pratim, nova polemika, odgovor na moj komentar.

### 4. Sportovi i pravila
- Sportovi: košarka, odbojka, rukomet, mali fudbal (sportske igre); atletika; gimnastika;
  elementarne igre; plesovi (narodni i društveni); jadžent; kasnije badminton, stoni tenis.
- Po sportu, po obrascu iz `kosarkaska-evidencija`:
  - **Igraonica** — kartice pravila sa SVG sličicama (dobro / loše), dodir na „i" za objašnjenje;
  - **Kviz** sa zvezdicama, napredak u `localStorage`;
  - **Za čas** — kako se igra sa 30 dece u maloj sali, pojednostavljena pravila, varijante;
  - **Zvanična pravila** — linkovi na savez (KSS, OSS, RSS, FSS, AS Srbije, GSS) i međunarodnu
    federaciju; ne kopiramo tuđa pravila, prepričavamo za školu.
- Atletika i gimnastika nemaju „pravila igre" nego **discipline / elemente**: tehnika po fazama,
  česte greške, metodski niz, merenje i ocenjivanje, mere sigurnosti (čuvanje i pomaganje).
- Elementarne igre i plesovi: kartica igre / plesa (uzrast, broj učesnika, prostor, oprema, opis,
  varijante; za ples: koraci, muzika, video link).
- **Slikovito PDF uputstvo** po sportu (A4, 2–6 strana, isti SVG crteži): generiše se iz istog
  sadržaja (štampa iz pregledača sa print CSS-om, u drugoj fazi pre-generisan PDF pri build-u).

### 5. Školska takmičenja
- Kalendar po sportu i nivou (opštinsko → republičko), propozicije (PDF/link), rezultati; izvor je
  Savez za školski sport Srbije i pokrajinski/gradski savezi.

### 6. Obaveštenja mejlom
- Pošiljalac `obavestenja@fiskultura.rs` (SMTP na cPanel hostingu; kredencijali samo u `backend/.env`,
  nikad u gitu).
- Nastavnik bira šta prati: kategorije vesti, udruženja, okrug, sportove; učestalost **odmah** (samo
  za istaknute / hitne objave) ili **nedeljni pregled**.
- Prijava i bez naloga (mejl + potvrda dvostrukim opt-in-om), odjava jednim klikom u svakom mejlu,
  evidencija saglasnosti (ZZPL).
- Slanje preko Laravel queue-a (`database` drajver + cron `schedule:run`), ograničenje broja mejlova
  po satu zbog limita hostinga; log poslatih i odbijenih.
- Sistemski mejlovi: potvrda naloga, zaboravljena lozinka, odobren tekst, odgovor na pitanje.

### 7. Za razmišljanje (ne radi se sada)
- **WhatsApp / Viber obaveštenja** — kanal (WhatsApp Channel / Viber zajednica) gde urednik ručno
  ili automatski objavljuje istaknute vesti; WhatsApp Business API je plaćen po poruci i traži
  odobrene šablone, pa prvo kanal bez API-ja. Model obaveštenja od početka praviti tako da kanal
  bude zamenljiv (`mail` sada, `whatsapp`/`viber`/`push` kasnije).
- **AI pomoć** — asistent koji odgovara na pitanja o administraciji, propisima i struci **samo iz
  sadržaja portala** (vesti, vodiči, pravna pitanja, propisi) sa linkovima na izvor; pomoć uredniku
  (sažetak objave udruženja, predlog naslova i oznaka); pomoć nastavniku (predlog igre / varijante
  za čas). Otvorena pitanja: trošak, odgovornost za pogrešan pravni odgovor, privatnost.

### 8. Vežbaj kod kuće (kasnije)
- Programi od 10 minuta bez opreme, po uzrastu; izazov za odeljenje preko koda.

## Tehnika

- Monorepo kao `evidencija-fv`: `frontend/` (Angular 22, zoneless, signali, **Angular Material M3**,
  `@ngx-translate`), `backend/` (Laravel 13 API, MySQL, JWT + refresh, prefiks tabela `fk_`),
  `docs/`, `deploy/`. Portovi lokalno: frontend 5190, backend 8190.
- Dizajn: isti kao sadašnja statička naslovna — Inter, plava `#1d4ed8` + limeta `#bef264`,
  kartice modula sa ikonicom u obojenom kvadratu, tamna tema preko `prefers-color-scheme`.
- **SEO je ključan**: vesti, udruženja, pravila i tekstovi su javni i moraju biti indeksirani.
  Angular prerender (SSG) za statične stranice (pravila, sportovi); za vesti Laravel servira
  `index.html` sa ubačenim `<title>`/description/og: tagovima po slug-u; `sitemap.xml` i `rss.xml`
  iz baze. Node SSR na cPanel-u nije opcija.
- Admin je deo iste Angular aplikacije (`/admin`, lazy, `editorGuard`/`adminGuard`).
- Mediji: slike u WebP, smanjenje u pregledaču pre slanja (kao u evidenciji).
- Autorska prava: prenete objave = sažetak + link; fotografije samo sopstvene ili sa dozvolom;
  pravila se prepričavaju, ne kopiraju.
- Dok portal ne bude spreman, `fiskultura.rs` ostaje statička naslovna iz korena repoa.

## Faze

| Faza | Sadržaj | Cilj |
|---|---|---|
| 0 | Statička naslovna (koren repoa) | urađeno, 23.10.2026. |
| 1 | Kostur, javni portal (naslovna, aplikacije, vesti, udruženja), nalozi, admin za vesti i udruženja | portal zamenjuje statičku naslovnu |
| 2 | Sportovi i pravila: košarka, odbojka, rukomet, mali fudbal + PDF uputstva | prvi posetioci iz pretrage |
| 3 | Atletika, gimnastika, elementarne igre, plesovi, jadžent | kompletan sadržaj za sportske oblasti programa |
| 4 | Stručna pomoć: blog, administracija, pravna pitanja, predlozi | nastavnici se vraćaju svake nedelje |
| 5 | Školska takmičenja, newsletter, nalozi za udruženja | portal postaje izvor za savez i društva |
| 6 | Zajednica, vežbaj kod kuće | sadržaj raste bez urednika |

Najveći posao nije kod nego **sadržaj** — urednik mora redovno da prati izvore (sajtovi i FB
stranice udruženja, Ministarstvo, ZUOV, savez za školski sport).
