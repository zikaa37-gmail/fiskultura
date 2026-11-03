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
