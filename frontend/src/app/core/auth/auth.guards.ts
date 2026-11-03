import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).isAuthenticated() || inject(Router).createUrlTree(['/prijava'], { queryParams: { povratak: state.url } });

export const editorGuard: CanActivateFn = () => inject(AuthService).isEditor() || inject(Router).createUrlTree(['/']);

export const adminGuard: CanActivateFn = () => inject(AuthService).isAdmin() || inject(Router).createUrlTree(['/']);

export const guestGuard: CanActivateFn = () => !inject(AuthService).isAuthenticated() || inject(Router).createUrlTree(['/profil']);
