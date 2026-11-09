# Nalozi

Repozitorijum je javan: ovde nema lozinki ni ličnih mejlova. Pravi nalozi za prijavu i testiranje (admin, urednik,
korisnik, isti lokalno i na produkciji) su u `deploy/nalozi.md`, koji je van gita i postoji samo na računaru vlasnika.

## Kako se postavljaju

- Lokalno: `cd backend && php artisan app:user <mejl> <uloga> --password=... [--name=...]`. Pravi nalog ili mu menja
  ulogu i lozinku, mejl je odmah potvrđen.
- Produkcija: `python deploy/deploy.py --users`. Spisak je u `deploy/.env` (`DEPLOY_USERS=mejl:uloga:Ime,...`), lozinka
  u `DEPLOY_USERS_PASSWORD`. Bez `--users` deploy ne dira naloge.
- Ostali korisnici se registruju na sajtu (potvrda stiže mejlom). Admin im menja ulogu ili ih blokira na `/admin/korisnici`.

## Lokalno (seed, `php artisan migrate:fresh --seed`)

Lozinka za sve: `lozinka123` (samo lokalno, u produkciji se ne prave). `migrate:fresh` briše i prave naloge, pa posle
njega ponovo pokreni `app:user`.

| Mejl | Uloga |
|---|---|
| admin@fiskultura.test | admin |
| urednik@fiskultura.test | editor |
| autor@fiskultura.test | author |
| korisnik@fiskultura.test | user |
