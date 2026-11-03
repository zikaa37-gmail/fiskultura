import { Routes } from '@angular/router';

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
    path: '**',
    title: 'Stranica ne postoji — Fiskultura',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
