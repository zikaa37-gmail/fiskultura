import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { API_URL } from './api';

export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN');

export const SERVER_USER_AGENT = 'Mozilla/5.0 (compatible; FiskulturaRender/1.0; +https://fiskultura.rs)';

export const apiOriginInterceptor: HttpInterceptorFn = (request, next) => {
  const origin = inject(API_ORIGIN, { optional: true });
  if (!origin || !request.url.startsWith(`${API_URL}/`)) {
    return next(request);
  }
  return next(request.clone({ url: origin.replace(/\/$/, '') + request.url, setHeaders: { 'User-Agent': SERVER_USER_AGENT } }));
};
