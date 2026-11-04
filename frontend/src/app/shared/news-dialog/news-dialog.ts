import { ChangeDetectionStrategy, Component, computed, inject, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../core/http/api';
import { formatDate, NEWS_CATEGORY_LABELS, NewsDetail, SOURCE_TYPE_LABELS } from '../../core/content/content.model';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-news-dialog',
  imports: [RouterLink, MatDialogModule, MatButtonModule, MatProgressBarModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'news-dialog' },
  template: `
    <button type="button" class="dialog-close" mat-dialog-close aria-label="Zatvori" title="Zatvori"><app-icon name="close" /></button>
    <mat-dialog-content>
      @if (resource.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (resource.error()) {
        <p class="form-error">Vest nije pronađena.</p>
      } @else if (news(); as item) {
        <article class="article-body dialog-article">
          <span class="post-meta">
            @if (date()) {
              <span>{{ date() }}</span>
            }
            <span class="post-category">{{ categoryLabels[item.category] }}</span>
          </span>
          <h2 class="dialog-title">{{ item.title }}</h2>
          <p class="lead">{{ item.summary }}</p>
          @if (item.body) {
            <div class="article-text">{{ item.body }}</div>
          }
          <aside class="source-box">
            <strong>Izvor informacije</strong>
            @if (item.organization; as organization) {
              <span>
                Organizacija:
                <a class="inline-link" [routerLink]="['/udruzenja', organization.slug]" mat-dialog-close>{{ organization.name }}</a>
              </span>
            }
            @if (item.source.url; as url) {
              <span>
                Preuzeto sa: {{ item.source.type ? sourceLabels[item.source.type] : 'izvor' }} ·
                <a class="inline-link" [href]="url" target="_blank" rel="noopener">pročitaj original →</a>
              </span>
            }
          </aside>
          @if (item.related.length) {
            <div class="dialog-related">
              <strong>Povezane objave</strong>
              @for (related of item.related; track related.id) {
                <button type="button" class="related-link" (click)="slug.set(related.slug)">{{ related.title }}</button>
              }
            </div>
          }
        </article>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (news(); as item) {
        <a mat-button [routerLink]="['/vesti', item.slug]" mat-dialog-close>Stalni link</a>
      }
      <button type="button" mat-flat-button mat-dialog-close>Zatvori</button>
    </mat-dialog-actions>
  `,
})
export class NewsDialog {
  protected readonly slug = signal(inject<{ slug: string }>(MAT_DIALOG_DATA).slug);
  protected readonly resource = httpResource<NewsDetail>(() => `${API_URL}/news/${encodeURIComponent(this.slug())}`);
  protected readonly news = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly date = computed(() => formatDate(this.news()?.source.published_at ?? null));
  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly sourceLabels = SOURCE_TYPE_LABELS;
}

@Injectable({ providedIn: 'root' })
export class NewsDialogService {
  readonly #dialog = inject(MatDialog);

  open(slug: string): MatDialogRef<NewsDialog> {
    return this.#dialog.open(NewsDialog, {
      data: { slug },
      width: '760px',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      panelClass: 'news-dialog-panel',
      autoFocus: false,
    });
  }
}
