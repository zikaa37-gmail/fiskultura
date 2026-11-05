import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SPORT_GROUPS, SPORTS } from '../../content/sports-content';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-sports',
  imports: [Icon, RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Sportovi i pravila</p>
          <h1>Pravila za čas, ne za ligu</h1>
          <p class="muted">Za svaki sport: interaktivna pravila sa sličicama, kviz, kako se igra sa celim odeljenjem i slikovito PDF uputstvo.</p>
        </div>

        @for (group of groups; track group.id) {
          <div class="sport-group">
            <h2>{{ group.title }}</h2>
            <p class="muted">{{ group.description }}</p>
            <div class="module-grid">
              @for (sport of group.sports; track sport.slug) {
                <article class="module" [class]="'accent-' + sport.accent">
                  <span class="module-icon"><app-icon name="ball" [size]="26" /></span>
                  <h3>{{ sport.name }}</h3>
                  <p>{{ sport.summary }}</p>
                  <span class="status" [class.status-next]="sport.status !== 'soon'">{{ statusLabel[sport.status] }}</span>
                  @if (sport.rulesPage) {
                    <a mat-flat-button [routerLink]="sport.rulesPage">Pravila za decu i kviz</a>
                  }
                  @if (sport.externalSite) {
                    <a class="inline-link" [href]="sport.externalSite" target="_blank" rel="noopener">Sajt sporta →</a>
                  }
                  @for (source of sport.officialSources; track source.url) {
                    <a class="inline-link" [href]="source.url" target="_blank" rel="noopener">{{ source.label }} →</a>
                  }
                </article>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class Sports {
  protected readonly groups = SPORT_GROUPS.map((group) => ({ ...group, sports: SPORTS.filter((sport) => sport.group === group.id) }));
  protected readonly statusLabel = { ready: 'Dostupno', first: 'Prvo izdanje', soon: 'Uskoro' } as const;
}
