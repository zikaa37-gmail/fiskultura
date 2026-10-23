# Fiskultura

Portal za fizičko vaspitanje (`fiskultura.rs`). Za sada statička naslovna bez build koraka;
portal (Angular + Laravel) se pravi po fazama iz `docs/koncept.md`, zadaci su u `docs/zadaci.md`.

- `index.html`, `style.css`, `main.js` — naslovna (vežba dana se menja svakog dana, lista vežbi je u
  `main.js`).
- `staro/index-2023.html` — prethodna naslovna sa linkovima na aplikacije (ne objavljuje se).

## Lokalno

`python -m http.server 8080` iz ovog foldera, pa `http://localhost:8080`.

## Deploy

Kopiraj `deploy/env.example` u `deploy/.env` (van gita), upiši FTP podatke, pa
`python deploy/deploy.py`. Šalje samo fajlove naslovne u `DEPLOY_WEB_DIR` (document root glavnog
domena, na cPanel-u `public_html`) i ne dira poddomene.

`.htaccess` (HTTPS preusmeravanje bez `/.well-known/` zbog SSL-a, keš) se šalje zajedno sa naslovnom —
u `public_html` ranije nije postojao. Poddomeni imaju svoje foldere van `public_html` i ne dira ih.

Prvi deploy: 23.10.2026. Prethodna naslovna sa servera je sačuvana u `staro/index-server-2023.html`
(stari folderi `assets/` i `test/` su ostali na serveru).
