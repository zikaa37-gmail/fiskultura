import { ChangeDetectionStrategy, Component, computed, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ICON_BUTTON_IMPORTS } from '../../../theme/ui/icon-button';
import { NotificationService } from '../../core/notification.service';
import { phoneHref } from '../../core/phone';
import { Icon, IconName } from '../icon/icon';
import { MenuOption, OptionsMenu } from '../options-menu/options-menu';

export type ContactKind = 'address' | 'phone' | 'email' | 'web';

type ContactAction = 'map' | 'copy' | 'share';

const KIND_ICONS: Record<ContactKind, IconName> = { address: 'pin', phone: 'phone', email: 'mail', web: 'web' };
const KIND_LABELS: Record<ContactKind, string> = { address: 'adresu', phone: 'broj', email: 'mejl', web: 'link' };

export function mapUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

@Component({
  selector: 'app-contact-item',
  imports: [ICON_BUTTON_IMPORTS, Icon, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contact-item' },
  template: `
    <a class="contact-action" [href]="href()" [attr.target]="external() ? '_blank' : null" [attr.rel]="external() ? 'noopener' : null">
      <app-icon [name]="kindIcon()" [size]="20" />
      @if (kind() === 'email') {
        <span class="contact-email">{{ local() }}<wbr />&#64;{{ domain() }}</span>
      } @else {
        <span class="contact-text">{{ text() || value() }}</span>
      }
    </a>
    <span class="contact-item-actions">
      @for (action of actions(); track action.value; let index = $index) {
        <span [class.contact-item-extra]="collapse() && index > 0">
          @if (action.value === 'map') {
            <a app-icon-button icon="map" theme="accent" [label]="action.label" [href]="mapHref()" target="_blank" rel="noopener"></a>
          } @else {
            <button type="button" app-icon-button [icon]="action.icon!" theme="ghost" [label]="action.label" (click)="run(action.value)"></button>
          }
        </span>
      }
      @if (collapse()) {
        <app-options-menu class="contact-item-more" [options]="actions().slice(1)" [label]="'Još opcija: ' + value()" (selected)="run($event)" />
      }
    </span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .contact-action {
      flex: 1;
      min-width: 0;
    }
    .contact-text {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .contact-item-actions {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      flex: none;
    }
    .contact-item-extra {
      display: none;
    }
    @media (min-width: 600px) {
      .contact-item-extra {
        display: inline-flex;
      }
      .contact-item-more {
        display: none;
      }
    }
  `,
})
export class ContactItem {
  readonly kind = input.required<ContactKind>();
  readonly value = input.required<string>();
  readonly text = input<string>('');
  readonly mapQuery = input<string>('');

  readonly #notifications = inject(NotificationService);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #copied = signal(false);
  readonly #canShare = this.#browser && typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

  protected readonly kindIcon = computed(() => KIND_ICONS[this.kind()]);
  protected readonly external = computed(() => this.kind() === 'address' || this.kind() === 'web');
  protected readonly mapHref = computed(() => mapUrl(this.mapQuery() || this.value()));
  protected readonly href = computed(() => {
    const value = this.value();
    switch (this.kind()) {
      case 'address':
        return this.mapHref();
      case 'phone':
        return phoneHref(value.replace(/\s*\(.*\)\s*$/, ''));
      case 'email':
        return `mailto:${value}`;
      default:
        return /^https?:\/\//.test(value) ? value : `https://${value}`;
    }
  });
  protected readonly local = computed(() => this.value().split('@')[0]);
  protected readonly domain = computed(() => this.value().split('@')[1] ?? '');
  protected readonly actions = computed<MenuOption<ContactAction>[]>(() => {
    const what = KIND_LABELS[this.kind()];
    return [
      ...(this.kind() === 'address' ? [{ value: 'map' as const, label: 'Otvori na Google mapama', icon: 'map' as IconName }] : []),
      { value: 'copy' as const, label: this.#copied() ? 'Kopirano' : `Kopiraj ${what}`, icon: (this.#copied() ? 'check' : 'clipboard') as IconName },
      ...(this.#canShare ? [{ value: 'share' as const, label: `Podeli ${what}`, icon: 'share' as IconName }] : []),
    ];
  });
  protected readonly collapse = computed(() => this.actions().length > 2);

  protected run(action: ContactAction): void {
    if (action === 'map') {
      window.open(this.mapHref(), '_blank', 'noopener');
    } else if (action === 'copy') {
      navigator.clipboard?.writeText(this.value()).then(() => {
        this.#copied.set(true);
        this.#notifications.show('Kopirano.');
        setTimeout(() => this.#copied.set(false), 2000);
      });
    } else {
      navigator.share({ text: this.value(), ...(this.external() ? { url: this.href() } : {}) }).catch(() => undefined);
    }
  }
}
