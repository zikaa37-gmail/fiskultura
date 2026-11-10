import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/http/api';

type VerifyState = 'pending' | 'done' | 'failed';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <div class="auth-card">
          <h1>Potvrda naloga</h1>
          @switch (state()) {
            @case ('pending') {
              <mat-progress-bar mode="indeterminate" />
            }
            @case ('done') {
              <p>Nalog je potvrđen i prijavljen si. Dobro došao na Fiskulturu!</p>
              <a mat-flat-button routerLink="/profil">Moj profil</a>
            }
            @case ('failed') {
              <p class="form-error" role="alert">{{ error() }}</p>
              <a mat-stroked-button routerLink="/prijava">Na prijavu</a>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class VerifyEmail implements OnInit {
  readonly token = input<string>();

  readonly #auth = inject(AuthService);

  protected readonly state = signal<VerifyState>('pending');
  protected readonly error = signal('');

  ngOnInit(): void {
    const token = this.token();
    if (!token) {
      this.error.set('Link za potvrdu nije potpun.');
      this.state.set('failed');
      return;
    }
    this.#auth.verifyEmail(token).subscribe({
      next: () => this.state.set('done'),
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.state.set('failed');
      },
    });
  }
}
