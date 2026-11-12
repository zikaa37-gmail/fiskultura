import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { formatDate } from '../../core/content/content.model';
import { API_URL } from '../../core/http/api';
import { FilterChange, FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { Pagination } from '../../shared/pagination/pagination';
import { ScrollArea } from '../../shared/scroll-area/scroll-area';
import { QaTabs } from './qa-tabs';
import { LEGAL_DISCLAIMER, Question, QUESTION_CATEGORY_LABELS, QuestionCategory } from './question.model';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-questions',
  imports: [RouterLink, MatProgressBarModule, ListFilters, ListHeader, ScrollArea, Pagination, QaTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section qa-section">
      <div class="container">
        <app-qa-tabs active="pitanja">
          <app-list-filters [fields]="fields" [values]="filterValues()" emptySummary="Sve oblasti" (filterChange)="setFilter($event)" (clearAll)="clearFilters()" />
          <p class="muted small mb-2">{{ disclaimer }}</p>

          @if (resource.isLoading()) {
            <mat-progress-bar mode="indeterminate" />
          }
          @if (resource.error()) {
            <div class="empty-state"><h3>Pitanja trenutno nisu dostupna</h3></div>
          } @else {
            <app-list-header [count]="items().length" label="Pronađeno" />
            <app-scroll-area label="Odgovori" [fill]="true" [minHeight]="560" [resetOn]="[category(), pretraga(), page()]">
              <div class="qa-list">
                @for (item of pageItems(); track item.id) {
                  <article class="qa-card">
                    <span class="post-meta">
                      <span class="post-category">{{ categoryLabels[item.category] }}</span>
                      @if (item.valid_on) {
                        <span>važi na dan {{ date(item.valid_on) }}</span>
                      }
                    </span>
                    <h2><a [routerLink]="['/pitanja', item.slug]">{{ item.title }}</a></h2>
                    <p class="muted">{{ item.excerpt }}</p>
                    <a class="inline-link" [routerLink]="['/pitanja', item.slug]">Ceo odgovor →</a>
                  </article>
                } @empty {
                  @if (!resource.isLoading()) {
                    <div class="empty-state">
                      <h3>Nema odgovora za ovaj izbor</h3>
                      <p class="muted">Postavite pitanje — urednik odgovara i objavljuje odgovor bez vašeg imena.</p>
                    </div>
                  }
                }
              </div>
            </app-scroll-area>
            @if (lastPage() > 1) {
              <app-pagination [page]="page()" [lastPage]="lastPage()" (pageChange)="goToPage($event)" />
            }
          }
        </app-qa-tabs>
      </div>
    </section>
  `,
})
export class Questions {
  readonly oblast = input<string>();
  readonly pretraga = input<string>();
  readonly strana = input<string>();

  readonly #router = inject(Router);

  protected readonly disclaimer = LEGAL_DISCLAIMER;
  protected readonly categoryLabels = QUESTION_CATEGORY_LABELS;
  protected readonly categories = Object.keys(QUESTION_CATEGORY_LABELS) as QuestionCategory[];
  protected readonly fields: FilterField[] = [
    { key: 'oblast', label: 'Oblast', allLabel: 'Sve oblasti', options: this.categories.map((value) => ({ value, label: QUESTION_CATEGORY_LABELS[value] })) },
    { key: 'pretraga', label: 'Pretraga pitanja i odgovora', type: 'search' },
  ];
  protected readonly category = computed(() => (this.categories.includes(this.oblast() as QuestionCategory) ? (this.oblast() as QuestionCategory) : null));
  protected readonly filterValues = computed(() => ({ oblast: this.category() ?? '', pretraga: this.pretraga() ?? '' }));

  protected readonly resource = httpResource<Question[]>(() => {
    const params = new URLSearchParams();
    if (this.category()) params.set('category', this.category()!);
    if (this.pretraga()) params.set('q', this.pretraga()!);
    const query = params.toString();
    return `${API_URL}/questions${query ? `?${query}` : ''}`;
  });
  protected readonly items = computed(() => (this.resource.hasValue() ? this.resource.value() : []));
  protected readonly lastPage = computed(() => Math.max(1, Math.ceil(this.items().length / PAGE_SIZE)));
  protected readonly page = computed(() => Math.min(this.lastPage(), Math.max(1, Number(this.strana()) || 1)));
  protected readonly pageItems = computed(() => this.items().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE));

  protected setFilter(change: FilterChange): void {
    this.#router.navigate([], { queryParams: { [change.key]: change.value || null, strana: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected goToPage(page: number): void {
    this.#router.navigate([], { queryParams: { strana: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected clearFilters(): void {
    this.#router.navigate([], { queryParams: {} });
  }

  protected date(value: string): string {
    return formatDate(value);
  }
}
