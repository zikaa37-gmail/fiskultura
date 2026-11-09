import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { formatDate, NEWS_CATEGORY_LABELS, NewsCategory, organizationLabel } from '../../core/content/content.model';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { AdminNews, AdminOrganization, newsState, Page } from './admin.model';

type StatusFilter = '' | 'draft' | 'published' | 'scheduled';

@Component({
  selector: 'app-admin-news-list',
  imports: [FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Status</mat-label>
        <mat-select [value]="status()" (selectionChange)="setStatus($event.value)">
          <mat-option value="">Svi</mat-option>
          <mat-option value="draft">Nacrti</mat-option>
          <mat-option value="published">Objavljeno</mat-option>
          <mat-option value="scheduled">Zakazano</mat-option>
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
      <a mat-flat-button routerLink="nova">Nova vest</a>
    </div>

    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (meta(); as info) {
      <p class="muted small result-count">Ukupno: {{ info.total }}</p>
    }
    <div class="admin-rows">
      @for (item of items(); track item.id) {
        @let state = stateOf(item);
        <div class="admin-row">
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
          <div class="admin-row-actions">
            @if (item.is_visible) {
              <a mat-button [routerLink]="['/vesti', item.slug]" target="_blank">Pogledaj</a>
            }
            <button type="button" mat-button class="btn-tertiary-text" (click)="toggleFeatured(item)">{{ item.featured ? 'Ukloni isticanje' : 'Istakni' }}</button>
            <a mat-stroked-button [routerLink]="[item.id]">Izmeni</a>
            <button type="button" mat-button class="danger-text" (click)="remove(item)">Obriši</button>
          </div>
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

  protected date(value: string | null): string {
    return formatDate(value);
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
