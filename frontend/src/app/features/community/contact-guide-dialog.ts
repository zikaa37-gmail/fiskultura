import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { ContactGuide } from '../../content/rules/contact-guides';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-contact-guide-dialog',
  imports: [MatDialogModule, BUTTON_IMPORTS, DialogShell, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="guide.title" [class]="'accent-' + guide.accent">
      <p class="mb-4">{{ guide.intro }}</p>

      <h3 class="guide-heading guide-yes mb-2"><app-icon name="check" [size]="18" /> Obratite se kada</h3>
      <ul class="guide-list mb-4">
        @for (line of guide.contactWhen; track line) {
          <li>{{ line }}</li>
        }
      </ul>

      <h3 class="guide-heading guide-no mb-2"><app-icon name="ban" [size]="18" /> Ne obraćajte se za</h3>
      <ul class="guide-list mb-4">
        @for (line of guide.notFor; track line) {
          <li>{{ line }}</li>
        }
      </ul>

      @if (guide.steps) {
        <h3 class="guide-heading mb-2">Redosled</h3>
        <ol class="guide-list mb-4">
          @for (line of guide.steps; track line) {
            <li>{{ line }}</li>
          }
        </ol>
      }

      @if (guide.include) {
        <h3 class="guide-heading mb-2">Šta da napišete</h3>
        <ul class="guide-list mb-4">
          @for (line of guide.include; track line) {
            <li>{{ line }}</li>
          }
        </ul>
      }

      <p class="small muted">
        Osnov:
        @for (link of guide.legal; track link.label; let last = $last) {
          <a [href]="link.url" target="_blank" rel="noopener">{{ link.label }}</a>{{ last ? '' : '; ' }}
        }
      </p>

      <div dialogActions>
        <button type="button" mat-button theme="tertiary" mat-dialog-close>Zatvori</button>
      </div>
    </app-dialog-shell>
  `,
  styles: `
    .guide-heading {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 15px;
    }
    .guide-yes {
      color: var(--color-lime-strong);
    }
    .guide-no {
      color: var(--color-rose);
    }
    .guide-list {
      margin-top: 0;
      padding-left: 20px;
    }
    .guide-list li + li {
      margin-top: 4px;
    }
  `,
})
export class ContactGuideDialog {
  protected readonly guide = inject<ContactGuide>(MAT_DIALOG_DATA);
}

@Injectable({ providedIn: 'root' })
export class ContactGuideDialogService {
  readonly #dialog = inject(MatDialog);

  open(guide: ContactGuide): void {
    this.#dialog.open(ContactGuideDialog, { data: guide, width: '600px', maxWidth: '100vw', panelClass: ['app-dialog-panel', 'news-dialog-panel'], autoFocus: false });
  }
}
