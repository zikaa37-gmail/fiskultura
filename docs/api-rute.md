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
| POST | `/auth/logout-all` | `jwt` | poništava sve refresh tokene (odjava sa svih uređaja) |
| GET | `/me/export` | `jwt` | moji podaci: nalog, prijava na obaveštenja, moja pitanja (JSON) |
| DELETE | `/auth/me` | `jwt`, 5/min | `password` → briše nalog i prijavu na obaveštenja; pitanja ostaju bez veze sa nalogom; poslednji admin ne može |

Korisnik u odgovoru: `id`, `name`, `email`, `role` (`user` | `author` | `editor` | `admin`), `member_status`
(`nastavnik-os` | `nastavnik-ss` | `pripravnik` | `student` | `penzija` | `drugo`), `school`, `municipality`, `district`,
`directory_consent`, `surveys_consent`. Registracija prima i `member_status` i `source` (izvor iz `?izvor=`, samo
`[a-z0-9-]`, inače se odbacuje); `PATCH /auth/me` prima i `member_status`, `directory_consent`, `surveys_consent`
(datum saglasnosti se čuva od prvog uključivanja). Refresh beleži `last_active_at`.

## Članstvo (#49)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| GET | `/members` | `jwt` | imenik: potvrđeni, neblokirani članovi sa saglasnošću; `member_status`, `district`, `q`, `page` (30 po strani); bez mejla; `403` sa `code: directory_consent_required` ako korisnik sam nije u imeniku |
| GET | `/admin/members/stats` | admin | `total`, `unverified`, `new_7_days`, `new_30_days`, `active_30_days`, `in_directory`, `surveys_consent`, `by_status`, `by_district`, `by_source` |

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
| POST | `/admin/users` | admin | `name`, `email`, `role`, profil; korisnik dobija lični poziv (14 dana); `password` admina za `editor` i `admin` |
| POST | `/admin/users/invitations` | admin | `ids` (do 50): lični poziv za naloge koji čekaju aktivaciju → `sent`, `skipped`, `failed`; novi poziv poništava stari link |
| POST | `/auth/invitation` | javno, 10/min | `token` → podaci naloga za završetak registracije |
| POST | `/auth/invitation/complete` | javno, 10/min | `token`, `name`, `password` (+ potvrda), profil, saglasnosti → aktivira nalog i prijavu na obaveštenja |
| PATCH | `/admin/users/{id}` | admin | `name`, `email`, `member_status`, `school`, `municipality`, `district`, `role`, `blocked` (blokiranje poništava sesije), `password` (lozinka admina, obavezna kad se uloga podiže na `editor` ili `admin`); svoj nalog ne može |
| DELETE | `/admin/users/{id}` | admin | briše nalog i prijavu na obaveštenja; svoj nalog ne može |

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
| POST | `/questions` | prijavljen (5/min) | `category`, `title`, `body`; status `pending`, najviše 5 na čekanju po korisniku; automatski se dodeljuje autoru ili uredniku sa najmanje otvorenih pitanja (`assigned_to`) |
| GET | `/me/questions` | prijavljen | moja pitanja sa statusom; `slug` tek kad je objavljeno |
| POST | `/admin/questions/list` | author, editor, admin | `status`, `search`, `mine`; autor vidi samo pitanja dodeljena njemu; prvo ona na čekanju, `pending` = broj na čekanju |
| GET / PATCH | `/admin/questions/{id}` | author (samo dodeljena), editor, admin | i `original` (tekst pitaoca, samo za urednika) i `asker`; za `published` su obavezni `answer` i `valid_on` |
| POST | `/admin/questions` | editor, admin | urednik sam piše pitanje i odgovor |
| DELETE | `/admin/questions/{id}` | admin | brisanje |
| POST | `/admin/questions/{id}/draft` | author (samo dodeljena), editor, admin (10 za 10 min) | AI nacrt odgovora: `title`, `answer`, `regulation_keys` (samo postojeći ključevi), `confidence`, `editor_note`; ništa ne čuva |
| PATCH | `/admin/questions/{id}/assignee` | admin | `user_id` (autor, urednik ili admin) ili `null` |
| GET | `/admin/staff` | editor, admin | autori, urednici i admini za izbor kome se pitanje dodeljuje |

Javni tekst pitanja urednik prepravlja bez imena i škole; pitalac nikad nije javan. Kad se pitanje prvi put objavi,
pitalac dobija mejl sa linkom (`asker_notified_at`). `regulation_keys` su ključevi iz `/regulations`. Početni
odgovori: `backend/database/data/questions.json` (uvoz kao kod propisa: menja samo zapise koje urednik nije dirao).

