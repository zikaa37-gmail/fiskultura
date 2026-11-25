import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { formatDate, NewsItem, SOURCE_TYPE_LABELS } from '../../core/content/content.model';

@Component({
  selector: 'app-news-source',
  imports: [RouterLink, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'source-box' },
  template: `
    @let item = news();
    <strong>Izvor informacije</strong>
    @if (item.organization; as organization) {
      <span>
        Organizacija:
        @if (inDialog()) {
          <a class="inline-link" [routerLink]="['/udruzenja', organization.slug]" mat-dialog-close>{{ organization.name }}</a>
        } @else {
          <a class="inline-link" [routerLink]="['/udruzenja', organization.slug]">{{ organization.name }}</a>
        }
        @if (organization.district) {
          <span class="muted"> · {{ organization.district }}{{ organization.district === 'Grad Beograd' ? '' : ' okrug' }}</span>
        }
      </span>
    }
    @if (item.source.url; as url) {
      <span>
        Preuzeto sa: {{ item.source.type ? sourceLabels[item.source.type] : 'izvor' }} ·
        <a class="inline-link" [href]="url" target="_blank" rel="noopener">pročitaj original →</a>
      </span>
    }
    @if (originalDate()) {
      <span>Objavljeno na izvoru: {{ originalDate() }}</span>
    }
    @if (note()) {
      <span class="muted small">Fiskultura prenosi kratak sažetak svojim rečima; ceo tekst je na izvoru.</span>
    }
  `,
})
export class NewsSource {
  readonly news = input.required<NewsItem>();
  readonly inDialog = input(false);
  readonly note = input(false);

  protected readonly sourceLabels = SOURCE_TYPE_LABELS;
  protected readonly originalDate = computed(() => formatDate(this.news().source.published_at));
}
