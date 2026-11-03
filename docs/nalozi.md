# Nalozi

Lozinke se ne upisuju ovde. Produkcijske su samo u lokalnom `deploy/.env` (admin) ili kod vlasnika naloga.

## Produkcija (https://fiskultura.rs)

| Mejl | Uloga | Namena | Napravljen |
|---|---|---|---|
| devtestzikaa@gmail.com | admin | glavni administrator (Igor) | 3.11.2026, prvi deploy (`app:admin`) |

## Nalozi za testiranje (dodavati po potrebi)

Prave se registracijom na sajtu (potvrda stiže mejlom), pa admin menja ulogu. Dok ne postoji admin
stranica za korisnike (zadatak #16), uloga se menja komandom `app:admin` samo za admina, ostalo ručno.

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
