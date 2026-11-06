# API rute

Osnova: `/api`. Odgovori su JSON, ključevi `snake_case`. Greške validacije: `422` sa `errors`.

## Nalozi (`AuthController`)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| POST | `/auth/register` | javno, 10/min | ime, mejl, lozinka (+ `password_confirmation`), škola, opština, okrug → uloga `user`, šalje mejl za potvrdu (48 h) |
| POST | `/auth/verify-email` | javno, 10/min | `token` iz mejla → potvrđuje nalog i vraća tokene (automatska prijava) |
| POST | `/auth/resend-verification` | javno, 10/min | `email` → novi link ako nalog nije potvrđen (uvek isti odgovor) |
| POST | `/auth/login` | javno, 10/min | `email`, `password` → `access_token`, `refresh_token`, `user`; odbija nepotvrđen i blokiran nalog |
| POST | `/auth/forgot-password` | javno, 10/min | `email` → link za novu lozinku (60 min), uvek isti odgovor |
| POST | `/auth/reset-password` | javno, 10/min | `token`, `password` (+ potvrda) → nova lozinka, poništava sve sesije |
| POST | `/auth/refresh` | javno | `refresh_token` → nov par tokena (stari refresh se poništava) |
| POST | `/auth/logout` | javno | `refresh_token` → poništava ga |
| GET | `/auth/me` | `jwt` | trenutni korisnik |
| PATCH | `/auth/me` | `jwt` | ime, škola, opština, okrug |
| POST | `/auth/change-password` | `jwt` | `current_password`, `password` (+ potvrda), poništava sve sesije |

Korisnik u odgovoru: `id`, `name`, `email`, `role` (`user` | `author` | `editor` | `admin`), `school`, `municipality`, `district`.

Middleware: `jwt` (bearer access token, odbija blokirane), `role:editor,admin` (lista dozvoljenih uloga).

## Vesti i organizacije (javno)

| Metod | Ruta | Opis |
|---|---|---|
| POST | `/news/list` | `category`, `organization` (slug), `umbrella` (slug krovne — ona i članice), `year`, `search`, `featured`, `page`, `per_page` (≤ 50) → `{ data, meta: { page, per_page, total, last_page } }`; samo objavljene, najnovije prve |
| GET | `/news/years` | godine za koje postoje objave |
| GET | `/news/{slug}` | vest sa `body` i `related` (3 iz iste organizacije ili kategorije) |
| GET | `/organizations` | sve organizacije sa `parent` i `news_count` |
| GET | `/organizations/{slug}` | organizacija sa `members` i poslednjih 20 objava |

Vest: `slug`, `title`, `summary`, `category`, `featured`, `cover_image`, `published_at`,
`source: { url, type (sajt | facebook | instagram | youtube | mediji | ostalo), published_at }`,
`organization: { slug, name, short_name }`.

Podaci za uvoz: `backend/database/data/organizations.json` i `news.json`, `ContentSeeder` (idempotentno —
postojeće organizacije po slug-u i vesti po izvoru + naslovu se preskaču).

## Admin (`jwt` + uloga)

| Metod | Ruta | Uloga | Opis |
|---|---|---|---|
| POST | `/admin/news/list` | editor, admin | `status` (draft / published / scheduled), `category`, `organization_id`, `search`, `page`, `per_page`; nacrti prvi |
| GET | `/admin/news/{id}` | editor, admin | vest sa svim poljima (`status`, `is_visible`, `author`) |
| POST | `/admin/news` | editor, admin | nova vest; `slug` iz naslova ako nije zadat; `published_at` prazno + objavljeno = sada, budućnost = zakazano; autor = prijavljeni |
| PATCH | `/admin/news/{id}` | editor, admin | izmena |
| DELETE | `/admin/news/{id}` | editor, admin | brisanje |
| GET | `/admin/organizations` | editor, admin | sve organizacije sa `news_count` i `parent_id` |
| GET | `/admin/organizations/{id}` | editor, admin | jedna organizacija |
| POST | `/admin/organizations` | editor, admin | nova; `slug` iz skraćenice ili naziva |
| PATCH | `/admin/organizations/{id}` | editor, admin | izmena (ne može biti sama sebi krovna) |
| DELETE | `/admin/organizations/{id}` | admin | brisanje; vesti ostaju bez organizacije |
| POST | `/admin/users/list` | admin | `role`, `search` (ime, mejl, škola, opština), `page` |
| PATCH | `/admin/users/{id}` | admin | `role`, `blocked` (blokiranje poništava sesije); svoj nalog ne može |

Organizacija ima i `link_status: { website?, facebook?, instagram?, youtube?, member_source? }` sa vrednostima
`ok` | `broken` | `unknown` (samo za linkove koji postoje). Proverava ih `php artisan organizations:check-links`
(ponedeljkom u 4h preko schedule-a, ili `deploy.py --check-links`); `broken` samo kad nema domena / veze, 404, 410
ili 5xx. Promenjen link je `unknown` dok se ponovo ne proveri.

