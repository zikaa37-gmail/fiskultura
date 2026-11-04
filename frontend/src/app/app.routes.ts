import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guards';

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
    path: '**',
    title: 'Stranica ne postoji — Fiskultura',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
