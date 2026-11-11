import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, switchMap } from 'rxjs';
import { ConfirmService } from '../shared/confirm-dialog/confirm-dialog';
import { apiErrorMessage } from './http/api';
import { NotificationService } from './notification.service';

export interface DeleteRequest {
  title: string;
  message: string;
  url: string;
  success?: string;
}

@Injectable({ providedIn: 'root' })
export class DeleteService {
  readonly #http = inject(HttpClient);
  readonly #confirm = inject(ConfirmService);
  readonly #notifications = inject(NotificationService);

  confirmDelete(request: DeleteRequest, done: () => void): void {
    this.#confirm
      .confirm({ title: request.title, message: request.message, confirmLabel: 'Obriši' })
      .pipe(
        filter(Boolean),
        switchMap(() => this.#http.delete<{ message?: string } | null>(request.url)),
      )
      .subscribe({
        next: (response) => {
          this.#notifications.show(request.success ?? response?.message ?? 'Obrisano.');
          done();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
  }
}
