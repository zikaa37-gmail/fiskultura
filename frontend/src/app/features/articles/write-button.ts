import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { AuthorRequestDialog } from './author-request-dialog';

@Component({
  selector: 'app-write-button',
  imports: [RouterLink, BUTTON_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isStaff()) {
      @if (primary()) {
        <a mat-flat-button routerLink="/admin/tekstovi/nova-prica">Napiši tekst</a>
      } @else {
        <a mat-stroked-button routerLink="/admin/tekstovi/nova-prica">Napiši tekst</a>
      }
    } @else {
      <button type="button" mat-stroked-button (click)="open()">Želim da pišem</button>
    }
  `,
})
export class WriteButton {
  readonly primary = input(false);
  readonly autoOpen = input(false);

  protected readonly auth = inject(AuthService);
  readonly #dialog = inject(MatDialog);
  readonly #router = inject(Router);
  readonly #opened = signal(false);

  constructor() {
    effect(() => {
      if (this.autoOpen() && this.auth.isAuthenticated() && !this.auth.isStaff() && !this.#opened()) {
        this.#opened.set(true);
        this.open();
        this.#router.navigate([], { queryParams: { pisem: null }, queryParamsHandling: 'merge', replaceUrl: true });
      }
    });
  }

  protected open(): void {
    this.#dialog.open(AuthorRequestDialog, { width: '560px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false });
  }
}
