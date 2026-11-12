import { inject } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { GateSection } from './content/members-gate';
import { adminGuard, authGuard, editorGuard, guestGuard, staffGuard } from './core/auth/auth.guards';
import { AuthService } from './core/auth/auth.service';
import { SITE_ORGANIZATION, SITE_WEBSITE } from './core/seo/seo.service';

const allRoutes: Routes = [
  {
    path: '',
    title: 'Fiskultura — portal za fizičko vaspitanje',
    data: { seo: { description: 'Portal za nastavnike fizičkog vaspitanja u Srbiji: vesti iz školskog sporta, strukovna udruženja, propisi, pitanja i odgovori, pravila sportova i aplikacije za nastavu.', jsonLd: [SITE_ORGANIZATION, SITE_WEBSITE] } },
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'vesti',
    title: 'Vesti i objave — Fiskultura',
    data: { seo: { description: 'Vesti iz fizičkog vaspitanja i školskog sporta u Srbiji: seminari, takmičenja, konkursi i saopštenja strukovnih udruženja, ukratko i uz link na izvor.' } },
    loadComponent: () => import('./features/news/news').then((m) => m.News),
  },
  {
    path: 'vesti/:slug',
    title: 'Vest — Fiskultura',
    data: { dynamicSeo: true },
    loadComponent: () => import('./features/news/news-detail').then((m) => m.NewsDetail),
  },
  {
    path: 'udruzenja/:slug',
    title: 'Udruženje — Fiskultura',
    data: { dynamicSeo: true },
    loadComponent: () => import('./features/organizations/organization-detail').then((m) => m.OrganizationDetail),
  },
  {
    path: 'udruzenja',
    title: 'Strukovna udruženja — Fiskultura',
    data: { seo: { description: 'Strukovna udruženja nastavnika fizičkog vaspitanja u Srbiji: SSPFVS i društva po gradovima, savezi za školski sport, kontakti, sajtovi i najnovije objave.' } },
    loadComponent: () => import('./features/organizations/organizations').then((m) => m.Organizations),
  },
  {
    path: 'sportovi',
    title: 'Sportovi i pravila — Fiskultura',
    data: { seo: { description: 'Pravila sportskih igara za čas fizičkog vaspitanja: košarka, odbojka, rukomet, mali fudbal, atletika i gimnastika, sa sličicama i PDF uputstvima.' } },
    loadComponent: () => import('./features/sports/sports').then((m) => m.Sports),
  },
  {
    path: 'sportovi/kosarka',
    title: 'Pravila košarke za decu — Fiskultura',
    data: { seo: { description: 'Pravila košarke za decu sa sličicama: teren, poeni, dribling, koraci, aut, 3 i 24 sekunde, faulovi i sudijski znaci. Kviz i zvanična pravila KSS i FIBA za mlađe kategorije.' } },
    loadComponent: () => import('./features/sports/basketball/basketball-rules').then((m) => m.BasketballRules),
  },
  {
    path: 'sportovi/odbojka',
    title: 'Pravila odbojke za decu — Fiskultura',
    data: { seo: { description: 'Pravila odbojke za decu sa sličicama: teren i mreža, servis, rotacija, tri dodira, dupli dodir, mreža i srednja linija, kartoni i sudijski znaci. Kviz i zvanična pravila FIVB 2025–2028.' } },
    loadComponent: () => import('./features/sports/volleyball/volleyball-rules').then((m) => m.VolleyballRules),
  },
  {
    path: 'sportovi/rukomet',
    title: 'Pravila rukometa za decu — Fiskultura',
    data: { seo: { description: 'Pravila rukometa za decu sa sličicama: prostor golmana, tri koraka i tri sekunde, vođenje, faul, isključenje, sedmerac, pasivna igra i sudijski znaci. Kviz i zvanična pravila IHF 2025.' } },
    loadComponent: () => import('./features/sports/handball/handball-rules').then((m) => m.HandballRules),
  },
  {
    path: 'sportovi/mali-fudbal',
    title: 'Pravila malog fudbala (futsala) za decu — Fiskultura',
    data: { seo: { description: 'Pravila malog fudbala (futsala) za decu sa sličicama: teren, izmene u letu, aut nogom, 4 sekunde, golman, kumulativni faulovi, penal sa 6 m, kartoni i sudijski znaci. Kviz i zvanična pravila FIFA 2025/26.' } },
    loadComponent: () => import('./features/sports/futsal/futsal-rules').then((m) => m.FutsalRules),
  },
  {
    path: 'sportovi/jadzent',
    title: 'Pravila jadženta za decu — Fiskultura',
    data: { seo: { description: 'Pravila jadženta za decu sa sličicama: teren i polje Dama, mreža na 1 m, parovi i džokeri, ko koga gađa, pogoci, povratak u igru i visinska barijera. Kviz i pravila sa zvaničnog sajta jadženta.' } },
    loadComponent: () => import('./features/sports/jadzent/jadzent-rules').then((m) => m.JadzentRules),
  },
  {
    path: 'sportovi/testiranje',
    title: 'Testiranje fizičkih sposobnosti — uputstvo — Fiskultura',
    data: { seo: { description: 'Uputstvo za merenja učenika: protokoli testova nacionalne baterije (Zdravitas) i stare baterije testova, oprema, organizacija časa, kriterijumske referentne vrednosti i izvori.' } },
    loadComponent: () => import('./features/testing/testing').then((m) => m.Testing),
  },
  {
    path: 'sportovi/kros',
    title: 'Školski kros — uputstvo — Fiskultura',
    data: { seo: { description: 'Uputstvo za školski kros: šta propisuju program i ZUOV, organizacija i bezbednost u školi, Kros RTS-a i „Neka trči Srbija", i veza sa školskim takmičenjima, uz izvore.' } },
    loadComponent: () => import('./features/cross/cross').then((m) => m.Cross),
  },
  {
    path: 'sportovi/atletika',
    title: 'Pravila atletike za decu — Fiskultura',
    data: { seo: { description: 'Pravila atletike za decu sa sličicama: staze, niski i visoki start, pogrešan start, cilj, štafeta, skok udalj i uvis, bacanje kugle i loptice, bezbednost. Kviz i zvanična pravila World Athletics i SAS.' } },
    loadComponent: () => import('./features/sports/athletics/athletics-rules').then((m) => m.AthleticsRules),
  },
  {
    path: 'sportovi/gimnastika',
    title: 'Gimnastika za decu — Fiskultura',
    data: { seo: { description: 'Gimnastika za decu sa sličicama: kolut napred i nazad, sveća, most, stav o šakama, premet strance, preskok, greda, vratilo, razboj i krugovi, čuvanje i pomaganje. Kviz i izvori.' } },
    loadComponent: () => import('./features/sports/gymnastics/gymnastics-rules').then((m) => m.GymnasticsRules),
  },
  {
    path: 'sportovi/elementarne-igre',
    title: 'Elementarne igre za decu — Fiskultura',
    data: { seo: { description: 'Elementarne igre za čas fizičkog vaspitanja sa sličicama: igre hvatanja, štafete, „Između dve vatre", graničar i druge, uz uzrast, varijante i fer-plej. Kviz i izvori.' } },
    loadComponent: () => import('./features/sports/elementary-games/elementary-games-rules').then((m) => m.ElementaryGamesRules),
  },
  {
    path: 'sportovi/vezbe-sa-rekvizitima',
    title: 'Vežbe sa rekvizitima za decu — Fiskultura',
    data: { seo: { description: 'Vežbe sa rekvizitima za decu sa sličicama: vijača, obruč, lopta, medicinka, čunjevi i švedska klupa — hvatovi, vežbe, česte greške i bezbednost. Kviz i izvori.' } },
    loadComponent: () => import('./features/sports/props/props-rules').then((m) => m.PropsRules),
  },
  {
    path: 'sportovi/plesovi',
    title: 'Plesovi za decu — Fiskultura',
    data: { seo: { description: 'Narodna kola i društveni plesovi za decu sa sličicama: takt i ritam, kolo, trokorak, Moravac, Užičko kolo, valcer i rokenrol, vijača uz muziku. Kviz, muzika i izvori.' } },
    loadComponent: () => import('./features/sports/dances/dances-rules').then((m) => m.DancesRules),
  },
  {
    path: 'literatura',
    title: 'Literatura i izvori — Fiskultura',
    data: { seo: { description: 'Svi izvori sadržaja portala Fiskultura: propisi, zvanična pravila sportova, priručnici, udžbenici, stručni radovi i fotografije, sa linkovima na originale i autore.' } },
    loadComponent: () => import('./features/literature/literature').then((m) => m.Literature),
  },
  {
    path: 'ishodi',
    title: 'Ishodi fizičkog i zdravstvenog vaspitanja po razredima — Fiskultura',
    data: { seo: { description: 'Ishodi, teme, sadržaji i fond časova fizičkog i zdravstvenog vaspitanja za svaki razred osnovne i srednje škole, prema važećim pravilnicima i sa linkom na zvanični tekst.' } },
    loadComponent: () => import('./features/outcomes/outcomes').then((m) => m.Outcomes),
  },
  {
    path: 'ishodi/:razred',
    title: 'Ishodi po razredima — Fiskultura',
    data: { dynamicSeo: true },
    loadComponent: () => import('./features/outcomes/outcome-grade').then((m) => m.OutcomeGrade),
  },
  {
    path: 'propisi',
    title: 'Propisi: šta važi u nastavi fizičkog — Fiskultura',
    data: { seo: { description: 'Šta važi danas u nastavi fizičkog i zdravstvenog vaspitanja: fond časova, programi i ishodi, važeći i stari propisi, kako su se menjali i kontakti institucija.' } },
    loadComponent: () => import('./features/regulations/regulations').then((m) => m.Regulations),
  },
  {
    path: 'propisi/:tema',
    title: 'Šta važi — Fiskultura',
    data: { dynamicSeo: true },
    loadComponent: () => import('./features/regulations/rule-topic-page').then((m) => m.RuleTopicPage),
  },
  {
    path: 'kontakt',
    title: 'Kontakt i uredništvo — Fiskultura',
    data: { seo: { description: 'Ko pravi portal Fiskultura i kako da pišete uredništvu: greške, pitanja, predlozi i saradnja.' } },
    loadComponent: () => import('./features/regulations/contact-page').then((m) => m.ContactPage),
  },
  {
    path: 'pitanja',
    title: 'Pitanja i odgovori — Fiskultura',
    data: { seo: { description: 'Pitanja i odgovori za nastavnike fizičkog vaspitanja: norma, ocenjivanje, oslobađanje od nastave, bezbednost na času i takmičenja, uz poziv na propis.' } },
    loadComponent: () => import('./features/questions/questions').then((m) => m.Questions),
  },
  {
    path: 'pitanja/postavi',
    title: 'Postavi pitanje — Fiskultura',
    data: { seo: { description: 'Postavite pitanje o administraciji i propisima u nastavi fizičkog vaspitanja; urednik odgovara uz poziv na propis.' } },
    loadComponent: () => import('./features/questions/ask-question').then((m) => m.AskQuestion),
  },
  {
    path: 'pitanja/:slug',
    title: 'Pitanje — Fiskultura',
    data: { dynamicSeo: true },
    loadComponent: () => import('./features/questions/question-detail').then((m) => m.QuestionDetail),
  },
  {
    path: 'debate',
    title: 'Stručne debate — Fiskultura',
    data: { seo: { description: 'Stručne debate nastavnika fizičkog vaspitanja: teme struke, mišljenja kolega, predlozi i sažetak rasprave.' } },
    loadComponent: () => import('./features/debates/debates').then((m) => m.Debates),
  },
  {
    path: 'debate/:slug',
    title: 'Debata — Fiskultura',
    data: { dynamicSeo: true },
    loadComponent: () => import('./features/debates/debate-detail').then((m) => m.DebateDetail),
  },
  {
    path: 'notifikacije',
    title: 'Notifikacije — Fiskultura',
    canActivate: [authGuard],
    data: { seo: { noindex: true } },
    loadComponent: () => import('./features/inbox/notifications-page').then((m) => m.NotificationsPage),
  },
  {
    path: 'obavestenja',
    title: 'Obaveštenja mejlom — Fiskultura',
    data: { seo: { description: 'Primajte mejlom vesti, seminare, takmičenja i konkurse iz fizičkog vaspitanja: odmah ili kao nedeljni pregled, uz odjavu jednim klikom.' } },
    loadComponent: () => import('./features/notifications/notifications').then((m) => m.NotificationsPage),
  },
  {
    path: 'obavestenja/potvrda',
    title: 'Potvrda prijave — Fiskultura',
    data: { action: 'confirm', seo: { noindex: true } },
    loadComponent: () => import('./features/notifications/subscription-link').then((m) => m.SubscriptionLink),
  },
  {
    path: 'obavestenja/odjava',
    title: 'Odjava sa obaveštenja — Fiskultura',
    data: { action: 'unsubscribe', seo: { noindex: true } },
    loadComponent: () => import('./features/notifications/subscription-link').then((m) => m.SubscriptionLink),
  },
  {
    path: 'aplikacije',
    title: 'Aplikacije za nastavnike — Fiskultura',
    data: { seo: { description: 'Aplikacije za nastavnike fizičkog vaspitanja: e-pripreme, Evidencija FV, Jadžent i Zdravitas, sa opisom šta koja radi.' } },
    loadComponent: () => import('./features/apps/apps').then((m) => m.Apps),
  },
  {
    path: 'novi-nastavnici',
    title: 'Za nove nastavnike i studente — Fiskultura',
    data: {
      seo: {
        description:
          'Prvi koraci za nove nastavnike fizičkog vaspitanja i studente fakulteta sporta: pripravnički staž, ispit za licencu, 30 ESPB, stručno usavršavanje i gde na portalu šta nalaziš.',
      },
    },
    loadComponent: () => import('./features/community/new-teachers').then((m) => m.NewTeachers),
  },
  {
    path: 'imenik',
    title: 'Imenik struke — Fiskultura',
    data: { seo: { noindex: true } },
    canActivate: [authGuard],
    loadComponent: () => import('./features/community/directory').then((m) => m.Directory),
  },
  {
    path: 'prijava',
    title: 'Prijava — Fiskultura',
    data: { seo: { noindex: true } },
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'registracija',
    title: 'Napravi nalog — Fiskultura',
    data: { seo: { noindex: true } },
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register').then((m) => m.Register),
  },
  {
    path: 'potvrda-naloga',
    title: 'Potvrda naloga — Fiskultura',
    data: { seo: { noindex: true } },
    loadComponent: () => import('./features/auth/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'zaboravljena-lozinka',
    title: 'Zaboravljena lozinka — Fiskultura',
    data: { seo: { noindex: true } },
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'zavrsi-registraciju',
    title: 'Završetak registracije — Fiskultura',
    data: { seo: { noindex: true } },
    loadComponent: () => import('./features/auth/complete-registration').then((m) => m.CompleteRegistration),
  },
  {
    path: 'nova-lozinka',
    title: 'Nova lozinka — Fiskultura',
    data: { seo: { noindex: true } },
    loadComponent: () => import('./features/auth/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'profil',
    title: 'Moj profil — Fiskultura',
    data: { seo: { noindex: true } },
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/profile').then((m) => m.Profile),
  },
  {
    path: 'admin',
    title: 'Admin — Fiskultura',
    data: { seo: { noindex: true } },
    canActivate: [authGuard, staffGuard],
    loadComponent: () => import('./features/admin/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: () => (inject(AuthService).isEditor() ? 'vesti' : 'pitanja') },
      { path: 'vesti', canActivate: [editorGuard], title: 'Admin: vesti — Fiskultura', data: { admin: true }, loadComponent: () => import('./features/news/news-list').then((m) => m.NewsList) },
      { path: 'vesti/nova', canActivate: [editorGuard], title: 'Nova vest — Fiskultura', loadComponent: () => import('./features/admin/admin-news-form').then((m) => m.AdminNewsForm) },
      { path: 'vesti/:id', canActivate: [editorGuard], title: 'Izmena vesti — Fiskultura', loadComponent: () => import('./features/admin/admin-news-form').then((m) => m.AdminNewsForm) },
      { path: 'pitanja', title: 'Admin: pitanja — Fiskultura', loadComponent: () => import('./features/admin/admin-questions').then((m) => m.AdminQuestions) },
      { path: 'pitanja/novo', canActivate: [editorGuard], title: 'Novo pitanje — Fiskultura', loadComponent: () => import('./features/admin/admin-question-form').then((m) => m.AdminQuestionForm) },
      { path: 'pitanja/:id', title: 'Pitanje i odgovor — Fiskultura', loadComponent: () => import('./features/admin/admin-question-form').then((m) => m.AdminQuestionForm) },
      { path: 'udruzenja', canActivate: [editorGuard], title: 'Admin: udruženja — Fiskultura', loadComponent: () => import('./features/admin/admin-organizations').then((m) => m.AdminOrganizations) },
      { path: 'udruzenja/nova', canActivate: [editorGuard], title: 'Nova organizacija — Fiskultura', loadComponent: () => import('./features/admin/admin-organization-form').then((m) => m.AdminOrganizationForm) },
      { path: 'udruzenja/:id', canActivate: [editorGuard], title: 'Izmena organizacije — Fiskultura', loadComponent: () => import('./features/admin/admin-organization-form').then((m) => m.AdminOrganizationForm) },
      { path: 'propisi', canActivate: [editorGuard], title: 'Admin: propisi — Fiskultura', loadComponent: () => import('./features/admin/admin-regulations').then((m) => m.AdminRegulations) },
      { path: 'propisi/novi', canActivate: [editorGuard], title: 'Novi propis — Fiskultura', loadComponent: () => import('./features/admin/admin-regulation-form').then((m) => m.AdminRegulationForm) },
      { path: 'propisi/:key', canActivate: [editorGuard], title: 'Izmena propisa — Fiskultura', loadComponent: () => import('./features/admin/admin-regulation-form').then((m) => m.AdminRegulationForm) },
      { path: 'debate', canActivate: [editorGuard], title: 'Admin: stručne debate — Fiskultura', loadComponent: () => import('./features/admin/admin-debates').then((m) => m.AdminDebates) },
      { path: 'drustvene-mreze', canActivate: [editorGuard], title: 'Admin: društvene mreže — Fiskultura', loadComponent: () => import('./features/admin/admin-social').then((m) => m.AdminSocial) },
      { path: 'obavestenja', title: 'Admin: obaveštenja — Fiskultura', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-notifications').then((m) => m.AdminNotifications) },
      { path: 'clanstvo', title: 'Admin: članstvo — Fiskultura', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-members').then((m) => m.AdminMembers) },
      { path: 'posta', title: 'Admin: pošta — Fiskultura', canActivate: [adminGuard], loadComponent: () => import('./features/admin/mailbox/admin-mailbox').then((m) => m.AdminMailbox) },
      { path: 'moderatori', title: 'Admin: moderatori — Fiskultura', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-moderators').then((m) => m.AdminModerators) },
      { path: 'korisnici', title: 'Admin: korisnici — Fiskultura', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-users').then((m) => m.AdminUsers) },
    ],
  },
  {
    path: '**',
    title: 'Stranica ne postoji — Fiskultura',
    data: { seo: { noindex: true } },
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];

const MEMBERS_ONLY: GateSection[] = ['sportovi', 'propisi', 'pitanja', 'debate', 'ishodi'];

function membersOnly(route: Route): Route {
  const section = MEMBERS_ONLY.find((prefix) => route.path === prefix || route.path?.startsWith(`${prefix}/`));
  if (!section) {
    return route;
  }
  const { loadComponent, ...rest } = route;
  return {
    ...rest,
    data: { ...route.data, gate: section },
    loadComponent: () => import('./shared/members-only/members-only').then((m) => m.MembersOnly),
    children: [{ path: '', loadComponent }],
  };
}

export const routes: Routes = allRoutes.map(membersOnly);
