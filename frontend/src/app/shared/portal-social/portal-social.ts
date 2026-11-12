import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PORTAL_SOCIAL } from '../../content/portal-content';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-portal-social',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'portal-social' },
  template: `
    @if (label()) {
      <span class="small muted">{{ label() }}</span>
    }
    @for (item of links; track item.id) {
      <a class="portal-social-link" [href]="item.url" target="_blank" rel="noopener" [attr.aria-label]="item.label + ' ' + item.handle" [title]="item.label + ' ' + item.handle">
        <app-icon [name]="item.id" [size]="16" />
      </a>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .portal-social-link {
      display: inline-grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
      color: var(--color-text);
    }
    .portal-social-link:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  `,
})
export class PortalSocialLinks {
  readonly label = input<string>('');
  protected readonly links = PORTAL_SOCIAL;
}
