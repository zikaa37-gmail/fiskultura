import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly #snackBar = inject(MatSnackBar);

  show(message: string): void {
    this.#snackBar.open(message, 'U redu', { duration: 5000 });
  }
}
