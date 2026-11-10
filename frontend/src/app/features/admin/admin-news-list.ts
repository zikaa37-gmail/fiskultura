import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { formatDate, NEWS_CATEGORY_LABELS, NewsCategory, organizationLabel } from '../../core/content/content.model';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ListHeader } from '../../shared/list-header/list-header';
import { AdminNews, AdminOrganization, newsState, Page } from './admin.model';

type StatusFilter = '' | 'draft' | 'published' | 'scheduled';

type NewsAction = 'view' | 'feature' | 'edit' | 'remove';

@Component({
  selector: 'app-admin-news-list',
  imports: [FormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, MatSelectModule, OptionsMenu, FilterPanel, ListHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-filter-panel [summary]="filterSummary()">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Status</mat-label>
        <mat-select [value]="status()" (selectionChange)="setStatus($event.value)">
          <mat-option value="">Svi</mat-option>
          @for (option of statusOptions; track option) {
            <mat-option [value]="option">{{ statusLabels[option] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Kategorija</mat-label>
        <mat-select [value]="category()" (selectionChange)="setCategory($event.value)">
          <mat-option value="">Sve</mat-option>
          @for (option of categories; track option) {
            <mat-option [value]="option">{{ categoryLabels[option] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Organizacija</mat-label>
        <mat-select [value]="organizationId()" (selectionChange)="setOrganization($event.value)">
          <mat-option [value]="null">Sve</mat-option>
          @for (item of organizations(); track item.id) {
            <mat-option [value]="item.id">{{ label(item) }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <form class="search-form" (ngSubmit)="applySearch()">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Pretraga</mat-label>
          <input matInput name="search" [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" />
        </mat-form-field>
      </form>
    </app-filter-panel>

    <app-list-header [count]="meta()?.total ?? null">
      <a mat-flat-button routerLink="nova">Nova vest</a>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of items(); track item.id) {
        @let state = stateOf(item);
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="'state-' + state.tone">{{ state.label }}</span>
              <span>{{ date(item.published_at) }}</span>
              <span>{{ categoryLabels[item.category] }}</span>
              @if (item.organization; as organization) {
                <span>· {{ label(organization) }}</span>
              }
              @if (item.featured) {
                <span class="state-chip state-ok">Istaknuto</span>
              }
            </span>
            <a class="post-title" [routerLink]="[item.id]">{{ item.title }}</a>
          </div>
          <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.title" (selected)="onAction(item, $event)" />
        </div>
      } @empty {
        @if (!resource.isLoading()) {
          <div class="empty-state"><p class="muted">Nema vesti za izabrane filtere.</p></div>
        }
      }
    </div>
    @if (meta(); as info) {
      @if (info.last_page > 1) {
        <nav class="pager" aria-label="Stranice">
          <button type="button" mat-stroked-button [disabled]="info.page <= 1" (click)="page.set(info.page - 1)">← Prethodna</button>
          <span class="muted">Strana {{ info.page }} od {{ info.last_page }}</span>
          <button type="button" mat-stroked-button [disabled]="info.page >= info.last_page" (click)="page.set(info.page + 1)">Sledeća →</button>
        </nav>
      }
    }
  `,
})
export class AdminNewsList {
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);

  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly categories = Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[];
  protected readonly label = organizationLabel;
  protected readonly stateOf = newsState;
  protected readonly statusLabels: Record<Exclude<StatusFilter, ''>, string> = { draft: 'Nacrti', published: 'Objavljeno', scheduled: 'Zakazano' };
  protected readonly statusOptions = Object.keys(this.statusLabels) as Exclude<StatusFilter, ''>[];

  protected readonly status = signal<StatusFilter>('');
  protected readonly category = signal<NewsCategory | ''>('');
  protected readonly organizationId = signal<number | null>(null);
  protected readonly search = signal('');
  protected readonly searchText = linkedSignal(() => this.search());
  protected readonly page = signal(1);

  protected readonly resource = httpResource<Page<AdminNews>>(() => ({
    url: `${API_URL}/admin/news/list`,
    method: 'POST',
    body: {
      status: this.status() || null,
      category: this.category() || null,
      organization_id: this.organizationId(),
      search: this.search() || null,
      page: this.page(),
      per_page: 25,
    },
  }));
  readonly #organizationsResource = httpResource<AdminOrganization[]>(() => `${API_URL}/admin/organizations`);

  readonly #lastPage = linkedSignal<Page<AdminNews> | undefined, Page<AdminNews> | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#lastPage()?.data ?? []);
  protected readonly meta = computed(() => this.#lastPage()?.meta ?? null);
  protected readonly organizations = computed(() =>
    (this.#organizationsResource.hasValue() ? this.#organizationsResource.value() : []).slice().sort((a, b) => this.label(a).localeCompare(this.label(b), 'sr')),
  );

  protected readonly filterSummary = computed(() => {
    const status = this.status();
    const category = this.category();
    const organization = this.organizations().find((item) => item.id === this.organizationId());
    const parts = [status ? this.statusLabels[status] : '', category ? this.categoryLabels[category] : '', organization ? this.label(organization) : '', this.search() ? `„${this.search()}”` : ''];
    return parts.filter(Boolean).join(' · ') || 'Sve vesti';
  });

  protected date(value: string | null): string {
    return formatDate(value);
  }

  protected menuFor(item: AdminNews): MenuOption<NewsAction>[] {
    return [
      ...(item.is_visible ? [{ value: 'view' as const, label: 'Pogledaj', icon: 'eye' as const, link: ['/vesti', item.slug], newTab: true }] : []),
      { value: 'feature', label: item.featured ? 'Ukloni isticanje' : 'Istakni', icon: 'star' },
      { value: 'edit', label: 'Izmeni', icon: 'edit', link: ['/admin/vesti', item.id] },
      { value: 'remove', label: 'Obriši', icon: 'trash', danger: true },
    ];
  }

  protected onAction(item: AdminNews, action: NewsAction): void {
    if (action === 'feature') {
      this.toggleFeatured(item);
    } else if (action === 'remove') {
      this.remove(item);
    }
  }

  protected toggleFeatured(item: AdminNews): void {
    this.#http.patch<AdminNews>(`${API_URL}/admin/news/${item.id}/featured`, { featured: !item.featured }).subscribe({
      next: (saved) => {
        this.#notifications.show(saved.featured ? 'Vest je istaknuta.' : 'Vest više nije istaknuta.');
        this.resource.reload();
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  protected setStatus(value: StatusFilter): void {
    this.status.set(value);
    this.page.set(1);
  }

  protected setCategory(value: NewsCategory | ''): void {
    this.category.set(value);
    this.page.set(1);
  }

  protected setOrganization(value: number | null): void {
    this.organizationId.set(value);
    this.page.set(1);
  }

  protected applySearch(): void {
    this.search.set(this.searchText().trim());
    this.page.set(1);
  }

  protected remove(item: AdminNews): void {
    this.#confirm.confirm({ title: 'Brisanje vesti', message: `Obrisati „${item.title}“? Ovo ne može da se vrati.`, confirmLabel: 'Obriši' }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.#http.delete(`${API_URL}/admin/news/${item.id}`).subscribe({
        next: () => {
          this.#notifications.show('Vest je obrisana.');
          this.resource.reload();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
    });
  }
}
