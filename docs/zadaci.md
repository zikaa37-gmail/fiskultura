# Zadaci

Spremni za GitHub Issues (naslov = `###`, telo = tekst ispod). Labela faze u zagradi.

## Faza 0 — naslovna

### #1 Statička naslovna na fiskultura.rs (faza-0)
Postaviti `index.html`, `style.css`, `main.js`, `favicon.svg`, `.htaccess` iz ovog foldera u
document root glavnog domena. Stara naslovna je u `staro/index-2023.html`.
- [ ] HTTP preusmerava na HTTPS
- [ ] Proveriti na telefonu (360 px) i u tamnoj temi

### #2 Ukloniti stare linkove sa domena (faza-0)
Poddomeni `testiranje` i `scoreboard` ne postoje, `e-pripreme` je zastareo. Odlučiti šta ostaje,
ostale ugasiti u cPanel-u (aplikacije se predstavljaju na portfoliju).

## Faza 1 — baza vežbi i pravila

### #3 Kostur projekta (faza-1)
Angular + Laravel po obrascu `zakazivanje`: `frontend/`, `backend/`, `docs/`, `sql/`, `deploy/`,
prefiks `fk_`, JWT, deljene komponente (`appBtn`, `appInput`, `<app-modal>`, `ConfirmService`,
`ToastService`, loader), Tailwind tokeni teme iz ove naslovne (plava `#1d4ed8` + limeta).
- [ ] `php artisan test` i `npx ng build` prolaze
- [ ] `CLAUDE.md` sa konvencijama

### #4 Nalozi: nastavnik, urednik, admin (faza-1)
Registracija nastavnika (mejl + potvrda), prijava, zaboravljena lozinka, profil (škola, opština).
Uloge `teacher`, `editor`, `admin`.

### #5 Šifarnici za vežbe (faza-1)
Uzrast, deo tela, sposobnost, sport, oprema, deo časa, mesto. Admin ih uređuje; seed sa osnovnim
vrednostima.

### #6 Vežbe — unos (urednik) (faza-1)
CRUD vežbe: naziv, slug, opis, koraci, česte greške, varijante, mediji (slika / video, smanjenje u
pregledaču kao u galeriji zakazivanja), oznake iz šifarnika, objavljeno / nacrt.

### #7 Vežbe — javni prikaz i filteri (faza-1)
`/vezbe` sa filterima (chip-ovi, mobile-first), `/vezbe/:slug` sa koracima i medijima, srodne vežbe.
Radi bez naloga.

### #8 Omiljene vežbe (faza-1)
Nastavnik označava vežbu srcem; lista „Moje vežbe".

### #9 Pravila igara (faza-1)
Članci po igri (teren, oprema, igrači, pravila, prekršaji, varijante za školu). Urednik unosi,
javno `/pravila/:slug`.

### #10 SEO: prerender i sitemap (faza-1)
Javne stranice vežbi i pravila dostupne kao HTML sa `<title>`, description i og: tagovima;
`sitemap.xml` iz baze; `robots.txt`.

### #11 Sadržaj: prvih 150 vežbi i 10 igara (faza-1, sadržaj)
Plan snimanja / ilustracija, saglasnosti za fotografije, raspored po uzrastu i sposobnosti.

## Faza 2 — pripreme za čas

### #12 Sastavljanje pripreme (faza-2)
Delovi časa, dodavanje vežbi iz baze (pretraga + prevlačenje), trajanje, doziranje, napomena.
Razred, tema, cilj, ishodi.

### #13 Pripreme — PDF i štampa (faza-2)
Jedna strana A4 (dompdf kao uplatnica u zakazivanju), logo portala u podnožju.

### #14 Deljenje i kopiranje priprema (faza-2)
Javni link, kopiranje tuđe javne pripreme u svoje.

### #15 Šabloni priprema po razredu i temi (faza-2)

## Faza 3 — testiranje i premium

### #16 Odeljenja i učenici bez ličnih podataka (faza-3)
Ime + inicijal ili šifra, pol, godište. Politika privatnosti, brisanje na zahtev.

### #17 Testovi i unos rezultata (faza-3)
Baterija testova (podešava admin), unos sa telefona po odeljenju, red po učeniku.

### #18 Norme i izveštaji (faza-3)
Poređenje sa normama po uzrastu i polu (izvor i licenca normi proveriti pre izrade), izveštaj za
odeljenje u PDF, napredak kroz godine.

### #19 Link za roditelja (faza-3)
Tajni link sa rezultatima jednog učenika, bez naloga.

### #20 Premium pretplata (faza-3)
Paketi (nastavnik / škola), IPS QR uplatnica, ručna potvrda uplate u adminu, ograničenja besplatnog
paketa.

## Faza 4 — takmičenja i vežbanje kod kuće

### #21 Kalendar školskih takmičenja (faza-4)
Sport, nivo, mesto, datum, propozicije (PDF), rezultati.

### #22 Vežbaj kod kuće i izazov odeljenja (faza-4)
Programi od 10 minuta; nastavnik pokreće izazov, učenici štikliraju dane preko koda odeljenja.

## Faza 5 — zajednica

### #23 Nastavnici šalju vežbe i pripreme na odobrenje (faza-5)

### #24 Ocene, komentari i profil autora (faza-5)
