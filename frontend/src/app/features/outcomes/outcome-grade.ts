import { ChangeDetectionStrategy, Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { breadcrumbs, SeoService } from '../../core/seo/seo.service';
import { Icon } from '../../shared/icon/icon';
import { changesNextYear, CURRENT_YEAR, findGrade, loadPrograms, OUTCOME_GRADES, programFor, SCHOOL_YEARS, SchoolYear } from '../../content/outcomes/outcomes';

@Component({
  selector: 'app-outcome-grade',
  imports: [RouterLink, MatButtonToggleModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <a class="inline-link outcomes-back" routerLink="/ishodi">← Svi razredi</a>
        @if (grade(); as item) {
          <div class="section-head">
            <p class="eyebrow">Fizičko i zdravstveno vaspitanje</p>
            <h1>Ishodi: {{ item.title }}</h1>
          </div>

          @if (changes()) {
            <div class="page-sticky">
              <mat-button-toggle-group class="level-filter" [value]="year()" (change)="year.set($event.value)" aria-label="Školska godina">
                @for (option of years; track option) {
                  <mat-button-toggle [value]="option">{{ option }}</mat-button-toggle>
                }
              </mat-button-toggle-group>
            </div>
          }

          <dl class="outcomes-facts">
            <div>
              <dt>Fond časova {{ year() }}.</dt>
              <dd>{{ item.funds[year()] }}</dd>
            </div>
            @if (program(); as current) {
              <div>
                <dt>Program</dt>
                <dd>
                  {{ current.gazette }}{{ current.validTo ? ', važi do ' + current.validTo + '.' : current.validFrom >= '2027/28' ? ', primenjuje se od ' + current.validFrom + '.' : '' }}
                  <a class="inline-link" [href]="current.sourceUrl" target="_blank" rel="noopener">Zvanični tekst (PIS) <app-icon name="external" [size]="14" /></a>
                </dd>
              </div>
            }
          </dl>

          @if (program(); as current) {
            @if (current.verified === 'secondary') {
              <p class="outcomes-warning small">Tekst programa za ovaj razred još nismo uporedili sa originalom iz „Prosvetnog glasnika”; preuzet je iz kopije programa. Proveravamo.</p>
            }
            @if (current.goal) {
              <p class="outcomes-goal">{{ current.goal }}</p>
            }

            <h2>Ishodi</h2>
            <p class="muted">Po završetku razreda učenik će biti u stanju da:</p>
            <ol class="outcomes-list">
              @for (outcome of current.outcomes; track $index) {
                <li>{{ outcome }}</li>
              }
            </ol>

            <h2>Oblasti, teme i sadržaji</h2>
            @for (area of current.areas; track area.name) {
              <section class="outcomes-area">
                <h3>{{ area.name }}</h3>
                @for (topic of area.topics; track topic.name) {
                  <div class="outcomes-topic">
                    @if (topic.name !== area.name) {
                      <h4>
                        {{ topic.name }}
                        @if (hours(topic.hours); as count) {
                          <span class="post-category">{{ count }} čas.</span>
                        }
                      </h4>
                    }
                    @for (content of topic.contents; track $index) {
                      <p>{{ content }}</p>
                    }
                  </div>
                }
              </section>
            }
          } @else if (programs.isLoading()) {
            <p class="muted">Učitavanje programa…</p>
          }

          <nav class="outcomes-pager" aria-label="Razredi">
            @if (previous(); as prev) {
              <a class="inline-link" [routerLink]="['/ishodi', prev.slug]">← {{ prev.label }}</a>
            } @else {
              <span></span>
            }
            @if (next(); as following) {
              <a class="inline-link" [routerLink]="['/ishodi', following.slug]">{{ following.label }} →</a>
            }
          </nav>
        } @else {
          <h1>Razred nije pronađen</h1>
          <p><a class="inline-link" routerLink="/ishodi">Ishodi po razredima</a></p>
        }
      </div>
    </section>
  `,
})
export class OutcomeGrade {
  readonly razred = input.required<string>();

  readonly #seo = inject(SeoService);

  protected readonly years = SCHOOL_YEARS;
  protected readonly year = signal<SchoolYear>(CURRENT_YEAR);
  protected readonly grade = computed(() => findGrade(this.razred()));
  protected readonly changes = computed(() => {
    const grade = this.grade();
    return grade ? changesNextYear(grade) : false;
  });
  protected readonly programs = resource({
    params: () => this.grade(),
    loader: ({ params }) => loadPrograms(params),
  });
  protected readonly program = computed(() => (this.programs.hasValue() ? programFor(this.programs.value(), this.year()) : undefined));
  protected readonly previous = computed(() => OUTCOME_GRADES[OUTCOME_GRADES.findIndex((item) => item.slug === this.razred()) - 1]);
  protected readonly next = computed(() => {
    const index = OUTCOME_GRADES.findIndex((item) => item.slug === this.razred());
    return index >= 0 ? OUTCOME_GRADES[index + 1] : undefined;
  });

  constructor() {
    effect(() => {
      const grade = this.grade();
      const path = `/ishodi/${this.razred()}`;
      if (!grade) {
        this.#seo.set({ title: 'Razred nije pronađen', path, noindex: true });
        return;
      }
      this.#seo.set({
        title: `Ishodi fizičkog i zdravstvenog vaspitanja: ${grade.title}`,
        description: `Šta učenik zna i ume na kraju razreda (${grade.title}): ishodi, teme i sadržaji programa fizičkog i zdravstvenog vaspitanja i fond časova, sa linkom na zvanični tekst.`,
        path,
        jsonLd: breadcrumbs([
          { name: 'Ishodi po razredima', path: '/ishodi' },
          { name: grade.title, path },
        ]),
      });
    });
  }

  protected hours(value: string | undefined): string | null {
    return value && /^\d/.test(value) ? value : null;
  }
}
