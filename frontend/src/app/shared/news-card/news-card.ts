import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate, NEWS_CATEGORY_LABELS, NewsItem, organizationLabel, SOURCE_TYPE_LABELS } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { Icon } from '../icon/icon';
import { NewsDialogService } from '../news-dialog/news-dialog';

@Component({
  selector: 'app-news-card',
  imports: [RouterLink, MatButtonModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'post', '[class.post-featured]': 'news().featured' },
  template: `
    @let item = news();
    <span class="post-meta">
      @if (item.featured) {
        <span class="featured-label"><app-icon name="star" [size]="14" /> Istaknuto</span>
      }
      @if (date()) {
        <span>{{ date() }}</span>
      }
      <span class="post-category">{{ categoryLabels[item.category] }}</span>
    </span>
    <h3><a class="post-title" [attr.href]="'/vesti/' + item.slug" (click)="open($event)">{{ item.title }}</a></h3>
    <p class="muted">{{ item.summary }}</p>
    <div class="source-row">
      @if (item.organization; as organization) {
        <a class="source-chip" [routerLink]="['/udruzenja', organization.slug]" [title]="organization.name">{{ label(organization) }}</a>
      }
      @if (item.source.url; as url) {
        <a class="inline-link small" [href]="url" target="_blank" rel="noopener">
          Preuzeto sa: {{ item.source.type ? sourceLabels[item.source.type] : 'izvor' }} →
        </a>
      }
      @if (item.featured && auth.isEditor()) {
        <button type="button" mat-button class="btn-tertiary-text" [disabled]="busy()" (click)="unfeature()">Ukloni isticanje</button>
      }
    </div>
  `,
})
export class NewsCard {
  readonly news = input.required<NewsItem>();
  readonly changed = output<void>();

  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #dialog = inject(NewsDialogService);

  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly sourceLabels = SOURCE_TYPE_LABELS;
  protected readonly label = organizationLabel;
  protected readonly date = computed(() => formatDate(this.news().source.published_at ?? this.news().published_at));
  protected readonly busy = signal(false);

  protected open(event: MouseEvent): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    this.#dialog.open(this.news().slug);
  }

  protected unfeature(): void {
    this.busy.set(true);
    this.#http.patch(`${API_URL}/admin/news/${this.news().id}/featured`, { featured: false }).subscribe({
      next: () => {
        this.#notifications.show('Vest više nije istaknuta.');
        this.busy.set(false);
        this.changed.emit();
      },
      error: (error) => {
        this.#notifications.show(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }
}
