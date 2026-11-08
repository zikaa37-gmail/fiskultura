import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PORTAL_APPS } from '../content/portal-content';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-col">
          <strong>Fiskultura</strong>
          <span class="muted">Portal za fizičko vaspitanje i školski sport u Srbiji · u izradi</span>
        </div>
        <nav class="footer-col" aria-label="Aplikacije">
          <strong>Aplikacije</strong>
          @for (app of apps; track app.id) {
            <a class="footer-link" [href]="app.url" target="_blank" rel="noopener">{{ app.name }}</a>
          }
        </nav>
        <nav class="footer-col" aria-label="Portal">
          <strong>Portal</strong>
          <a class="footer-link" routerLink="/vesti">Vesti</a>
          <a class="footer-link" routerLink="/udruzenja">Udruženja</a>
          <a class="footer-link" routerLink="/propisi">Propisi</a>
          <a class="footer-link" routerLink="/pitanja">Pitanja i odgovori</a>
          <a class="footer-link" routerLink="/sportovi">Sportovi i pravila</a>
          <a class="footer-link" routerLink="/ishodi">Ishodi po razredima</a>
          <a class="footer-link" routerLink="/novi-nastavnici">Za nove nastavnike i studente</a>
          <a class="footer-link" routerLink="/literatura">Literatura i izvori</a>
          <a class="footer-link" routerLink="/obavestenja">Obaveštenja mejlom</a>
          <a class="footer-link" routerLink="/kontakt">Kontakt i uredništvo</a>
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
  protected readonly apps = PORTAL_APPS;
  protected readonly year = new Date().getFullYear();
}
