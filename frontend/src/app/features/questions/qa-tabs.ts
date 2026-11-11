import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { Debate } from '../debates/debate.model';
import { ProposeTopicDialogService } from '../debates/propose-topic-dialog';
import { AskQuestionDialogService } from './ask-question-dialog';

export type QaTab = 'pitanja' | 'debate';

@Component({
  selector: 'app-qa-tabs',
  imports: [MatTabsModule, RouterLink, BUTTON_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="visually-hidden">{{ active() === 'pitanja' ? 'Pitanja i odgovori' : 'Stručne debate' }}</h1>
    <nav mat-tab-nav-bar class="qa-tabs" [tabPanel]="panel" mat-stretch-tabs="false" [disablePagination]="true" aria-label="Pitanja i stručne debate">
      <a mat-tab-link routerLink="/pitanja" [active]="active() === 'pitanja'">Pitanja i odgovori</a>
      <a mat-tab-link routerLink="/debate" [active]="active() === 'debate'">Stručne debate</a>
    </nav>
    <mat-tab-nav-panel #panel>
      <div class="qa-action">
        @if (active() === 'pitanja') {
          <button type="button" mat-flat-button (click)="ask()">Postavi pitanje</button>
        } @else {
          <button type="button" mat-flat-button (click)="propose()">Predloži temu za razgovor</button>
        }
      </div>
      <ng-content />
    </mat-tab-nav-panel>
  `,
  styles: `
    :host {
      display: block;
    }
    .qa-tabs {
      margin-bottom: 16px;
      border-bottom: 1px solid var(--color-border);
    }
    .qa-action {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
  `,
})
export class QaTabs {
  readonly active = input.required<QaTab>();
  readonly proposed = output<Debate | null>();

  readonly #router = inject(Router);
  readonly #askDialog = inject(AskQuestionDialogService);
  readonly #proposeDialog = inject(ProposeTopicDialogService);

  protected ask(): void {
    this.#askDialog.open();
  }

  protected propose(): void {
    this.#proposeDialog
      .open()
      .afterClosed()
      .subscribe((debate) => {
        if (debate?.status === 'open') {
          this.#router.navigate(['/debate', debate.slug]);
          return;
        }
        this.proposed.emit(debate ?? null);
      });
  }
}
