import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ContactLine, InstitutionContact, SchoolAdministration, telHref } from '../../content/rules/contacts';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { Icon } from '../../shared/icon/icon';

export interface ContactDialogData {
  title: string;
  accent: string;
  when?: string;
  address?: string;
  lines: ContactLine[];
  url?: string;
  urlLabel?: string;
}

@Component({
  selector: 'app-contact-dialog',
  imports: [MatDialogModule, MatButtonModule, DialogShell, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="data.title" [class]="'accent-' + data.accent">
      @if (data.when) {
        <p class="contact-when">{{ data.when }}</p>
      }
      @if (data.address) {
        <a class="contact-action" [href]="mapHref(data.address)" target="_blank" rel="noopener">
          <app-icon name="pin" [size]="20" />
          <span>{{ data.address }}</span>
        </a>
      }
      @for (line of data.lines; track line.label) {
        <section class="contact-group">
          <p class="contact-group-label">{{ line.label }}</p>
          @if (line.phone) {
            <a class="contact-action" [href]="tel(line.phone)">
              <app-icon name="phone" [size]="20" />
              <span>{{ line.phone }}</span>
            </a>
          }
          @if (line.email) {
            <div class="contact-mail-row">
              <a class="contact-action" [href]="'mailto:' + line.email">
                <app-icon name="mail" [size]="20" />
                <span class="contact-email">{{ local(line.email) }}<wbr />&#64;{{ domain(line.email) }}</span>
              </a>
              <button type="button" class="contact-copy" [attr.aria-label]="'Kopiraj ' + line.email" title="Kopiraj adresu" (click)="copy(line.email)">
                <app-icon [name]="copied() === line.email ? 'check' : 'clipboard'" [size]="18" />
              </button>
            </div>
          }
        </section>
      }
      <div dialogActions>
        @if (data.url) {
          <a mat-flat-button class="btn-tertiary" [href]="data.url" target="_blank" rel="noopener">{{ data.urlLabel ?? 'Sajt' }} <app-icon name="external" [size]="16" /></a>
        }
        <button type="button" mat-button class="btn-tertiary-text" mat-dialog-close>Zatvori</button>
      </div>
    </app-dialog-shell>
  `,
})
export class ContactDialog {
  protected readonly data = inject<ContactDialogData>(MAT_DIALOG_DATA);
  protected readonly tel = telHref;
  protected readonly copied = signal<string | null>(null);

  protected local(email: string): string {
    return email.split('@')[0];
  }

  protected domain(email: string): string {
    return email.split('@')[1] ?? '';
  }

  protected copy(email: string): void {
    navigator.clipboard?.writeText(email).then(() => this.copied.set(email));
  }

  protected mapHref(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
}

@Injectable({ providedIn: 'root' })
export class ContactDialogService {
  readonly #dialog = inject(MatDialog);

  openInstitution(item: InstitutionContact): void {
    this.#open({ title: item.name, accent: item.accent, when: item.when, address: item.address, lines: item.lines, url: item.url, urlLabel: item.urlLabel });
  }

  openAdministration(item: SchoolAdministration): void {
    this.#open({
      title: `Školska uprava ${item.city}`,
      accent: 'primary',
      address: `${item.address}, ${item.city.replace(/ \(.*\)$/, '')}`,
      lines: [{ label: 'Telefon i mejl', phone: item.phone, email: item.email }],
      url: 'https://prosveta.gov.rs/kontakt/',
      urlLabel: 'Kontakti Ministarstva',
    });
  }

  #open(data: ContactDialogData): void {
    this.#dialog.open(ContactDialog, { data, width: '520px', maxWidth: '100vw', panelClass: ['app-dialog-panel', 'news-dialog-panel'], autoFocus: false });
  }
}
