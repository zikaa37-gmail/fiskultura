import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrgLinks } from '../../shared/org-links/org-links';
import { Organization, ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS } from '../../core/content/content.model';

@Component({
  selector: 'app-organization-card',
  imports: [RouterLink, OrgLinks],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'module accent-violet' },
  template: `
    @let item = organization();
    <span class="status" [class.status-next]="item.status === 'aktivno'">{{ typeLabels[item.type] }} · {{ levelLabels[item.level] }}</span>
    <h3>
      <a class="post-title" [routerLink]="['/udruzenja', item.slug]">{{ item.name }}</a>
      @if (item.short_name) {
        <span class="muted short-name">({{ item.short_name }})</span>
      }
    </h3>
    @if (item.city) {
      <span class="muted small">{{ item.city }}</span>
    }
    <p>{{ item.description }}</p>
    <app-org-links [organization]="item" />
  `,
})
export class OrganizationCard {
  readonly organization = input.required<Organization>();
  protected readonly typeLabels = ORGANIZATION_TYPE_LABELS;
  protected readonly levelLabels = ORGANIZATION_LEVEL_LABELS;
}
