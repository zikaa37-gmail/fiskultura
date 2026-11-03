import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PORTAL_APPS } from '../content/portal-content';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-col">
          <strong>Fiskultura</strong>
          <span class="muted">{{ 'footer.tagline' | translate }}</span>
        </div>
        <nav class="footer-col" [attr.aria-label]="'footer.apps' | translate">
          <strong>{{ 'footer.apps' | translate }}</strong>
          @for (app of apps; track app.id) {
            <a class="footer-link" [href]="app.url" target="_blank" rel="noopener">{{ app.name }}</a>
          }
        </nav>
        <nav class="footer-col" [attr.aria-label]="'footer.portal' | translate">
          <strong>{{ 'footer.portal' | translate }}</strong>
          <a class="footer-link" routerLink="/vesti">{{ 'nav.news' | translate }}</a>
          <a class="footer-link" routerLink="/udruzenja">{{ 'nav.organizations' | translate }}</a>
          <a class="footer-link" routerLink="/sportovi">{{ 'nav.sports' | translate }}</a>
        </nav>
      </div>
      <div class="container footer-bottom">
        <span>© {{ year }} Fiskultura</span>
        <span class="muted">{{ 'footer.madeBy' | translate }} <a class="footer-link" href="/portfolio/">Igor Živanović</a></span>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly apps = PORTAL_APPS;
  protected readonly year = new Date().getFullYear();
}
