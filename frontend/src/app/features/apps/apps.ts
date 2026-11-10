import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { Icon } from '../../shared/icon/icon';
import { PORTAL_APPS } from '../../content/portal-content';

@Component({
  selector: 'app-apps',
  imports: [BUTTON_IMPORTS, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Aplikacije</p>
          <h1>Aplikacije za nastavnike</h1>
          <p class="muted">Alati koje koristimo u sali i zbornici. Svaki radi samostalno, sa svojim nalogom.</p>
        </div>
        <div class="module-grid">
          @for (app of apps; track app.id) {
            <article class="module" [class]="'accent-' + app.accent">
              <span class="module-icon"><app-icon [name]="app.icon" [size]="26" /></span>
              <h3>{{ app.name }}</h3>
              <p>{{ app.description }}</p>
              <span class="muted small">{{ app.owner }}</span>
              <a mat-flat-button [href]="app.url" target="_blank" rel="noopener">
                Otvori <app-icon name="external" [size]="18" />
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class Apps {
  protected readonly apps = PORTAL_APPS;
}
