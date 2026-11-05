import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { Icon } from '../../../shared/icon/icon';
import { RuleDefs } from './rule-defs';
import { RuleMedia } from './rule-media';
import { RuleCardDialog } from './rule-card-dialog';
import { RulesProgress } from './rules-progress';
import { PHOTO_CREDITS_NOTE, QUIZ, RULE_CARDS, RULE_DOCUMENT_GROUPS, RULE_SOURCE_URL, RuleCard } from './rules-content';
import photoCredits from '../../../../../public/slike/kosarka/photos/credits.json';

type RulesTab = 'play' | 'quiz' | 'official';

interface PhotoCredit {
  author: string;
  license: string;
  source: string;
}

@Component({
  selector: 'app-basketball-rules',
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, Icon, RuleDefs, RuleMedia],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './basketball-rules.scss',
  templateUrl: './basketball-rules.html',
  host: { class: 'rules-scope' },
})
export class BasketballRules {
  readonly #dialog = inject(MatDialog);
  protected readonly progress = inject(RulesProgress);

  protected readonly cards = RULE_CARDS;
  protected readonly quiz = QUIZ;
  protected readonly groups = RULE_DOCUMENT_GROUPS;
  protected readonly sourceUrl = RULE_SOURCE_URL;
  protected readonly creditsNote = PHOTO_CREDITS_NOTE;
  protected readonly credits = Object.values(photoCredits as Record<string, PhotoCredit>);

  protected readonly tab = signal<RulesTab>('play');
  protected readonly quizIndex = signal(0);
  protected readonly quizChoice = signal<number | null>(null);
  protected readonly quizScore = signal(0);
  protected readonly quizDone = signal(false);

  protected readonly currentQuestion = computed(() => this.quiz[this.quizIndex()]);
  protected readonly stars = computed(() => {
    const score = this.quizScore();
    return score === this.quiz.length ? 3 : score >= this.quiz.length * 0.7 ? 2 : score >= this.quiz.length * 0.4 ? 1 : 0;
  });

  protected setTab(tab: RulesTab): void {
    this.tab.set(tab);
  }

  protected openCard(card: RuleCard): void {
    this.#dialog.open(RuleCardDialog, {
      data: { index: this.cards.indexOf(card) },
      width: '880px',
      maxWidth: '100vw',
      panelClass: ['app-dialog-panel', 'news-dialog-panel', 'rules-scope'],
      autoFocus: false,
    });
  }

  protected choose(index: number): void {
    if (this.quizChoice() !== null) {
      return;
    }
    this.quizChoice.set(index);
    if (index === this.currentQuestion().correct) {
      this.quizScore.update((score) => score + 1);
    }
  }

  protected nextQuestion(): void {
    if (this.quizIndex() + 1 < this.quiz.length) {
      this.quizIndex.update((index) => index + 1);
      this.quizChoice.set(null);
      return;
    }
    this.quizDone.set(true);
    this.progress.saveBest(this.quizScore());
  }

  protected restartQuiz(): void {
    this.quizIndex.set(0);
    this.quizChoice.set(null);
    this.quizScore.set(0);
    this.quizDone.set(false);
  }
}
