import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../../theme/ui/button';
import { DialogShell } from '../../../shared/dialog-shell/dialog-shell';
import { Icon } from '../../../shared/icon/icon';
import { PropsRuleMedia } from './rule-media';
import { RULE_CARDS } from './rules-content';
import { PropsRulesProgress } from './rules-progress';

@Component({
  selector: 'app-props-rule-card-dialog',
  imports: [MatDialogModule, BUTTON_IMPORTS, DialogShell, Icon, PropsRuleMedia],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let card = current();
    <app-dialog-shell [title]="index() + 1 + '. ' + card.title">
      <span class="muted small" dialogMeta>Polje {{ index() + 1 }} od {{ total }}</span>
      <div class="rules-frames">
        @for (frame of card.frames; track $index; let frameIndex = $index) {
          <figure class="rules-frame" [class.rules-frame-ok]="frame.verdict === 'ok'" [class.rules-frame-bad]="frame.verdict === 'bad'">
            <app-props-rule-media [picture]="frame.picture" [image]="frame.image" [focus]="frame.focus" [label]="frame.caption" [interactive]="frame.interactive ?? false" />
            @if (frame.verdict) {
              <span class="rules-verdict" [attr.aria-label]="frame.verdict === 'ok' ? 'dozvoljeno' : 'nije dozvoljeno'">
                <app-icon [name]="frame.verdict === 'ok' ? 'check' : 'close'" [size]="18" />
              </span>
            }
            <button
              type="button"
              class="rules-info"
              [class.rules-info-open]="infoShown().includes(frameIndex)"
              (click)="toggleInfo(frameIndex)"
              [attr.aria-expanded]="infoShown().includes(frameIndex)"
              aria-label="Objašnjenje"
            >
              i
            </button>
            <figcaption class="rules-caption">{{ frame.caption }}</figcaption>
            @if (infoShown().includes(frameIndex)) {
              <p class="rules-info-text">{{ frame.info }}</p>
            }
          </figure>
        }
      </div>

      <div class="rules-question">
        <app-icon name="help" [size]="22" />
        <span class="rules-question-text">{{ card.question.text }}</span>
        @if (answerShown()) {
          <strong class="rules-answer">{{ card.question.answer }}</strong>
        } @else {
          <button type="button" mat-stroked-button (click)="answerShown.set(true)">Odgovor</button>
        }
      </div>

      <ng-container dialogActions>
        <button type="button" mat-stroked-button [disabled]="index() === 0" (click)="go(-1)">
          <app-icon name="arrow-left" [size]="18" />
          Prethodno
        </button>
        <button type="button" mat-flat-button (click)="next()">
          {{ index() + 1 < total ? 'Sledeće' : 'Kraj' }}
          <app-icon name="arrow-right" [size]="18" />
        </button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class PropsRuleCardDialog {
  readonly #ref = inject(MatDialogRef<PropsRuleCardDialog>);
  readonly #progress = inject(PropsRulesProgress);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly total = RULE_CARDS.length;
  protected readonly index = signal(inject<{ index: number }>(MAT_DIALOG_DATA).index);
  protected readonly current = computed(() => RULE_CARDS[this.index()]);
  protected readonly answerShown = signal(false);
  protected readonly infoShown = signal<number[]>([]);

  constructor() {
    this.#progress.markOpened(this.current().id);
  }

  protected toggleInfo(index: number): void {
    this.infoShown.update((list) => (list.includes(index) ? list.filter((item) => item !== index) : [...list, index]));
  }

  protected go(step: number): void {
    const target = this.index() + step;
    if (target < 0 || target >= this.total) {
      return;
    }
    this.index.set(target);
    this.answerShown.set(false);
    this.infoShown.set([]);
    this.#progress.markOpened(this.current().id);
    this.#host.nativeElement.querySelector('.dialog-shell-body')?.scrollTo({ top: 0 });
  }

  protected next(): void {
    if (this.index() + 1 < this.total) {
      this.go(1);
    } else {
      this.#ref.close();
    }
  }
}
