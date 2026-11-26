import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PORTAL_APPS } from '../content/portal-content';
import { DISABLED_LINK_TITLE, isLinkDisabled } from '../core/disabled-links';
import { AuthService } from '../core/auth/auth.service';
import { PortalSocialLinks } from '../shared/portal-social/portal-social';
import { SubscribeLink } from '../shared/subscribe-link/subscribe-link';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, PortalSocialLinks, SubscribeLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-col footer-brand">
          <strong class="footer-title">Fiskultura</strong>
          <span class="muted">Portal za fizičko vaspitanje i školski sport u Srbiji · u izradi</span>
          <app-portal-social label="Pratite nas" />
          <app-subscribe-link [footer]="true" />
        </div>
        <nav class="footer-col" aria-label="Aplikacije">
          <strong class="footer-title">Aplikacije</strong>
          @for (app of apps; track app.id) {
            @if (isLinkDisabled(app.url)) {
              <span class="footer-link footer-link-disabled" [title]="disabledTitle">{{ app.name }}</span>
            } @else {
              <a class="footer-link" [href]="app.url" target="_blank" rel="noopener">{{ app.name }}</a>
            }
          }
        </nav>
        <nav class="footer-col" aria-label="Portal">
          <strong class="footer-title">Portal</strong>
          <a class="footer-link" routerLink="/vesti">Vesti</a>
          <a class="footer-link" routerLink="/tekstovi">Priče kolega</a>
          <a class="footer-link" routerLink="/udruzenja">Udruženja</a>
          <a class="footer-link" routerLink="/propisi">Propisi</a>
          @if (auth.isAuthenticated()) {
            <a class="footer-link" routerLink="/pitanja">Pitanja i odgovori</a>
          }
          <a class="footer-link" routerLink="/kontakt">Kontakt i uredništvo</a>
        </nav>
        <nav class="footer-col" aria-label="Za nastavu">
          <strong class="footer-title">Za nastavu</strong>
          <a class="footer-link" routerLink="/sportovi">Sportovi i pravila</a>
          @if (auth.isAuthenticated()) {
            <a class="footer-link" routerLink="/ishodi">Ishodi po razredima</a>
          }
          <a class="footer-link" routerLink="/sabloni">Šabloni dokumenata</a>
          <a class="footer-link" routerLink="/novi-nastavnici">Za nove nastavnike i studente</a>
          <a class="footer-link" routerLink="/literatura">Literatura i izvori</a>
        </nav>
      </div>
      <div class="container footer-bottom">
        <span>© {{ year }} Fiskultura</span>
        <span class="muted">Izrada: <a class="footer-link" href="/portfolio/">Igor Živanović</a></span>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly auth = inject(AuthService);
  protected readonly apps = PORTAL_APPS;
  protected readonly isLinkDisabled = isLinkDisabled;
  protected readonly disabledTitle = DISABLED_LINK_TITLE;
  protected readonly year = new Date().getFullYear();
}
