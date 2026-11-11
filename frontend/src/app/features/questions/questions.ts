import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { EXPANSION_IMPORTS } from '../../../theme/ui/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { formatDate } from '../../core/content/content.model';
import { API_URL } from '../../core/http/api';
import { debouncedSearch, searchDraft } from '../../shared/list-filters/search-input';
import { ScrollArea } from '../../shared/scroll-area/scroll-area';
import { LEGAL_DISCLAIMER, Question, QUESTION_CATEGORY_LABELS, QuestionCategory } from './question.model';

@Component({
  selector: 'app-questions',
  imports: [FormsModule, RouterLink, BUTTON_IMPORTS, EXPANSION_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, ScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .question-list {
      display: grid;
      gap: 12px;
    }
    .question-card {
      display: grid;
      gap: 6px;
      padding: 16px 18px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    .question-card h2 {
      font-size: 19px;
      line-height: 1.3;
    }
    .question-card h2 a {
      color: inherit;
      text-decoration: none;
    }
    .question-card h2 a:hover {
      color: var(--color-primary);
    }
    .ask-box {
      display: grid;
      gap: 8px;
      justify-items: start;
      margin-bottom: 20px;
    }
    .ask-box .mat-mdc-button-base {
      min-height: 44px;
    }
  `,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Pitanja i odgovori</p>
          <h1>Administracija i propisi u praksi</h1>
          <p class="muted">Norma, ocenjivanje, oslobađanje od nastave, bezbednost na času, takmičenja. Svaki odgovor ima propis na koji se poziva i datum na koji važi.</p>
        </div>

        <div class="ask-box">
          <a mat-flat-button routerLink="/pitanja/postavi">Postavi pitanje</a>
          <p class="muted small">{{ disclaimer }}</p>
        </div>

        <div class="filters">
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>Oblast</mat-panel-title>
              <mat-panel-description>{{ category() ? categoryLabels[category()!] : 'Sve oblasti' }}</mat-panel-description>
            </mat-expansion-panel-header>
            <div class="chip-row" role="group" aria-label="Oblast pitanja">
              <button type="button" [matButton]="!category() ? 'filled' : 'outlined'" [theme]="!category() ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="!category()" (click)="setCategory(null)">Sve</button>
              @for (option of categories; track option) {
                <button type="button" [matButton]="category() === option ? 'filled' : 'outlined'" [theme]="category() === option ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="category() === option" (click)="setCategory(option)">
                  {{ categoryLabels[option] }}
                </button>
              }
            </div>
          </mat-expansion-panel>
          <form class="search-form" (ngSubmit)="search()">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Pretraga pitanja i odgovora</mat-label>
              <input matInput name="search" [ngModel]="searchText()" (ngModelChange)="typeSearch($event)" />
            </mat-form-field>
            <button type="submit" mat-stroked-button>Traži</button>
          </form>
        </div>

        @if (resource.isLoading()) {
          <mat-progress-bar mode="indeterminate" />
        }
        @if (resource.error()) {
          <div class="empty-state"><h3>Pitanja trenutno nisu dostupna</h3></div>
        } @else {
          <p class="muted small result-count mb-2">Pronađeno: {{ items().length }}</p>
          <app-scroll-area label="Odgovori" maxHeight="max(320px, calc(100dvh - 240px))" [resetOn]="[category(), pretraga()]">
            <div class="question-list">
              @for (item of items(); track item.id) {
                <article class="question-card">
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
        }
      </div>
    </section>
  `,
})
export class Questions {
  readonly oblast = input<string>();
  readonly pretraga = input<string>();

  readonly #router = inject(Router);

  protected readonly disclaimer = LEGAL_DISCLAIMER;
  protected readonly categoryLabels = QUESTION_CATEGORY_LABELS;
  protected readonly categories = Object.keys(QUESTION_CATEGORY_LABELS) as QuestionCategory[];
  protected readonly category = computed(() => (this.categories.includes(this.oblast() as QuestionCategory) ? (this.oblast() as QuestionCategory) : null));
  protected readonly searchText = searchDraft(() => this.pretraga() ?? '');
  readonly #search = debouncedSearch((value) => value !== (this.pretraga() ?? '') && this.#navigate({ pretraga: value || null }, true));

  protected readonly resource = httpResource<Question[]>(() => {
    const params = new URLSearchParams();
    if (this.category()) params.set('category', this.category()!);
    if (this.pretraga()) params.set('q', this.pretraga()!);
    const query = params.toString();
    return `${API_URL}/questions${query ? `?${query}` : ''}`;
  });
  protected readonly items = computed(() => (this.resource.hasValue() ? this.resource.value() : []));

  protected setCategory(category: QuestionCategory | null): void {
    this.#navigate({ oblast: category === this.category() ? null : category });
  }

  protected typeSearch(value: string): void {
    this.searchText.set(value);
    this.#search.schedule(value);
  }

  protected search(): void {
    this.#search.flush(this.searchText());
  }

  protected date(value: string): string {
    return formatDate(value);
  }

  #navigate(params: Record<string, string | null>, replaceUrl = false): void {
    this.#router.navigate([], { queryParams: params, queryParamsHandling: 'merge', replaceUrl });
  }
}
