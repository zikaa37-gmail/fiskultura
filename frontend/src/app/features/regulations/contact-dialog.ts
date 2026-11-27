import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { ContactLine, InstitutionContact, SchoolAdministration } from '../../content/rules/contacts';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { ContactItem } from '../../shared/contact-item/contact-item';
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
  imports: [MatDialogModule, BUTTON_IMPORTS, DialogShell, Icon, ContactItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="data.title" [class]="'accent-' + data.accent">
      @if (data.when) {
        <p class="contact-when">{{ data.when }}</p>
      }
      @if (data.address) {
        <app-contact-item kind="address" [value]="data.address" [mapQuery]="data.title + ', ' + data.address" />
      }
      @for (line of data.lines; track line.label) {
        <section class="contact-group">
          <p class="contact-group-label">{{ line.label }}</p>
          @if (line.name) {
            <p class="contact-person">{{ line.name }}</p>
          }
          @if (line.phone) {
            <app-contact-item kind="phone" [value]="line.phone" />
          }
          @if (line.email) {
            <app-contact-item kind="email" [value]="line.email" />
          }
        </section>
      }
      <div dialogActions>
        @if (data.url) {
          <a mat-flat-button theme="tertiary" [href]="data.url" target="_blank" rel="noopener">{{ data.urlLabel ?? 'Sajt' }} <app-icon name="external" [size]="16" /></a>
        }
        <button type="button" mat-button theme="tertiary" mat-dialog-close>Zatvori</button>
      </div>
    </app-dialog-shell>
  `,
})
export class ContactDialog {
  protected readonly data = inject<ContactDialogData>(MAT_DIALOG_DATA);
}

@Injectable({ providedIn: 'root' })
export class ContactDialogService {
  readonly #dialog = inject(MatDialog);

  openInstitution(item: InstitutionContact): void {
    this.#open({ title: item.name, accent: item.accent, when: item.when, address: item.address, lines: item.lines, url: item.url, urlLabel: item.urlLabel });
  }

  openAdministration(item: SchoolAdministration): void {
    this.#open({
      title: item.city.includes('(') ? `${item.city.replace(/ \(.*\)$/, '')}: grupa za stručno-pedagoški nadzor` : `Školska uprava ${item.city}`,
      accent: 'primary',
      when: `${item.area}. Imena prosvetnih savetnika nisu javno objavljena: pitajte upravu koji savetnik je zadužen za vašu školu i za fizičko vaspitanje.`,
      address: `${item.address}, ${item.city.replace(/ \(.*\)$/, '')}`,
      lines: [{ label: 'Telefon i mejl', phone: item.phone, email: item.email }, ...(item.phones ?? []).map((phone, index) => ({ label: `Telefon ${index + 2}`, phone }))],
      url: 'https://prosveta.gov.rs/o-ministarstvu/skolske-uprave/',
      urlLabel: 'Školske uprave',
    });
  }

  #open(data: ContactDialogData): void {
    this.#dialog.open(ContactDialog, { data, width: '520px', maxWidth: '100vw', panelClass: ['app-dialog-panel', 'news-dialog-panel'], autoFocus: false });
  }
}
