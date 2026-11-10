import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { API_URL } from '../http/api';
import { AuthService } from './auth.service';

const PUBLIC_AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/resend-verification', '/auth/forgot-password', '/auth/reset-password', '/auth/invitation', '/auth/refresh', '/auth/logout'];

function isProtectedApiRequest(request: HttpRequest<unknown>): boolean {
  return (
    request.url.startsWith(`${API_URL}/`) &&
    !PUBLIC_AUTH_ENDPOINTS.some((endpoint) => request.url.endsWith(endpoint))
  );
}

function withToken(request: HttpRequest<unknown>, token: string | null) {
  return token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isProtectedApiRequest(request)) {
    return next(request);
  }

  const auth = inject(AuthService);

  return next(withToken(request, auth.accessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !auth.refreshToken()) {
        if (error.status === 401) {
          auth.clearSession();
        }
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        catchError((refreshError) => {
          auth.clearSession();
          return throwError(() => refreshError);
        }),
        switchMap((response) => next(withToken(request, response.access_token))),
      );
    }),
  );
};
