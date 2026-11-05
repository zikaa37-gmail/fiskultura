import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject } from '@angular/core';
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
                    <a mat-flat-button [routerLink]="sport.rulesPage">{{ sport.pageLabel ?? 'Pravila za decu i kviz' }}</a>
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
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const host = this.#host.nativeElement;
      let width = -1;
      const equalize = () => {
        if (host.clientWidth === width) {
          return;
        }
        width = host.clientWidth;
        host.style.removeProperty('--sport-card-height');
        if (window.matchMedia('(min-width: 640px)').matches) {
          const tallest = Math.max(...[...host.querySelectorAll<HTMLElement>('.module')].map((card) => card.offsetHeight));
          host.style.setProperty('--sport-card-height', `${tallest}px`);
        }
      };
      equalize();
      window.addEventListener('resize', equalize);
      destroyRef.onDestroy(() => window.removeEventListener('resize', equalize));
    });
  }

  protected readonly groups = groupSports();
  protected readonly statusLabel = { ready: 'Dostupno', first: 'Prvo izdanje', soon: 'Uskoro' } as const;
}

function groupSports() {
  const groups = SPORT_GROUPS.map((group) => ({ ...group, sports: SPORTS.filter((sport) => sport.group === group.id) })).filter((group) => group.sports.length);
  const singles = groups.filter((group) => group.sports.length === 1);
  if (singles.length < 2) {
    return groups;
  }
  const others = {
    id: 'others',
    title: 'Ostale oblasti programa',
    description: singles.map((group) => group.title).join(', ') + '.',
    sports: singles.flatMap((group) => group.sports),
  };
  return [...groups.filter((group) => group.sports.length > 1), others];
}
