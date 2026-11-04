import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { OrgLinks } from '../../shared/org-links/org-links';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../core/http/api';
import { formatDate, ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS, OrganizationDetail as OrganizationDetailModel } from '../../core/content/content.model';
import { NewsCard } from '../../shared/news-card/news-card';

@Component({
  selector: 'app-organization-detail',
  imports: [RouterLink, MatButtonModule, MatProgressBarModule, NewsCard, OrgLinks],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container article">
        <a class="inline-link small" routerLink="/udruzenja">← Sva udruženja</a>
        @if (resource.isLoading()) {
          <mat-progress-bar mode="indeterminate" />
        } @else if (resource.error()) {
          <div class="empty-state">
            <h1>Organizacija nije pronađena</h1>
            <a mat-flat-button routerLink="/udruzenja">Sva udruženja</a>
          </div>
        } @else if (organization(); as item) {
          <div class="article-body">
            <span class="status" [class.status-next]="item.status === 'aktivno'">{{ typeLabels[item.type] }} · {{ levelLabels[item.level] }}</span>
            <h1>
              {{ item.name }}
              @if (item.short_name) {
                <span class="muted">({{ item.short_name }})</span>
              }
            </h1>
            @if (item.city) {
              <p class="muted">{{ item.city }}</p>
            }
            @if (item.description) {
              <p class="lead">{{ item.description }}</p>
            }
            @if (item.parent; as parent) {
              <p>Član krovnog udruženja <a class="inline-link" [routerLink]="['/udruzenja', parent.slug]">{{ parent.name }}</a></p>
            }
            <app-org-links [organization]="item" [showNews]="false" />
            @if (lastActivity()) {
              <p class="muted small">Poslednja uočena aktivnost: {{ lastActivity() }}</p>
            }
          </div>

          @if (item.members.length) {
            <div class="org-section">
              <h2>Članice <span class="muted">({{ item.members.length }})</span></h2>
              <ul class="member-list">
                @for (member of item.members; track member.slug) {
                  <li>
                    <a class="inline-link" [routerLink]="['/udruzenja', member.slug]">{{ member.name }}</a>
                  </li>
                }
              </ul>
            </div>
          }

          <div class="org-section">
            <h2>Objave <span class="muted">({{ item.news_count ?? 0 }})</span></h2>
            <div class="post-list">
              @for (news of item.news; track news.id) {
                <app-news-card [news]="news" />
              } @empty {
                <div class="empty-state">
                  <p class="muted">Još nismo preneli objave ove organizacije. Ako ih pratite, pošaljite nam link.</p>
                </div>
              }
            </div>
            @if ((item.news_count ?? 0) > item.news.length) {
              <a mat-stroked-button [routerLink]="['/vesti']" [queryParams]="{ udruzenje: item.slug }">Sve objave ove organizacije</a>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class OrganizationDetail {
  readonly slug = input.required<string>();

  readonly #title = inject(Title);

  protected readonly resource = httpResource<OrganizationDetailModel>(() => `${API_URL}/organizations/${encodeURIComponent(this.slug())}`);
  protected readonly organization = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly lastActivity = computed(() => formatDate(this.organization()?.last_activity ?? null));
  protected readonly typeLabels = ORGANIZATION_TYPE_LABELS;
  protected readonly levelLabels = ORGANIZATION_LEVEL_LABELS;

  constructor() {
    effect(() => {
      const item = this.organization();
      if (item) {
        this.#title.setTitle(`${item.name} — Fiskultura`);
      }
    });
  }
}
