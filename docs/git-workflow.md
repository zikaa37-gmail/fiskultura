# Git radni tok

Glavna grana je `dev` (podrazumevana na GitHub-u). Zadaci su u `docs/zadaci.md` i na GitHub Issues
(repo `zikaa37-gmail/fiskultura`). Za svaki zadatak:

1. Povuci najnoviji `dev` (`git checkout dev && git pull`).
2. Napravi granu `feat-<kratak-opis>` ili `fix-<kratak-opis>` od `dev`.
3. Radi na zadatku na toj grani; `ng build`, `ng test` i `php artisan test` moraju da prođu.
4. Otvori pull request ka `dev` (`Closes #<broj>` u opisu ako postoji issue).
5. Posle merge-a vrati se na `dev`, povuci izmene i obriši lokalnu granu.

## Pravila na GitHub-u

Ruleset `dev-branch-protection` važi za podrazumevanu granu i nema izuzetaka (ni za admina):

- direktan push nije dozvoljen, izmene idu samo kroz pull request;
- force push nije dozvoljen;
- grana ne može da se obriše.

Grana sa koje je PR spojen briše se automatski.

## Lokalna zaštita

Jednom pokreni (iz korena repoa):

```bash
git config core.hooksPath .githooks
```

Posle toga `git push` na `dev` odbija se odmah, pre slanja na GitHub, sa porukom da se napravi grana
i otvori PR.
