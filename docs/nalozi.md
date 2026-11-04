# Nalozi

Lozinke se ne upisuju ovde. Produkcijske su samo u lokalnom `deploy/.env` (admin) ili kod vlasnika naloga.

## Produkcija (https://fiskultura.rs)

| Mejl | Uloga | Namena | Napravljen |
|---|---|---|---|
| devtestzikaa@gmail.com | admin | glavni administrator (Igor) | 3.11.2026, prvi deploy (`app:admin`) |

## Nalozi za testiranje (dodavati po potrebi)

Prave se registracijom na sajtu (potvrda stiže mejlom), pa admin menja ulogu na
`/admin/korisnici` (tu se korisnik i blokira). Novi admin: komanda `app:admin` ili promena uloge.

| Mejl | Uloga | Ko testira / šta | Napravljen |
|---|---|---|---|
| — | user | običan korisnik (nastavnik, učitelj) | |
| — | author | kolumnista po pozivu | |
| — | editor | urednik vesti i udruženja | |

## Lokalno (seed, `php artisan migrate:fresh --seed`)

Lozinka za sve: `lozinka123` (samo lokalno, u produkciji se ne prave).

| Mejl | Uloga |
|---|---|
| admin@fiskultura.test | admin |
| urednik@fiskultura.test | editor |
| autor@fiskultura.test | author |
| korisnik@fiskultura.test | user |
