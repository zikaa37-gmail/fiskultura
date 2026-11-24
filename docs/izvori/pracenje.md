# Praćenje izvora: šta urednik proverava i kojim redom

Spisak mesta sa kojih portal dobija vesti, propise i seminare (zadaci #4 i #47). Ništa se ne objavljuje
samo od sebe: automatske provere samo javljaju uredniku šta je novo, a urednik pregleda i odobri.

## Pravila prenošenja

- Objava sa drugog sajta postaje vest sa **sažetkom svojim rečima** i linkom na izvor (`source_url`),
  uz organizaciju (`organization_id`) i datum originala (`source_published_at`). Tekst se ne kopira.
- Propis se navodi linkom na zvanični tekst (PIS / Službeni glasnik), ne na kopiju sa drugog sajta.
- Fotografije: sopstvene ili uz dozvolu autora; deca na fotografiji samo uz saglasnost roditelja.
- Kad se promeni propis: ažurirati propise, pitanja i odgovore, ishode i planove koji ga navode (polje
  „važi od”) i objaviti kratku vest sa linkom na zvanični tekst.

## Red provere

Redosled je po važnosti za nastavnike: prvo ono što menja obaveze (propisi, rokovi), zatim stručno
usavršavanje, pa takmičenja i udruženja.

| # | Izvor | Šta tražimo | Kako | Koliko često |
|---|---|---|---|---|
| 1 | PIS (Pravno-informacioni sistem) | izmene zakona i pravilnika koje portal navodi | automatski: `regulations:check` (ponedeljak 5h) šalje izveštaj uredniku | nedeljno |
| 2 | Prosvetni glasnik (preko PIS-a) | novi programi nastave i učenja, planovi, izmene FZV | ručno, uz izveštaj iz tačke 1 | nedeljno |
| 3 | Ministarstvo prosvete | školski kalendar, uputstva, konkursi, obaveštenja školama | ručno: [vesti](https://prosveta.gov.rs), FB | 2× nedeljno |
| 4 | ZUOV: vesti | obuke, priručnici, planovi realizacije | ručno: [vesti](https://zuov.gov.rs/category/vesti/) | 2× nedeljno |
| 5 | ZUOV: pravilnici i obaveštenja | novi pravilnici i standardi | ručno: [novi pravilnici](https://zuov.gov.rs/novi-pravilnici-vesti-i-obavestenja/) | nedeljno |
| 6 | ZUOV: dokumenti za zdravstveno vaspitanje | priručnici i materijali za FZV | ručno: [kategorija](https://zuov.gov.rs/download-category/zdravstveno-vaspitanje/) | mesečno |
| 7 | ZUOV: konkursi | konkursi za nastavnike i škole | ručno: [konkursi](https://zuov.gov.rs/konkursi-za-prosvetne-radnike-i-skole/) | nedeljno |
| 8 | ZUOV: katalog stalnog stručnog usavršavanja | programi oblasti 17 (FZV), novi i ukinuti | ručno: [oblast 17](https://zuov-katalog.rs/index.php?action=page/catalog/all&oblast=17) | mesečno, i na početku školske godine |
| 9 | Zdravitas | rokovi za unos merenja, izmene sistema | ručno: [zdravitas.gov.rs](https://zdravitas.gov.rs) | mesečno, nedeljno u periodima merenja |
| 10 | Savez za školski sport Srbije | kalendar takmičenja, propozicije, rezultati | ručno: [sajt](https://skolskisportsrbije.rs), FB, Instagram | 2× nedeljno tokom školske godine |
| 11 | SSPFVS | seminari, saopštenja, stavovi struke | ručno: [sajt](https://sspfvs.wixsite.com/sspfvs), [FB](https://www.facebook.com/sspfvs) | nedeljno |
| 12 | Članice SSPFVS i ostala udruženja | seminari, okupljanja, lokalne vesti | ručno: kontakti iz `/udruzenja` (većina bez sajta, preko mejla i FB) | 2× mesečno |
| 13 | Pokrajinski i gradski savezi za školski sport | lokalna takmičenja i rezultati | ručno: BASS, Novi Sad, Čačak, Subotica, Kragujevac, Srem, Vojvodina | 2× mesečno |
| 14 | Fakulteti sporta (Beograd, Novi Sad, Niš, Leposavić, FZS) | stručni skupovi, upis, istraživanja | ručno: sajtovi iz `/udruzenja` | mesečno |
| 15 | Sindikati (USPRS, USPRV, SOS) | prava zaposlenih, norma, plate | ručno: sajtovi i FB | mesečno |
| 16 | Linkovi organizacija | da li sajtovi i YouTube rade | automatski: `organizations:check-links` (ponedeljak 4h) | nedeljno |

Facebook i Instagram server ne može da proveri (blokade botova), zato su uvek ručni; link koji ne radi
urednik označava u administraciji (#46).

## Nedeljni ritam

- **Ponedeljak:** izveštaj `regulations:check` (PIS), pa tačke 1–2; pregled linkova (tačka 16).
- **Ponedeljak i četvrtak:** Ministarstvo, ZUOV vesti, Savez za školski sport (tačke 3, 4, 10).
- **Jednom nedeljno:** ZUOV pravilnici i konkursi, SSPFVS (tačke 5, 7, 11).
- **Prve nedelje u mesecu:** katalog ZUOV, Zdravitas, ZUOV dokumenti, fakulteti, sindikati (6, 8, 9, 14, 15).
- **Dva puta mesečno:** udruženja i lokalni savezi (12, 13).

Avgust i septembar su posebni: nov školski kalendar, nove liste seminara, raspored takmičenja. Tada
se tačke 3, 8 i 10 proveravaju svake nedelje.

## Šta je automatizovano, a šta ostaje za kasnije

- Urađeno: `regulations:check` (PIS, nove izmene propisa), `organizations:check-links` (sajtovi i YouTube).
- Planirano (#15c): tabela izvora po organizaciji i komanda `sources:check` koja čita RSS i javne
  stranice i pravi predloge vesti za urednika.
- Planirano (#47): beleženje poslednje objave sa stranica ZUOV-a i izveštaj uredniku šta je novo.
