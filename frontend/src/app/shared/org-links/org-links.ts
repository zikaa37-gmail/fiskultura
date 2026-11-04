import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from '../icon/icon';
import { LinkField, Organization } from '../../core/content/content.model';

interface LinkTile {
  key: string;
  label: string;
  icon: IconName;
  href?: string;
  title: string;
  route?: string[];
  queryParams?: Record<string, string>;
  broken: boolean;
}

const SOCIAL: { field: LinkField; label: string; icon: IconName }[] = [
  { field: 'website', label: 'Sajt', icon: 'web' },
  { field: 'facebook', label: 'Facebook', icon: 'facebook' },
  { field: 'instagram', label: 'Instagram', icon: 'instagram' },
  { field: 'youtube', label: 'YouTube', icon: 'youtube' },
];

@Component({
  selector: 'app-org-links',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'org-links' },
  template: `
    @for (tile of tiles(); track tile.key) {
      @if (tile.broken) {
        <span class="org-link org-link-disabled" aria-disabled="true" [title]="tile.title">
          <app-icon [name]="tile.icon" [size]="22" />
          <span>{{ tile.label }}</span>
        </span>
      } @else if (tile.route) {
        <a class="org-link" [routerLink]="tile.route" [queryParams]="tile.queryParams" [title]="tile.title">
          <app-icon [name]="tile.icon" [size]="22" />
          <span>{{ tile.label }}</span>
        </a>
      } @else {
        <a class="org-link" [href]="tile.href" [attr.target]="tile.key === 'email' ? null : '_blank'" rel="noopener" [title]="tile.title">
          <app-icon [name]="tile.icon" [size]="22" />
          <span>{{ tile.label }}</span>
        </a>
      }
    }
  `,
})
export class OrgLinks {
  readonly organization = input.required<Organization>();
  readonly showNews = input(true);

  protected readonly tiles = computed<LinkTile[]>(() => {
    const item = this.organization();
    const links: Partial<Record<LinkField, string | null | undefined>> = {
      website: item.website,
      facebook: item.social.facebook,
      instagram: item.social.instagram,
      youtube: item.social.youtube,
    };
    const tiles: LinkTile[] = [];

    if (this.showNews() && item.news_count) {
      tiles.push({ key: 'news', label: `Objave (${item.news_count})`, icon: 'news', route: ['/vesti'], queryParams: { udruzenje: item.slug }, title: 'Objave ove organizacije', broken: false });
    }
    for (const social of SOCIAL) {
      const url = links[social.field];
      if (url) {
        const broken = item.link_status[social.field] === 'broken';
        tiles.push({ key: social.field, label: social.label, icon: social.icon, href: url, title: broken ? 'Link trenutno ne radi' : url, broken });
      } else if (social.field === 'instagram') {
        tiles.push({ key: social.field, label: social.label, icon: social.icon, title: 'Nema Instagram naloga', broken: true });
      }
    }
    if (item.email) {
      tiles.push({ key: 'email', label: 'Mejl', icon: 'mail', href: `mailto:${item.email}`, title: item.email, broken: false });
    }
    return tiles;
  });
}
