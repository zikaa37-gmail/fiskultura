import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Organization, ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS } from '../../core/content/content.model';

@Component({
  selector: 'app-organization-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'module accent-violet' },
  template: `
    @let item = organization();
    <span class="status" [class.status-next]="item.status === 'aktivno'">{{ typeLabels[item.type] }} · {{ levelLabels[item.level] }}</span>
    <h3>
      <a class="post-title" [routerLink]="['/udruzenja', item.slug]">{{ item.name }}</a>
      @if (item.short_name) {
        <span class="muted">({{ item.short_name }})</span>
      }
    </h3>
    @if (item.city) {
      <span class="muted small">{{ item.city }}</span>
    }
    <p>{{ item.description }}</p>
    <div class="link-row">
      @if (item.news_count) {
        <a class="inline-link" [routerLink]="['/udruzenja', item.slug]">Objave ({{ item.news_count }}) →</a>
      }
      @if (item.website) {
        <a class="inline-link" [href]="item.website" target="_blank" rel="noopener">Sajt →</a>
      }
      @if (item.social.facebook; as facebook) {
        <a class="inline-link" [href]="facebook" target="_blank" rel="noopener">Facebook →</a>
      }
      @if (item.social.instagram; as instagram) {
        <a class="inline-link" [href]="instagram" target="_blank" rel="noopener">Instagram →</a>
      }
      @if (item.social.youtube; as youtube) {
        <a class="inline-link" [href]="youtube" target="_blank" rel="noopener">YouTube →</a>
      }
      @if (item.email) {
        <a class="inline-link" [href]="'mailto:' + item.email">{{ item.email }}</a>
      }
    </div>
  `,
})
export class OrganizationCard {
  readonly organization = input.required<Organization>();
  protected readonly typeLabels = ORGANIZATION_TYPE_LABELS;
  protected readonly levelLabels = ORGANIZATION_LEVEL_LABELS;
}
