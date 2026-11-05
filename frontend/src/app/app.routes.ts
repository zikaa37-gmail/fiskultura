import { Routes } from '@angular/router';
import { adminGuard, authGuard, editorGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    title: 'Fiskultura — portal za fizičko vaspitanje',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'vesti',
    title: 'Vesti i objave — Fiskultura',
    loadComponent: () => import('./features/news/news').then((m) => m.News),
  },
  {
    path: 'vesti/:slug',
    title: 'Vest — Fiskultura',
    loadComponent: () => import('./features/news/news-detail').then((m) => m.NewsDetail),
  },
  {
    path: 'udruzenja/:slug',
    title: 'Udruženje — Fiskultura',
    loadComponent: () => import('./features/organizations/organization-detail').then((m) => m.OrganizationDetail),
  },
  {
    path: 'udruzenja',
    title: 'Strukovna udruženja — Fiskultura',
    loadComponent: () => import('./features/organizations/organizations').then((m) => m.Organizations),
  },
  {
    path: 'sportovi',
    title: 'Sportovi i pravila — Fiskultura',
    loadComponent: () => import('./features/sports/sports').then((m) => m.Sports),
  },
  {
    path: 'propisi',
    title: 'Propisi i literatura — Fiskultura',
    loadComponent: () => import('./features/regulations/regulations').then((m) => m.Regulations),
  },
  {
    path: 'pitanja',
    title: 'Pitanja i odgovori — Fiskultura',
    loadComponent: () => import('./features/questions/questions').then((m) => m.Questions),
  },
  {
    path: 'pitanja/postavi',
    title: 'Postavi pitanje — Fiskultura',
    loadComponent: () => import('./features/questions/ask-question').then((m) => m.AskQuestion),
  },
  {
    path: 'pitanja/:slug',
    title: 'Pitanje — Fiskultura',
    loadComponent: () => import('./features/questions/question-detail').then((m) => m.QuestionDetail),
  },
  {
    path: 'obavestenja',
    title: 'Obaveštenja mejlom — Fiskultura',
    loadComponent: () => import('./features/notifications/notifications').then((m) => m.NotificationsPage),
  },
  {
    path: 'obavestenja/potvrda',
    title: 'Potvrda prijave — Fiskultura',
    data: { action: 'confirm' },
    loadComponent: () => import('./features/notifications/subscription-link').then((m) => m.SubscriptionLink),
  },
  {
    path: 'obavestenja/odjava',
    title: 'Odjava sa obaveštenja — Fiskultura',
    data: { action: 'unsubscribe' },
    loadComponent: () => import('./features/notifications/subscription-link').then((m) => m.SubscriptionLink),
  },
  {
    path: 'aplikacije',
    title: 'Aplikacije za nastavnike — Fiskultura',
    loadComponent: () => import('./features/apps/apps').then((m) => m.Apps),
  },
  {
    path: 'prijava',
    title: 'Prijava — Fiskultura',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'registracija',
    title: 'Napravi nalog — Fiskultura',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register').then((m) => m.Register),
  },
  {
    path: 'potvrda-naloga',
    title: 'Potvrda naloga — Fiskultura',
    loadComponent: () => import('./features/auth/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'zaboravljena-lozinka',
    title: 'Zaboravljena lozinka — Fiskultura',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'nova-lozinka',
    title: 'Nova lozinka — Fiskultura',
    loadComponent: () => import('./features/auth/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'profil',
    title: 'Moj profil — Fiskultura',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/profile').then((m) => m.Profile),
  },
  {
    path: 'admin',
    title: 'Admin — Fiskultura',
    canActivate: [authGuard, editorGuard],
    loadComponent: () => import('./features/admin/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'vesti' },
      { path: 'vesti', title: 'Admin: vesti — Fiskultura', loadComponent: () => import('./features/admin/admin-news-list').then((m) => m.AdminNewsList) },
      { path: 'vesti/nova', title: 'Nova vest — Fiskultura', loadComponent: () => import('./features/admin/admin-news-form').then((m) => m.AdminNewsForm) },
      { path: 'vesti/:id', title: 'Izmena vesti — Fiskultura', loadComponent: () => import('./features/admin/admin-news-form').then((m) => m.AdminNewsForm) },
      { path: 'pitanja', title: 'Admin: pitanja — Fiskultura', loadComponent: () => import('./features/admin/admin-questions').then((m) => m.AdminQuestions) },
      { path: 'pitanja/novo', title: 'Novo pitanje — Fiskultura', loadComponent: () => import('./features/admin/admin-question-form').then((m) => m.AdminQuestionForm) },
      { path: 'pitanja/:id', title: 'Pitanje i odgovor — Fiskultura', loadComponent: () => import('./features/admin/admin-question-form').then((m) => m.AdminQuestionForm) },
      { path: 'udruzenja', title: 'Admin: udruženja — Fiskultura', loadComponent: () => import('./features/admin/admin-organizations').then((m) => m.AdminOrganizations) },
      { path: 'udruzenja/nova', title: 'Nova organizacija — Fiskultura', loadComponent: () => import('./features/admin/admin-organization-form').then((m) => m.AdminOrganizationForm) },
      { path: 'udruzenja/:id', title: 'Izmena organizacije — Fiskultura', loadComponent: () => import('./features/admin/admin-organization-form').then((m) => m.AdminOrganizationForm) },
      { path: 'propisi', title: 'Admin: propisi — Fiskultura', loadComponent: () => import('./features/admin/admin-regulations').then((m) => m.AdminRegulations) },
      { path: 'propisi/novi', title: 'Novi propis — Fiskultura', loadComponent: () => import('./features/admin/admin-regulation-form').then((m) => m.AdminRegulationForm) },
      { path: 'propisi/:key', title: 'Izmena propisa — Fiskultura', loadComponent: () => import('./features/admin/admin-regulation-form').then((m) => m.AdminRegulationForm) },
      { path: 'obavestenja', title: 'Admin: obaveštenja — Fiskultura', loadComponent: () => import('./features/admin/admin-notifications').then((m) => m.AdminNotifications) },
      { path: 'korisnici', title: 'Admin: korisnici — Fiskultura', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-users').then((m) => m.AdminUsers) },
    ],
  },
  {
    path: '**',
    title: 'Stranica ne postoji — Fiskultura',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
