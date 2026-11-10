import { ChangeDetectionStrategy, Component, computed, inject, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../core/http/api';
import { formatDate, NEWS_CATEGORY_LABELS, NewsDetail, SOURCE_TYPE_LABELS } from '../../core/content/content.model';
import { DialogShell } from '../dialog-shell/dialog-shell';

@Component({
  selector: 'app-news-dialog',
  imports: [RouterLink, MatDialogModule, BUTTON_IMPORTS, MatProgressBarModule, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="news()?.title ?? (resource.error() ? 'Vest nije pronađena' : 'Učitavanje…')">
      @if (news(); as item) {
        <span class="post-meta" dialogMeta>
          @if (date()) {
            <span>{{ date() }}</span>
          }
          <span class="post-category">{{ categoryLabels[item.category] }}</span>
        </span>
      }

      @if (resource.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (news(); as item) {
        <div class="dialog-article">
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
        </div>
      }

      <ng-container dialogActions>
        @if (news(); as item) {
          <a mat-button [routerLink]="['/vesti', item.slug]" mat-dialog-close>Stalni link</a>
        }
        <button type="button" mat-flat-button mat-dialog-close>Zatvori</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class NewsDialog {
  protected readonly slug = signal(inject<{ slug: string }>(MAT_DIALOG_DATA).slug);
  protected readonly resource = httpResource<NewsDetail>(() => `${API_URL}/news/${encodeURIComponent(this.slug())}`);
  protected readonly news = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly date = computed(() => formatDate(this.news()?.source.published_at ?? this.news()?.published_at ?? null));
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
      panelClass: ['app-dialog-panel', 'news-dialog-panel'],
      autoFocus: false,
    });
  }
}
