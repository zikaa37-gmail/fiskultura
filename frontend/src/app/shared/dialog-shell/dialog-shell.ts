import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-dialog-shell',
  imports: [MatDialogModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dialog-shell' },
  template: `
    <header class="dialog-shell-header">
      <div class="dialog-shell-heading">
        <ng-content select="[dialogMeta]" />
        <h2 class="dialog-shell-title">{{ title() }}</h2>
      </div>
      @if (closable()) {
        <button type="button" class="dialog-close" mat-dialog-close aria-label="Zatvori" title="Zatvori"><app-icon name="close" /></button>
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
