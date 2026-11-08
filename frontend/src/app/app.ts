import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { SiteHeader } from './layout/site-header';
import { SiteFooter } from './layout/site-footer';
import { BackToTop } from './shared/back-to-top/back-to-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter, BackToTop],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-site-header ngSkipHydration />
    <main>
      <router-outlet />
    </main>
    <app-site-footer />
    <app-back-to-top />
  `,
})
export class App {
  constructor() {
    const router = inject(Router);
    const auth = inject(AuthService);
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => auth.rememberSource(router.parseUrl(event.urlAfterRedirects).queryParams['izvor'] ?? null));
    inject(ViewportScroller).setOffset(() => [0, (document.querySelector('.topbar')?.getBoundingClientRect().height ?? 64) + (document.querySelector('.page-sticky')?.getBoundingClientRect().height ?? 0) + 12]);
  }
}
