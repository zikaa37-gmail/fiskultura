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
