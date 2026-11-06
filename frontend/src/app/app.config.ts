import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { authInterceptor } from './core/auth/auth.interceptor';
import { apiOriginInterceptor } from './core/http/api-origin.interceptor';
import { SeoTitleStrategy } from './core/seo/seo-title.strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiOriginInterceptor])),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
    provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({ includePostRequests: true })),
  ],
};