## Debate (#50)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| GET | `/debates` | prijavljen | otvorene i zatvorene teme (`status`, `q`); `proposals` = moji predlozi na čekanju ili odbijeni |
| POST | `/debates` | prijavljen (5 za 10 min) | predlog teme: `title`, `description`; član → `proposed` (najviše 3 na čekanju), urednik/admin → `open`; moderator se dodeljuje automatski |
| GET | `/debates/{slug}` | prijavljen | tema, odobren `summary`, `can_moderate`; moderator dobija i `summary_draft` i `summary_guidance` |
| PATCH | `/debates/{slug}` | moderatori (admin, urednici, rotacija, dodeljeni) | `status` (`open` / `closed`), `description` |
| GET | `/debates/{slug}/posts` | prijavljen | `q`, `kind`, `sort` (`new`, `top`, `old`), `highlighted`, `page`; 30 po strani, `liked` za mene; moderator vidi i sakrivene |
| POST | `/debates/{slug}/posts` | prijavljen (10/min), tema `open` | `kind` (`question`, `criticism`, `statement`, `suggestion`), `body`; moderator teme dobija mejl (osim za svoj prilog) |
| POST | `/debate-posts/{id}/react` | prijavljen (60/min) | `type` (`like`, `agree`, `disagree`, `useful`); jedna reakcija po članu, ista povlači, druga menja; ne na svoj prilog; autor dobija notifikaciju na sajtu |
| POST | `/debate-posts/{id}/like` | prijavljen (60/min) | isto što i `react` sa `type: like` (stari klijenti) |
| POST | `/debate-posts/{id}/ban` | moderatori | `reason`, `days` (1, 7, 30 ili `null` = trajno), `scope` (`debate` / `all`), `hide_post`; korisnik dobija mejl i notifikaciju; ne može adminu ni sebi |
| GET | `/debates/{slug}/bans` | moderatori | aktivne zabrane za temu (i one za sve teme) |
| DELETE | `/debate-bans/{id}` | moderatori | ukidanje zabrane, korisnik dobija notifikaciju |
| PATCH | `/debate-posts/{id}` | moderatori (admin, urednici, rotacija, dodeljeni) | `highlighted`, `hidden` |
| POST | `/debates/{slug}/analysis` | moderatori (admin, urednici, rotacija, dodeljeni; 5 za 10 min) | AI nacrt sažetka (`guidance` nije obavezno); 503 sa porukom ako AI nije podešen |
| POST | `/debates/{slug}/analysis/approve` | moderatori (admin, urednici, rotacija, dodeljeni) | nacrt postaje javni `summary` |
| POST | `/admin/debates/list` | editor, admin | sve teme (`status`, `search`); `proposed` = broj predloga |
| POST | `/admin/debates` | editor, admin | nova otvorena tema; `moderator_id` samo admin |
| PATCH | `/admin/debates/{id}` | editor, admin | `title`, `description`, `status` (odobri / odbij / zatvori); `moderator_id` (bilo koji neblokiran korisnik) samo admin |
| DELETE | `/admin/debates/{id}` | admin | brisanje teme sa prilozima |
| POST | `/debates/{slug}/reopen-requests` | prijavljen (3 za 10 min), tema `closed` | `kind`, `body`; jedan zahtev na čekanju po članu; moderator dobija mejl i notifikaciju |
| POST | `/debate-reopen-requests/{id}/decision` | moderatori (admin, urednici, rotacija, dodeljeni) | `approve`, `note`; odobreno → tema `open` i prilog se objavljuje; član dobija mejl i notifikaciju |
| GET | `/admin/moderators` | admin | moderatori (rotacija, urednici, svi koji moderiraju) sa opterećenjem; `next` = ko dobija sledeću temu |
| PATCH | `/admin/moderators/{user}` | admin | `in_pool` (rotacija za automatsku dodelu) |
| GET | `/admin/moderators/log` | admin | evidencija dodela: tema, moderator, prethodni, ko je dodelio, `auto` / `manual` / `creator` |
| GET | `/admin/debates/{id}/promotion` | admin | `recipients` (aktivne prijave na obaveštenja), `last` (poslednji poziv), `hourly_limit` |
| POST | `/admin/debates/{id}/promotions` | admin (5 za 10 min), tema `open` | `message` (teaser); poziv šalje `notifications:send` postepeno, u okviru limita po satu, svakome jednom, sa linkom za odjavu |

Moderator teme je automatski urednik sa najmanje aktivnih tema (urednik koji sam otvori temu postaje njen moderator);
ako urednika nema, admin. AI (`App\Services\Ai\ClaudeAssistant`, model `claude-opus-5-5`, ključ `ANTHROPIC_API_KEY`)
dobija priloge kao podatke i vraća JSON po šemi; ID-jevi priloga koji ne postoje se odbacuju. Ograničenja broja
zahteva (`throttle`) računaju se po korisniku, ne po IP adresi. Zatvorena tema je zamrznuta: prilozi, lajkovi,
isticanje i analiza vraćaju 422. Korisnik sa zabranom (`my_ban` na temi) ne piše priloge, zahteve ni predloge tema
(403 sa razlogom), ali čita i reaguje.

