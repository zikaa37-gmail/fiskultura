import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { Icon } from '../icon/icon';

export function pageItems(page: number, lastPage: number): number[] {
  const wanted = new Set([1, lastPage, page - 1, page, page + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b);
  const items: number[] = [];
  for (const p of pages) {
    const previous = items.at(-1);
    if (previous !== undefined && p - previous === 2) {
      items.push(p - 1);
    } else if (previous !== undefined && p - previous > 2) {
      items.push(0);
    }
    items.push(p);
  }
  return items;
}

@Component({
  selector: 'app-pagination',
  imports: [BUTTON_IMPORTS, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lastPage() > 1) {
      <nav class="pagination" [attr.aria-label]="label()">
        <button type="button" mat-stroked-button theme="tertiary" class="pagination-btn" [disabled]="page() <= 1" [attr.aria-label]="previousLabel()" [title]="previousLabel()" (click)="go(page() - 1)">
          <app-icon name="chevron-left" [size]="20" />
        </button>
        <span class="pagination-compact" aria-live="polite">Strana {{ page() }} / {{ lastPage() }}</span>
        <ul class="pagination-pages">
          @for (item of items(); track $index) {
            <li>
              @if (item === 0) {
                <span class="pagination-gap" aria-hidden="true">…</span>
              } @else if (item === page()) {
                <button type="button" mat-flat-button class="pagination-btn" aria-current="page" [attr.aria-label]="'Strana ' + item">{{ item }}</button>
              } @else {
                <button type="button" mat-stroked-button theme="tertiary" class="pagination-btn" [attr.aria-label]="'Strana ' + item" (click)="go(item)">{{ item }}</button>
              }
            </li>
          }
        </ul>
        <button type="button" mat-stroked-button theme="tertiary" class="pagination-btn" [disabled]="page() >= lastPage()" [attr.aria-label]="nextLabel()" [title]="nextLabel()" (click)="go(page() + 1)">
          <app-icon name="chevron-right" [size]="20" />
        </button>
      </nav>
    }
  `,
  styles: `
    :host {
      display: block;
      margin-top: 24px;
    }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }
    .pagination .pagination-btn {
      min-width: 44px;
      width: auto;
      padding: 0 10px;
      font-variant-numeric: tabular-nums;
    }
    .pagination-btn app-icon {
      display: block;
    }
    .pagination-compact {
      color: var(--color-muted);
      font-size: 14px;
      font-variant-numeric: tabular-nums;
    }
    .pagination-pages {
      display: none;
      align-items: center;
      gap: 4px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .pagination-gap {
      display: inline-grid;
      place-items: center;
      width: 24px;
      color: var(--color-muted);
    }
    @media (min-width: 600px) {
      .pagination {
        justify-content: center;
      }
      .pagination-compact {
        display: none;
      }
      .pagination-pages {
        display: flex;
      }
    }
  `,
})
export class Pagination {
  readonly page = model.required<number>();
  readonly lastPage = input.required<number>();
  readonly label = input('Stranice');
  readonly previousLabel = input('Prethodna strana');
  readonly nextLabel = input('Sledeća strana');

  protected readonly items = computed(() => pageItems(this.page(), this.lastPage()));

  protected go(page: number): void {
    if (page >= 1 && page <= this.lastPage() && page !== this.page()) {
      this.page.set(page);
    }
  }
}
