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
import { DebateDetail, POST_KIND_LABELS } from './debate.model';
import { DebateSummaryCard } from './debate-summary';
import { DebateIntroCard } from './debate-intro';

@Component({
  selector: 'app-debate-moderation',
  imports: [FormsModule, MatInputModule, MatProgressBarModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DebateSummaryCard, DebateIntroCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let item = debate();
    <details class="moderation" [open]="!!item.summary_draft || !!item.reopen_requests?.length || item.intro_status === 'draft' || item.intro_status === 'failed'">
      <summary>Moderator teme: analiza i podešavanja</summary>
      <div class="moderation-body">
        <section class="intro-panel" aria-label="Uvodni pregled">
          <strong>Uvodni pregled</strong>
          <p class="small muted">
            @switch (item.intro_status) {
              @case ('pending') {
                @if (item.intro_busy) {
                  AI čeka na red da pretraži internet i napiše pregled. Stranica se sama osvežava.
                } @else {
                  Pregled čeka na obradu. Klikni „Napravi uvodni pregled” da AI počne odmah.
                }
              }
              @case ('generating') { AI upravo pretražuje internet i piše pregled (minut-dva). Stranica se sama osvežava. }
              @case ('draft') { Nacrt je spreman: pročitaj ga, proveri izvore i odobri. }
              @case ('approved') { Pregled je objavljen. Ako treba, napravi novu verziju sa smernicama. }
              @case ('failed') { <span class="warn-text">Pregled nije napravljen: {{ item.intro_error }}</span> }
              @default { Pregled još nije napravljen. }
            }
          </p>
          @if (item.status === 'open') {
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Smernice za pregled (šta da AI potraži)</mat-label>
              <textarea matInput rows="3" maxlength="2000" [ngModel]="introGuidance()" (ngModelChange)="introGuidance.set($event)"></textarea>
            </mat-form-field>
            <div class="moderation-actions">
              <button type="button" mat-flat-button theme="tertiary" [disabled]="busy() || !!item.intro_busy" (click)="requestIntro()">
                {{ item.intro_status ? 'Napravi novi pregled' : 'Napravi uvodni pregled' }}
              </button>
              @if (item.intro_draft) {
                <button type="button" mat-flat-button theme="secondary" [disabled]="busy() || editing() !== null" (click)="approveIntro()">Odobri i objavi pregled</button>
                <button type="button" mat-stroked-button [disabled]="busy()" (click)="startEdit('draft', item.intro_draft.text)">Izmeni tekst nacrta</button>
              }
              @if (item.intro) {
                <button type="button" mat-stroked-button [disabled]="busy()" (click)="startEdit('published', item.intro.text)">Izmeni objavljeni pregled</button>
              }
            </div>
          }
          @if (editing(); as which) {
            <div class="intro-edit">
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>{{ which === 'draft' ? 'Tekst nacrta' : 'Tekst objavljenog pregleda' }}</mat-label>
                <textarea matInput rows="16" [ngModel]="editText()" (ngModelChange)="editText.set($event)"></textarea>
              </mat-form-field>
              <p class="small muted">„**tekst**” je podebljano, red koji počinje sa „- ” je stavka liste, prazan red je novi pasus.</p>
              <div class="moderation-actions">
                <button type="button" mat-stroked-button (click)="editing.set(null)">Odustani</button>
                <button type="button" mat-flat-button [disabled]="busy() || editText().trim().length < 20" (click)="saveEdit()">Sačuvaj</button>
              </div>
            </div>
          }
          @if (item.intro_draft; as draft) {
            @if (draft.notes) {
              <div class="intro-notes small">
                <strong>Napomene AI-ja za moderatora</strong> (članovi ovo ne vide)
                <p>{{ draft.notes }}</p>
              </div>
            }
            @if (editing() !== 'draft') {
              <app-debate-intro [intro]="draft" [draft]="true" />
            }
          }
        </section>
        @if (item.reopen_requests?.length) {
          <section class="reopen-requests" aria-label="Zahtevi za ponovno otvaranje">
            <strong>Zahtevi da se tema ponovo otvori ({{ item.reopen_requests?.length }})</strong>
            @for (request of item.reopen_requests; track request.id) {
              <div class="reopen-request">
                <p class="small muted">{{ request.author }} · {{ kindLabels[request.kind] }}</p>
                <p class="reopen-body">{{ request.body }}</p>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Poruka članu (nije obavezno)</mat-label>
                  <input matInput maxlength="1000" [ngModel]="notes()[request.id] ?? ''" (ngModelChange)="setNote(request.id, $event)" />
                </mat-form-field>
                <div class="moderation-actions">
                  <button type="button" mat-flat-button [disabled]="busy()" (click)="decide(request.id, true)">Odobri i otvori temu</button>
                  <button type="button" mat-stroked-button [disabled]="busy()" (click)="decide(request.id, false)">Odbij</button>
                </div>
              </div>
            }
          </section>
        }
        @if (item.status === 'closed') {
          <p class="small muted">Tema je zatvorena i zamrznuta: nema novih priloga, lajkova, isticanja ni nove analize.</p>
          <div class="moderation-actions">
            <button type="button" mat-stroked-button [disabled]="busy()" (click)="toggleStatus()">Ponovo otvori temu</button>
          </div>
        } @else {
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
    .intro-panel {
      display: grid;
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }
    .intro-panel p {
      margin: 0;
    }
    .intro-edit {
      display: grid;
      gap: 8px;
    }
    .intro-edit mat-form-field {
      width: 100%;
    }
    .intro-notes {
      padding: 10px 12px;
      border: 1px dashed var(--color-orange);
      border-radius: 8px;
      background: var(--color-surface);
    }
    .intro-notes p {
      margin: 4px 0 0;
      white-space: pre-line;
    }
    .reopen-requests {
      display: grid;
      gap: 12px;
    }
    .reopen-request {
      display: grid;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
    }
    .reopen-request p {
      margin: 0;
    }
    .reopen-body {
      white-space: pre-line;
      overflow-wrap: anywhere;
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
  protected readonly introGuidance = linkedSignal(() => this.debate().intro_guidance ?? '');

  protected requestIntro(): void {
    this.#run(this.#http.post(`${API_URL}/debates/${this.debate().slug}/intro`, { guidance: this.introGuidance().trim() || null }), 'AI pretražuje internet i piše pregled. Stiže notifikacija kad bude spreman.');
  }

  protected readonly editing = signal<'draft' | 'published' | null>(null);
  protected readonly editText = signal('');

  protected startEdit(which: 'draft' | 'published', text: string): void {
    this.editing.set(which);
    this.editText.set(text);
  }

  protected saveEdit(): void {
    const which = this.editing();
    if (!which) {
      return;
    }
    this.#run(this.#http.patch(`${API_URL}/debates/${this.debate().slug}/intro`, { which, text: this.editText().trim() }), which === 'draft' ? 'Nacrt je izmenjen.' : 'Objavljeni pregled je izmenjen.');
    this.editing.set(null);
  }

  protected approveIntro(): void {
    this.#run(this.#http.post(`${API_URL}/debates/${this.debate().slug}/intro/approve`, {}), 'Uvodni pregled je objavljen.');
  }
  protected readonly notes = signal<Record<number, string>>({});
  protected readonly kindLabels = POST_KIND_LABELS;

  protected setNote(id: number, value: string): void {
    this.notes.update((all) => ({ ...all, [id]: value }));
  }

  protected decide(id: number, approve: boolean): void {
    const note = (this.notes()[id] ?? '').trim() || null;
    this.#run(
      this.#http.post(`${API_URL}/debate-reopen-requests/${id}/decision`, { approve, note }),
      approve ? 'Tema je ponovo otvorena i prilog je objavljen. Član dobija mejl.' : 'Zahtev je odbijen. Član dobija mejl.',
    );
  }

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
        message: closing ? 'Tema se zamrzava: niko ne može da doda prilog ni lajk, a sažetak i zaključci ostaju kakvi jesu. Ako nacrt analize još nije odobren, odobri ga pre zatvaranja. Članovi mogu da zatraže ponovno otvaranje.' : 'Članovi ponovo mogu da pišu priloge.',
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