## Propisi i literatura

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| GET | `/regulations` | javno | `kind`, `area`, `q`, `updated_since` (za sinhronizaciju e-priprema, #39); poređano po `sort` |
| GET | `/regulations/{key}` | javno | propis sa `history` (ranije verzije: `version`, `replaced_at`, `replaced_by`, `note`, `data`) |
| POST | `/admin/regulations` | editor, admin | novi propis |
| PATCH | `/admin/regulations/{id}` | editor, admin | izmena; ako se menja sadržaj, staro stanje ide u istoriju sa `change_note`, `version` + 1 |
| DELETE | `/admin/regulations/{id}` | admin | brisanje sa istorijom |
| GET | `/admin/regulations-review` | editor, admin | propisi za proveru: nova izmena u PIS-u (`change_detected_at`, `change_detail`) ili bez provere urednika duže od 6 meseci |
| POST | `/admin/regulations/{id}/checked` | editor, admin | urednik je proverio propis: `checked_at`, `checked_by`, briše oznaku izmene |

Svaki propis ima `status` (`vazi`, `najava` = primenjuje se kasnije, `nacrt`, `prestao` = `valid_to` je prošao),
`replaced_by` (ključevi propisa koji su ga zamenili) i `checked_at`.

Početni podaci: `backend/database/data/regulations.json` (katalog „Literatura“ iz e-priprema); uvoz dodaje nove
ključeve i ažurira samo propise koje niko nije menjao (verzija 1).

Komanda `regulations:check` (zakazana ponedeljkom u 05:00; `--key=`, `--no-mail`) za propise sa ELI adresom u
PIS-u (`https://pravno-informacioni-sistem.rs/eli/rep/.../reg`) čita spisak izmena iz naslova akta. Prvo pokretanje
beleži stanje; kad se pojavi novi broj glasnika, propis dobija oznaku izmene, a urednici i admini mejl. Na portalu
se ništa ne menja samo. Teme „Šta važi“ (`frontend/src/app/content/rules/rule-topics.ts`) i kontakti institucija
imaju datum provere; posle 6 meseci, i leti ako nisu provereni od juna, stoje u administraciji pod „Za proveru“.

## Kontakt (#48)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| POST | `/contact` | javno (5 na sat) | `name`, `email`, `topic` (`pitanje`, `greska`, `predlog`, `saradnja`, `drugo`), `message`, prazno polje `website`; mejl urednicima i adminima, odgovor ide pošiljaocu (`Reply-To`) |

## Pitanja i odgovori (#40)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| GET | `/questions` | javno | objavljena pitanja; `category`, `q`; bez teksta odgovora (`excerpt`) |
| GET | `/questions/{slug}` | javno | pitanje, odgovor (markdown), `valid_on` („važi na dan“), `regulations` (`key`, `title`, `gazette`, `url`) |
| POST | `/questions` | prijavljen (5/min) | `category`, `title`, `body`; status `pending`, najviše 5 na čekanju po korisniku |
| GET | `/me/questions` | prijavljen | moja pitanja sa statusom; `slug` tek kad je objavljeno |
| POST | `/admin/questions/list` | editor, admin | `status`, `search`; prvo ona na čekanju, `pending` = broj na čekanju |
| GET / PATCH | `/admin/questions/{id}` | editor, admin | i `original` (tekst pitaoca, samo za urednika) i `asker`; za `published` su obavezni `answer` i `valid_on` |
| POST | `/admin/questions` | editor, admin | urednik sam piše pitanje i odgovor |
| DELETE | `/admin/questions/{id}` | admin | brisanje |

Javni tekst pitanja urednik prepravlja bez imena i škole; pitalac nikad nije javan. Kad se pitanje prvi put objavi,
pitalac dobija mejl sa linkom (`asker_notified_at`). `regulation_keys` su ključevi iz `/regulations`. Početni
odgovori: `backend/database/data/questions.json` (uvoz kao kod propisa: menja samo zapise koje urednik nije dirao).

## Obaveštenja mejlom (#16b, #16c)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| POST | `/subscriptions` | javno (10/min) | `email`, `frequency` (`weekly` \| `instant`), `categories[]`, `organization_ids[]`; šalje mejl za potvrdu, a za već aktivnu adresu link za podešavanja (odgovor je isti, ne otkriva da li adresa postoji) |
| POST | `/subscriptions/confirm` | javno, `id` + `token` | potvrda prijave (dvostruki opt-in); vraća `manage_token` |
| POST | `/subscriptions/manage` | javno, `id` + `token` | podešavanja preko linka iz mejla |
| PATCH | `/subscriptions/manage` | javno, `id` + `token` | izmena podešavanja i `active` |
| POST | `/subscriptions/unsubscribe` | javno, `id` + `token` | odjava jednim klikom (i `List-Unsubscribe-Post` iz mejla, parametri u adresi) |
| GET / PUT | `/me/subscription` | prijavljen | „Moja obaveštenja“; potvrđen nalog ne traži potvrdu mejlom |
| GET | `/admin/subscriptions/stats` | editor, admin | pretplatnici, poslato za 7 / 30 dana, neuspelo, odjave |

Tokeni u linkovima su HMAC (`APP_KEY`, svrha, id, mejl), ništa se ne čuva u bazi. Prazne `categories` /
`organization_ids` znače „sve“; vesti bez udruženja (portal) stižu uvek. Slanje: `php artisan notifications:send`
(na 10 minuta preko schedule-a): istaknuta vest odmah pretplatnicima `instant` (jednom, `news.notified_at`, samo vesti
objavljene u poslednja 3 dana), nedeljni pregled ponedeljkom od 7h pretplatnicima `weekly`. Najviše
`NOTIFY_HOURLY_LIMIT` (100) mejlova na sat, ostatak ide u sledećem krugu; svako slanje je u `fk_notification_log`.
Kanal je `NotificationChannel` (sada samo `MailChannel`); novi kanal se dodaje tagom `notification-channels`.
