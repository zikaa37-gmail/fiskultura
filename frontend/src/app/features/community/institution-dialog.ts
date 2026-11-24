import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { openFacilityDialog } from './facility-dialog';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { ContactItem } from '../../shared/contact-item/contact-item';
import { Institution, INSTITUTION_TYPE_ACCENTS, INSTITUTION_TYPE_LABELS } from './institution.model';

@Component({
  selector: 'app-institution-dialog',
  imports: [MatDialogModule, BUTTON_IMPORTS, DialogShell, ContactItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="item().name" [class]="'accent-' + accents[item().type]">
      <span dialogMeta class="reg-label">{{ typeLabels[item().type] }}</span>

      @if (address()) {
        <app-contact-item kind="address" [value]="address()" [mapQuery]="item().name + ', ' + address()" />
      }
      @for (phone of phones(); track phone) {
        <app-contact-item kind="phone" [value]="phone" />
      }
      @if (item().website; as website) {
        <app-contact-item kind="web" [value]="website" [text]="host(website)" />
      }
      @if (item().email; as email) {
        <app-contact-item kind="email" [value]="email" />
      }

      @if (details().length) {
        <h3 class="small-heading mb-2">Podaci o ustanovi</h3>
        <dl class="institution-facts">
          @for (fact of details(); track fact.label) {
            <div>
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          }
        </dl>
      }

      <div dialogActions>
        <button type="button" mat-flat-button (click)="facilities()">
          Infrastruktura
          @if (item().pending_submissions > 0) {
            <span class="state-chip state-warn">na proveri</span>
          }
        </button>
        <button type="button" mat-button theme="tertiary" mat-dialog-close>Zatvori</button>
      </div>
    </app-dialog-shell>
  `,
  styles: `
    .small-heading {
      margin-top: 20px;
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-muted);
    }
    .institution-facts {
      display: grid;
      gap: 8px;
      margin: 0;
    }
    .institution-facts div {
      display: grid;
      gap: 2px;
    }
    .institution-facts dt {
      font-size: 13px;
      color: var(--color-muted);
    }
    .institution-facts dd {
      margin: 0;
      overflow-wrap: anywhere;
      white-space: pre-line;
    }
    @media (min-width: 600px) {
      .institution-facts {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class InstitutionDialog {
  readonly #initial = inject<Institution>(MAT_DIALOG_DATA);
  protected readonly item = signal(this.#initial);
  readonly #dialog = inject(MatDialog);
  protected readonly typeLabels = INSTITUTION_TYPE_LABELS;
  protected readonly accents = INSTITUTION_TYPE_ACCENTS;

  protected readonly address = signal([this.item().address, [this.item().postal_code, this.item().place].filter(Boolean).join(' ')].filter(Boolean).join(', '));
  protected readonly phones = signal((this.item().phone ?? '').split(/\s*[,;]\s*/).filter(Boolean));
  protected readonly details = signal(
    [
      { label: 'Direktor / dekan', value: this.item().director },
      { label: 'Opština', value: this.item().municipality },
      { label: 'Okrug', value: this.item().district },
      { label: 'Oblast', value: this.item().region === 'Srbija' ? null : this.item().region },
      { label: 'PIB', value: this.item().pib },
      { label: 'Matični broj', value: this.item().registry_number },
      { label: 'Faks', value: this.item().fax },
      { label: this.item().bank_accounts.length > 1 ? 'Žiro računi' : 'Žiro račun', value: this.item().bank_accounts.join('\n') },
      ...Object.entries(this.item().extra ?? {}).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
    ].filter((fact): fact is { label: string; value: string } => !!fact.value),
  );

  protected facilities(): void {
    openFacilityDialog(this.#dialog, this.item()).subscribe((updated) => updated && this.item.set(updated));
  }

  protected host(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}

@Injectable({ providedIn: 'root' })
export class InstitutionDialogService {
  readonly #dialog = inject(MatDialog);

  open(item: Institution): void {
    this.#dialog.open(InstitutionDialog, { data: item, width: '600px', maxWidth: '100vw', panelClass: ['app-dialog-panel', 'news-dialog-panel'], autoFocus: false });
  }
}
