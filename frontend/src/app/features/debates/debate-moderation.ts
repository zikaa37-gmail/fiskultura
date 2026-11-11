import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { DebateDetail } from './debate.model';
import { DebateSummaryCard } from './debate-summary';

@Component({
  selector: 'app-debate-moderation',
  imports: [FormsModule, MatInputModule, MatProgressBarModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DebateSummaryCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let item = debate();
    <details class="moderation" [open]="!!item.summary_draft">
      <summary>Moderator teme: analiza i podešavanja</summary>
      <div class="moderation-body">
        <p class="small muted">
          AI pročita sve vidljive priloge sa lajkovima i istaknutima i napravi nacrt sažetka. Članovi ga vide tek kad ga odobriš. Ako nešto
          ne valja, napiši smernice i traži novu verziju.
        </p>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Smernice za AI (nije obavezno)</mat-label>
          <textarea matInput rows="3" maxlength="2000" [ngModel]="guidance()" (ngModelChange)="guidance.set($event)" placeholder="npr. Izdvoj predloge za normu, ne navodi imena škola."></textarea>
        </mat-form-field>
        <div class="moderation-actions">
          <button type="button" mat-flat-button [disabled]="busy() || !item.posts_count" (click)="analyze()">
            {{ item.summary_draft ? 'Nova verzija analize' : 'Napravi AI analizu' }}
          </button>
          @if (item.summary_draft) {
            <button type="button" mat-flat-button theme="secondary" [disabled]="busy()" (click)="approve()">Odobri i objavi</button>
          }
          <button type="button" mat-stroked-button [disabled]="busy()" (click)="toggleStatus()">{{ item.status === 'open' ? 'Zatvori temu' : 'Ponovo otvori temu' }}</button>
        </div>
        @if (busy()) {
          <mat-progress-bar mode="indeterminate" />
          <p class="small muted" role="status">AI čita raspravu, to može da potraje i minut.</p>
        }
        @if (item.summary_draft; as draft) {
          <app-debate-summary [summary]="draft" [draft]="true" />
        }
      </div>
    </details>
  `,
  styles: `
    .moderation {
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface-alt);
    }
    summary {
      min-height: 44px;
      padding: 12px 16px;
      font-weight: 700;
      cursor: pointer;
    }
    .moderation-body {
      display: grid;
      gap: 12px;
      padding: 0 16px 16px;
    }
    .moderation-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
})
export class DebateModeration {
  readonly debate = input.required<DebateDetail>();
  readonly changed = output<void>();

  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);

  protected readonly guidance = linkedSignal(() => this.debate().summary_guidance ?? '');
  protected readonly busy = signal(false);

  protected analyze(): void {
    this.#run(this.#http.post(`${API_URL}/debates/${this.debate().slug}/analysis`, { guidance: this.guidance().trim() || null }), 'Nacrt analize je spreman. Pročitaj ga pre objave.');
  }

  protected approve(): void {
    this.#run(this.#http.post(`${API_URL}/debates/${this.debate().slug}/analysis/approve`, {}), 'Sažetak je objavljen.');
  }

  protected toggleStatus(): void {
    const closing = this.debate().status === 'open';
    this.#confirm
      .confirm({
        title: closing ? 'Zatvaranje teme' : 'Ponovo otvori temu',
        message: closing ? 'Posle zatvaranja niko ne može da doda prilog, ali tema i sažetak ostaju za čitanje.' : 'Članovi ponovo mogu da pišu priloge.',
        confirmLabel: closing ? 'Zatvori temu' : 'Otvori',
        theme: 'primary',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.#run(this.#http.patch(`${API_URL}/debates/${this.debate().slug}`, { status: closing ? 'closed' : 'open' }), closing ? 'Tema je zatvorena.' : 'Tema je ponovo otvorena.');
        }
      });
  }

  #run(request: ReturnType<HttpClient['post']>, message: string): void {
    this.busy.set(true);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.#notifications.show(message);
        this.changed.emit();
      },
      error: (error) => {
        this.busy.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }
}
