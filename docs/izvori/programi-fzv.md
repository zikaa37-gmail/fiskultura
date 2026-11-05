# Programi nastave i učenja: fizičko i zdravstveno vaspitanje

Istraživanje za ishode po razredima (fiskultura.rs) i planove za 1–4. razred (e-pripreme), 5. 11. 2026.
Izvor je isključivo Pravno-informacioni sistem RS (PIS, Službeni glasnik), ne kopije sa drugih sajtova.

## Kako se dolazi do zvaničnog teksta (PIS)

1. ELI adresa propisa: `https://pravno-informacioni-sistem.rs/eli/rep/pg/ministarstva/pravilnik/<godina>/<broj PG>/<redni broj>/reg`.
2. `https://slgl.pravno-informacioni-sistem.rs/api/prins/eli/rep/pg/ministarstva/pravilnik/<godina>/<broj>/<rb>/reg` vraća `lawAdActGuid`.
3. `https://reg.pravno-informacioni-sistem.rs/api/GetLawActViewByLawAdActGuid?guid=<g>&lawAdActGuid=<g>&eliUrl=/eli/...` vraća naslov sa svim izmenama, `htmlLinks` (HTML osnovnog teksta i svake izmene) i `links` (PDF brojeva glasnika).
4. `https://slgl.pravno-informacioni-sistem.rs/api/prins/viewdoc?uuid=<uuid>` vraća HTML akta ili PDF broja glasnika.

PIS nema prečišćen tekst ovih pravilnika: osnovni tekst i svaka izmena su posebni dokumenti. PDF-ovi
starijih brojeva glasnika nemaju ćirilicu kao tekst (fontovi bez mape), pa se čitaju sa slike strane.

## Pravilnici po razredima

| Razred | Pravilnik (ELI) | Izmene | FZV program |
|---|---|---|---|
| 1. (i plan I ciklusa) | `2017/10/1` | 12/18, 15/18, 18/18, 1/19, 2/20, 16/22, 1/23 (ispr.), 13/23, 14/23, 11/24, 1/26 | PG 10/2017; **novi program PG 1/2026, od 2027/28** |
| 2. | `2018/16/3` | 3/19, 5/21, 13/23 | PG 16/2018; izmene ne diraju FZV (Digitalni svet, nacionalne manjine) |
| 3. | `2019/5/3` | 1/20, 6/20, 7/22, 13/23 | PG 5/2019; izmene ne diraju FZV |
| 4. | `2019/11/1` | 6/20, 7/21, 1/23, 13/23 | PG 11/2019; izmene ne diraju FZV |
| 5. i 6. (plan) | `2018/15/2` | 18/18, 3/19, 3/20, 6/20, 17/21, 16/22, 13/23, 14/23, 3/24, 6/25, 1/26 | 5. r. PG 15/2018; novi 5. r. i plan PG 1/2026 od 2027/28 |
| 7. | `2019/5/4` | 1/20, 6/20, 8/20, 5/21, 17/21, 16/22, 13/23, 14/23, 6/25 | PG 5/2019 |
| 8. | `2019/11/2` | 2/20, 6/20, 5/21, 17/21, 16/22, 13/23, 14/23, 4/24, 6/25 | PG 11/2019 |
| 7. i 8. (plan) | `2018/18/3` | 13/23, 1/26 | FZV 3 časa nedeljno u sve tri verzije plana |
| Gimnazija | `2020/4/1` | 12/20, 15/20, 1/21, 3/21, 7/21, 14/23, 9/25, 1/26 | PG 4/2020; novi I razred PG 1/2026 od 2027/28 |

Tekstovi programa FZV za 1–4. razred izdvojeni iz PIS-a su u `programi-fzv/`.

## Fond časova

- **1–4. razred:** 3 časa nedeljno, 108 godišnje, i po važećem planu i po planu iz PG 1/2026.
- **5. i 6. razred, 2026/27:** FZV 2 časa (72) + obavezne fizičke aktivnosti 1,5 čas (54), plan iz PG 15/2018 sa izmenama
  (u PG 13/2023 red glasi „2 | 72+54”, uz napomenu da se OFA ostvaruju u okviru predmeta).
- **5. i 6. razred od 2027/28 (PG 1/2026, čl. 2: „primenjuje se od školske 2027/2028. godine”):** 3 časa nedeljno, 108 godišnje; OFA više nema u planu.
- **7. i 8. razred:** 3 časa nedeljno, 108 (7. r.) i 102 (8. r., 34 nedelje) već po planu iz PG 18/2018 (ELI `2018/18/3`);
  isto u izmenama PG 13/2023 i PG 1/2026. Izmena iz 2026. ne menja fond FZV za 7. i 8. razred.
- **Gimnazija:** 2 časa nedeljno, 74 godišnje, IV razred 66.
- Programi za 1–4. razred ne propisuju raspodelu časova po temama: „Broj časova po nastavnim temama planira se na osnovu procene nastavnika, materijalno-tehničkih i prostornih uslova.”

## Ko predaje FZV u 1–4. razredu

Pravilnik o stepenu i vrsti obrazovanja nastavnika i stručnih saradnika u osnovnoj školi (ELI `2012/11/1`,
poslednja izmena PG 3/2024), čl. 2 (izmenjen u PG 16/2022 i 1/2024): nastavu u razrednoj nastavi izvodi
profesor razredne nastave, master učitelj i sl.; predmetna nastava u prvom ciklusu predviđena je samo za
strani jezik i srpski kao nematernji. Programi za 1–4. razred kažu da nastavnik fizičkog i zdravstvenog
vaspitanja izvodi **plivanje** i **rad sa učenicima sa zdravstvenim teškoćama** (uz učitelja), a Nedelju
školskog sporta i aktivnosti u prirodi planira odeljensko veće sa stručnim većem nastavnika FZV.
Uvođenje nastavnika FZV u redovne časove 1–4. razreda zato traži izmenu pravilnika ili pilot projekat.

## Ishodi: stanje provere

- 1–4. razred i novi 1. razred: izdvojeni iz HTML-a PIS-a, upoređeni sa izvornim HTML-om. U 3. razredu je u
  originalu jedan ishod prelomljen u dva reda („izvede kretanja, vežbe i / sastave uz muzičku pratnju”).
- 5, 7. i 8. razred (katalog e-priprema): od 38/48/47 ishoda nađeno 35/44/45 doslovno u PIS tekstu; razlike
  su u razmacima („25m”) i nekoliko formulacija koje treba proveriti jednu po jednu.
- 5, 7. i 8. razred: razlike prema PIS-u su štamparske greške u originalu („спротских”, „огранима”, „активноси”, latinično „e”), u podacima ispravljene.
- 6. razred: original nije pronađen u PIS HTML-u; PG 3/2019 (str. 83–188) donosi dopune za nacionalne
  manjine, a str. 189+ izmene starog programa za 7. razred. **Otvoreno:** naći broj glasnika sa programom
  za 6. razred i proveriti katalog (sada po kopiji FSFV Niš).
- Gimnazija: još nije upoređena sa PIS tekstom.

## Ostali izvori (nezvanični, za literaturu)

- Blog Mirjane Spasić, „Fizičko i zdravstveno vaspitanje”: planovi i programi 1–8, OFA, ocenjivanje
  (<https://miraspasic.wordpress.com/2012/12/02/планови-и-програми-5-8-разред/>), materijali na Google Drive-u.
