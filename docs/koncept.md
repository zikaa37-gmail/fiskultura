# Fiskultura — portal za fizičko vaspitanje

## Ideja

Jedno mesto za sve što treba za čas fizičkog vaspitanja. Danas nastavnik sprema čas iz sveske,
PDF-ova sa raznih sajtova, YouTube-a i Viber grupa; učenik ne zna kako se pravilno radi vežba;
roditelj ne zna koliko se dete kreće i kako napreduje.

**Fiskultura** to spaja: baza vežbi → pripreme za čas sastavljene iz baze → testiranje fizičkih
sposobnosti → takmičenja i vežbanje kod kuće.

Domen `fiskultura.rs` je kratak, srpski i tačno opisuje temu — vredi ga sačuvati za portal.

## Korisnici

| Uloga | Šta radi | Nalog |
|---|---|---|
| Posetilac (učenik, roditelj) | čita vežbe, pravila, vežbaj kod kuće | ne |
| Nastavnik | pravi pripreme, testira odeljenja, čuva omiljene vežbe, deli materijal | da (besplatan) |
| Nastavnik premium | neograničene pripreme, izveštaji testiranja u PDF, šabloni za celu godinu | da (pretplata) |
| Urednik | unosi vežbe, pravila, takmičenja, odobrava materijal koji šalju nastavnici | da |
| Admin | korisnici, pretplate, podešavanja | da |

## Moduli

### 1. Baza vežbi (prvo izdanje)
- Vežba: naziv, kratak opis, koraci, česte greške, varijante (lakše / teže), slika / GIF / kratak video.
- Filteri: uzrast (razred 1–8, srednja), deo tela, sposobnost (snaga, brzina, izdržljivost,
  gipkost, koordinacija), sport, oprema (bez opreme, lopta, strunjača, švedska klupa, vijača...),
  deo časa (uvodni, pripremni, glavni, završni), mesto (sala, dvorište, kod kuće).
- Javna stranica po vežbi sa lepim URL-om (`/vezbe/cucanj-uz-zid`) — glavni izvor posetilaca preko
  pretrage.
- Nastavnik čuva omiljene vežbe.

### 2. Pravila igara (prvo izdanje)
- Kratka pravila prilagođena školskom času: košarka, odbojka, rukomet, mali fudbal, badminton,
  stoni tenis, atletske discipline i elementarne igre („Između dve vatre", „Graničar"...).
- Za svaku: teren i oprema, broj igrača, osnovna pravila, česti prekršaji, kako se igra sa 30 dece
  u maloj sali.

### 3. Pripreme za čas
- Čas se sastavlja prevlačenjem vežbi iz baze u delove časa, sa trajanjem i brojem ponavljanja.
- Razred, nastavna tema, cilj i ishodi časa (slobodan tekst + šabloni).
- Štampa / PDF na jednoj strani A4, deljenje linkom, kopiranje tuđe javne pripreme.
- Godišnji plan: niz priprema po nedeljama (premium).

### 4. Testiranje fizičkih sposobnosti
- Baterija testova (npr. skok udalj iz mesta, pretklon u sedu, podizanje trupa za 30 s, izdržaj u
  zgibu, trčanje 20 m, višestepeni test trčanja), unos po odeljenju sa telefona.
- Poređenje sa normama za uzrast i pol, napredak kroz godine, izveštaj za odeljenje (PDF).
- Roditelj dobija link sa rezultatima svog deteta.
- **Podaci o deci su lični podaci maloletnika (ZZPL):** učenik se vodi bez JMBG-a i adrese, samo
  ime i inicijal prezimena ili šifra; podaci pripadaju nastavniku i brišu se na zahtev; politika
  privatnosti pre puštanja modula.
- Norme: pre izrade proveriti koje norme su javno dostupne i pod kojom licencom (Eurofit, domaće
  studije); bez preuzimanja tuđih tablica bez dozvole.

### 5. Školska takmičenja
- Kalendar po sportu i nivou (opštinsko, okružno, republičko), propozicije, rezultati.
- Urednik unosi; nastavnici mogu da predlože ispravku.

### 6. Vežbaj kod kuće
- Programi od 10 minuta bez opreme, po uzrastu; izazov za odeljenje (nastavnik pokrene, učenici
  štikliraju dane, bez naloga — preko koda odeljenja).

### 7. Zajednica (kasnije)
- Nastavnici šalju svoje vežbe i pripreme, urednik odobrava; ocene i komentari; profil autora.

## Prihod

- **Besplatno:** baza vežbi, pravila, takmičenja, do 10 sačuvanih priprema.
- **Premium nastavnik** (mesečno / godišnje): neograničene pripreme, godišnji plan, testiranje sa
  izveštajima, PDF bez oznake portala.
- **Licenca za školu:** premium za sve nastavnike fizičkog u školi, jedan račun školi.
- **Partneri:** proizvođači i prodavci sportske opreme (oprema uz vežbu), sportski kampovi i škole
  sporta (oglasi po opštini). Bez nametljivih reklama na stranicama za decu.
- Naplata: IPS QR i uplatnica (kao u zakazivanju), račun preduzetnika.

## Tehnika

- Angular (SPA za nastavnike) + Laravel API + MySQL, prefiks tabela `fk_`, isti obrasci kao
  `zakazivanje` (JWT, deljene komponente, Tailwind, deploy na cPanel preko FTP-a).
- **SEO je ključan** (posetioci dolaze iz pretrage „vežbe za ... "): javne stranice vežbi i pravila
  se prerenderuju pri build-u (Angular prerender / SSG) ili ih Laravel servira kao HTML sa meta
  tagovima; `sitemap.xml` se generiše iz baze. Node SSR na cPanel-u nije opcija.
- Mediji: slike i kratki video u WebP / MP4 malih dimenzija; GIF izbegavati (težak).
- Dok portal ne postoji, `fiskultura.rs` je statička naslovna iz ovog foldera.

## Faze

| Faza | Sadržaj | Cilj |
|---|---|---|
| 0 | Statička naslovna (ovaj folder) | domen više ne izgleda napušteno |
| 1 | Baza vežbi + pravila igara + nalog nastavnika + urednički admin | 150 vežbi, 10 igara, prvi posetioci iz pretrage |
| 2 | Pripreme za čas + PDF | nastavnici se vraćaju svake nedelje |
| 3 | Testiranje fizičkih sposobnosti + premium | prvi prihod |
| 4 | Takmičenja, vežbaj kod kuće | rast preko učenika i roditelja |
| 5 | Zajednica | sadržaj raste bez urednika |

Najveći posao nije kod nego **sadržaj** (tekst i slike vežbi) — planirati ga od prvog dana
(fotografisanje u sali uz saglasnost, ili ilustracije).
