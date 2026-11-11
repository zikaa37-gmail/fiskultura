import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).isAuthenticated() || inject(Router).createUrlTree(['/prijava'], { queryParams: { povratak: state.url } });

export const staffGuard: CanActivateFn = () => inject(AuthService).isStaff() || inject(Router).createUrlTree(['/']);

export const editorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isEditor() || inject(Router).createUrlTree([auth.isStaff() ? '/admin/pitanja' : '/']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin() || inject(Router).createUrlTree([auth.isEditor() ? '/admin' : '/']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return !auth.isAuthenticated() || inject(Router).parseUrl(auth.homeUrl());
};
