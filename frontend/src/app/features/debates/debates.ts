import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { formatDate } from '../../core/content/content.model';
import { API_URL } from '../../core/http/api';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { Icon } from '../../shared/icon/icon';
import { ScrollArea } from '../../shared/scroll-area/scroll-area';
import { QaTabs } from '../questions/qa-tabs';
import { Debate, DEBATE_STATUS_LABELS } from './debate.model';
import { debateShare } from '../../shared/social-share/share-data';
import { ShareMenu } from '../../shared/social-share/share-menu';

@Component({
  selector: 'app-debates',
  imports: [RouterLink, MatProgressBarModule, ListFilters, ListHeader, Icon, QaTabs, ScrollArea, ShareMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section qa-section">
      <div class="container">
        <app-qa-tabs active="debate" (proposed)="resource.reload()">
          <app-list-filters [fields]="fields" [values]="filters.values()" emptySummary="Sve teme" (filterChange)="filters.set($event)" (clearAll)="filters.clear()" />
          <p class="muted small mb-2">
            Teme za razgovor kolega. Svako može da pita, kritikuje, konstatuje i predloži, i da lajkuje tuđe priloge. Moderator teme
            vodi razgovor, a sažetak rasprave pravi uz pomoć AI-ja i objavljuje ga tek kad ga pročita.
          </p>

          @if (proposals().length) {
            <section class="debate-proposals mb-4" aria-labelledby="my-proposals">
              <h2 id="my-proposals" class="mb-2">Tvoji predlozi tema</h2>
              @for (item of proposals(); track item.id) {
                <p class="small">
                  <span class="state-chip" [class]="item.status === 'rejected' ? 'state-muted' : 'state-warn'">{{ statusLabels[item.status] }}</span>
                  {{ item.title }}
                </p>
              }
            </section>
          }

          @if (resource.isLoading()) {
            <mat-progress-bar mode="indeterminate" />
          }
          @if (resource.error()) {
            <div class="empty-state"><h3>Debate trenutno nisu dostupne</h3></div>
          } @else {
            <app-list-header [count]="items().length" />
            <app-scroll-area label="Teme" [fill]="true" [resetOn]="filters.values()">
            <div class="qa-list">
              @for (item of items(); track item.id) {
                <article class="qa-card">
                  <div class="post-head">
                    <span class="post-meta">
                      <span class="state-chip" [class]="item.status === 'open' ? 'state-ok' : 'state-muted'">{{ statusLabels[item.status] }}</span>
                      <span>{{ item.posts_count }} {{ item.posts_count === 1 ? 'prilog' : 'priloga' }}</span>
                      @if (item.last_post_at) {
                        <span>poslednji {{ date(item.last_post_at) }}</span>
                      }
                      @if (item.has_summary) {
                        <span class="debate-badge"><app-icon name="checklist" [size]="16" /> sažetak</span>
                      }
                    </span>
                    <app-share-menu [data]="share(item)" />
                  </div>
                  <h2><a [routerLink]="['/debate', item.slug]">{{ item.title }}</a></h2>
                  @if (item.description) {
                    <p class="muted debate-excerpt">{{ item.description }}</p>
                  }
                  <span class="small muted">Moderator: {{ item.moderator?.name ?? 'još nije dodeljen' }}</span>
                </article>
              } @empty {
                @if (!resource.isLoading()) {
                  <div class="empty-state">
                    <h3>Nema tema za ovaj izbor</h3>
                    <p class="muted">Predloži temu o kojoj bi kolege trebalo da razgovaraju.</p>
                  </div>
                }
              }
            </div>
            </app-scroll-area>
          }
        </app-qa-tabs>
      </div>
    </section>
  `,
  styles: `
    .debate-excerpt {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .debate-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .debate-proposals {
      padding: 12px 16px;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius);
    }
    .debate-proposals h2 {
      font-size: 16px;
    }
  `,
})
export class Debates {
  protected readonly share = debateShare;
  protected readonly statusLabels = DEBATE_STATUS_LABELS;
  protected readonly filters = queryFilters(['status', 'pretraga']);
  protected readonly fields: FilterField[] = [
    {
      key: 'status',
      label: 'Status',
      allLabel: 'Sve teme',
      options: [
        { value: 'open', label: 'Otvorene' },
        { value: 'closed', label: 'Zatvorene' },
      ],
    },
    { key: 'pretraga', label: 'Pretraga tema', type: 'search' },
  ];

  protected readonly resource = httpResource<{ data: Debate[]; proposals: Debate[] }>(() => {
    const { status, pretraga } = this.filters.values();
    const params = new URLSearchParams();
    if (status === 'open' || status === 'closed') params.set('status', status);
    if (pretraga) params.set('q', pretraga);
    const query = params.toString();
    return `${API_URL}/debates${query ? `?${query}` : ''}`;
  });
  protected readonly items = computed(() => (this.resource.hasValue() ? this.resource.value().data : []));
  protected readonly proposals = computed(() => (this.resource.hasValue() ? this.resource.value().proposals : []));

  protected date(value: string): string {
    return formatDate(value);
  }
}
