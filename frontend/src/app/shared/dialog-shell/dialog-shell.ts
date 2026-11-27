import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ICON_BUTTON_IMPORTS } from '../../../theme/ui/icon-button';

@Component({
  selector: 'app-dialog-shell',
  imports: [MatDialogModule, ICON_BUTTON_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dialog-shell' },
  template: `
    <header class="dialog-shell-header">
      <div class="dialog-shell-heading">
        <ng-content select="[dialogMeta]" />
        <h2 class="dialog-shell-title">{{ title() }}</h2>
      </div>
      @if (closable()) {
        <button type="button" app-icon-button icon="close" theme="neutral" label="Zatvori" class="dialog-close" mat-dialog-close></button>
      }
    </header>
    <div class="dialog-shell-body">
      <ng-content />
    </div>
    <footer class="dialog-shell-footer">
      <ng-content select="[dialogActions]" />
    </footer>
  `,
})
export class DialogShell {
  readonly title = input.required<string>();
  readonly closable = input(true);
}
