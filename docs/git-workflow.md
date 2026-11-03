# Git radni tok

Task tracking je na GitHub Issues (repo `zikaa37-gmail/fiskultura`). Za svaki zadatak:

1. Povuci najnoviji `main` (`git checkout main && git pull`).
2. Napravi granu `feat-<broj taska>` (npr. `feat-6`) od `main`.
3. Dodaj label `in progress` (`gh issue edit <br> --add-label "in progress"`).
4. Radi na tasku na toj grani; `ng build` mora da prođe.
5. Otvori pull request ka `main` sa `Closes #<broj>` u opisu.
6. Posle merge-a ukloni `in progress` label (issue se zatvara automatski).

## Zabrana direktnog push-a na main

Jednom pokreni (iz korena repoa):

```bash
git config core.hooksPath .githooks
```

Posle toga je `git push` na `main` odbijen sa porukom da se napravi grana i otvori PR.
