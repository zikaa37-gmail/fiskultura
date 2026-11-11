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
    <h1 class="visually-hidden">{{ active() === 'pitanja' ? 'Pitanja i odgovori' : 'Debate' }}</h1>
    <div class="qa-tabs">
      <nav mat-tab-nav-bar [tabPanel]="panel" mat-stretch-tabs="false" [disablePagination]="true" aria-label="Pitanja i debate">
        <a mat-tab-link routerLink="/pitanja" [active]="active() === 'pitanja'">Pitanja i odgovori</a>
        <a mat-tab-link routerLink="/debate" [active]="active() === 'debate'">Debate</a>
      </nav>
      <div class="qa-actions">
        <button type="button" mat-flat-button [theme]="active() === 'pitanja' ? 'primary' : 'tertiary'" (click)="ask()">Postavi pitanje</button>
        <button type="button" mat-flat-button [theme]="active() === 'debate' ? 'primary' : 'tertiary'" (click)="propose()">Predloži temu za razgovor</button>
      </div>
    </div>
    <mat-tab-nav-panel #panel>
      <ng-content />
    </mat-tab-nav-panel>
  `,
  styles: `
    :host {
      display: block;
    }
    .qa-tabs {
      display: grid;
      gap: 12px;
      margin-bottom: 16px;
    }
    .qa-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .qa-actions button {
      white-space: normal;
      line-height: 1.2;
    }
    @media (min-width: 720px) {
      .qa-tabs {
        grid-template-columns: 1fr auto;
        align-items: center;
        border-bottom: 1px solid var(--color-border);
      }
      .qa-tabs nav {
        border-bottom: 0;
      }
      .qa-actions {
        display: flex;
      }
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