## Pošta admin@fiskultura.rs (#53, samo admin)

| Metod | Ruta | Opis |
|---|---|---|
| GET | `/admin/mailbox/folders` | `address`, folderi (`path`, `name`, `total`, `unread` za INBOX) |
| GET | `/admin/mailbox/messages` | `folder` (podrazumevano `INBOX`), `page`, `q`; 25 po strani, najnoviji prvi, ne menja „pročitano” |
| GET | `/admin/mailbox/messages/{uid}` | ceo mejl (`text`, `html`, `cc`, `reply_to`, `message_id`, `attachments`); označava kao pročitan |
| PATCH | `/admin/mailbox/messages/{uid}` | `folder`, `seen` |
| POST | `/admin/mailbox/messages/{uid}/action` | `folder`, `action` (`delete`, `archive`, `spam`, `inbox`, `move` + `target`); brisanje iz Otpada je trajno, arhiva/neželjeno se prave ako ne postoje |
| GET | `/admin/mailbox/messages/{uid}/attachments/{index}` | preuzimanje priloga (uvek `application/octet-stream`, `attachment`) |
| POST | `/admin/mailbox/send` | `to[]`, `cc[]`, `subject`, `body` (tekst), `in_reply_to`, `references` (20 za 10 min); kopija ide u folder „Sent” |

IMAP 993 i SMTP 465 (SSL) preko `App\Services\Mailbox\ImapMailbox` (`webklex/php-imap`, Symfony Mailer), podešavanja
`MAILBOX_*` samo u `.env`. Bez podešavanja ili kad server ne odgovara: 503 sa porukom. HTML mejl se prikazuje u
`iframe` sa `sandbox` i CSP-om (bez skripti, slike sa interneta tek na dugme).

## Notifikacije (#51)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| GET | `/me/notifications` | prijavljen | `page`, `unread`; 20 po strani, `unread` = broj nepročitanih |
| GET | `/me/notifications/unread` | prijavljen | `unread` (zvonce u meniju) |
| POST | `/me/notifications/read` | prijavljen | `ids` ili `all: true` |

Sve što portal pošalje korisniku upisuje se preko `App\Services\Inbox` (`kind`, `title`, `body`, `url`, `channels`).
Bez upisa su samo mejlovi pre nego što nalog postoji (potvrda naloga, poziv za registraciju).

## Obaveštenja mejlom (#16b, #16c)

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| POST | `/subscriptions` | javno (10/min) | `email`, `frequency` (`weekly` \| `instant`), `categories[]`, `organization_ids[]`; šalje mejl za potvrdu, a za već aktivnu adresu link za podešavanja (odgovor je isti, ne otkriva da li adresa postoji) |
| POST | `/subscriptions/confirm` | javno, `id` + `token` | potvrda prijave (dvostruki opt-in); vraća `manage_token` |
| POST | `/subscriptions/manage` | javno, `id` + `token` | podešavanja preko linka iz mejla |
| PATCH | `/subscriptions/manage` | javno, `id` + `token` | izmena podešavanja i `active` |
| POST | `/subscriptions/unsubscribe` | javno, `id` + `token` | odjava jednim klikom (i `List-Unsubscribe-Post` iz mejla, parametri u adresi) |
| GET / PUT | `/me/subscription` | prijavljen | „Moja obaveštenja“; potvrđen nalog ne traži potvrdu mejlom |
| GET | `/admin/subscriptions/stats` | admin | pretplatnici, poslato za 7 / 30 dana, neuspelo, odjave |

Tokeni u linkovima su HMAC (`APP_KEY`, svrha, id, mejl), ništa se ne čuva u bazi. Prazne `categories` /
`organization_ids` znače „sve“; vesti bez udruženja (portal) stižu uvek. Slanje: `php artisan notifications:send`
(na 10 minuta preko schedule-a): istaknuta vest odmah pretplatnicima `instant` (jednom, `news.notified_at`, samo vesti
objavljene u poslednja 3 dana), nedeljni pregled ponedeljkom od 7h pretplatnicima `weekly`. Najviše
`NOTIFY_HOURLY_LIMIT` (100) mejlova na sat, ostatak ide u sledećem krugu; svako slanje je u `fk_notification_log`.
Kanal je `NotificationChannel` (sada samo `MailChannel`); novi kanal se dodaje tagom `notification-channels`.
