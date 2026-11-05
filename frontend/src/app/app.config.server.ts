import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_ORIGIN } from './core/http/api-origin.interceptor';

export const SSR_API_ORIGIN = process.env['SSR_API_ORIGIN'] || 'https://fiskultura.rs';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: API_ORIGIN, useValue: SSR_API_ORIGIN },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
