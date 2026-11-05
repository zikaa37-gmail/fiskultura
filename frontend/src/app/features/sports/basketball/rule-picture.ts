import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RuleFigure } from './rule-figure';
import { RulePicture } from './rules-content';

interface ShotSpot {
  x: number;
  y: number;
  points: 1 | 2 | 3;
  note: string;
}

const HALF_SCALE = 14.667;
const HALF_BASKET_Y = 10 + 1.575 * HALF_SCALE;

@Component({
  selector: 'app-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class RulePictureView {
  readonly name = input.required<RulePicture>();
  readonly label = input('');
  readonly interactive = input(false);

  readonly revealed = signal<number[]>([]);

  readonly halfCourt = {
    keyLeft: 120 - 2.45 * HALF_SCALE,
    keyWidth: 4.9 * HALF_SCALE,
    keyDepth: 5.8 * HALF_SCALE,
    basketY: HALF_BASKET_Y,
    freeThrowRadius: 1.8 * HALF_SCALE,
    noChargeRadius: 1.25 * HALF_SCALE,
    arcRadius: 6.75 * HALF_SCALE,
    cornerLeft: 120 - 6.6 * HALF_SCALE,
    cornerRight: 120 + 6.6 * HALF_SCALE,
    cornerEnd: 10 + 2.99 * HALF_SCALE,
  };

  readonly halfArc = `M${this.halfCourt.cornerLeft} 10 V${this.halfCourt.cornerEnd} A${this.halfCourt.arcRadius} ${this.halfCourt.arcRadius} 0 0 0 ${this.halfCourt.cornerRight} ${this.halfCourt.cornerEnd} V10`;
  readonly halfFreeThrow = `M${120 - this.halfCourt.freeThrowRadius} ${10 + this.halfCourt.keyDepth} A${this.halfCourt.freeThrowRadius} ${this.halfCourt.freeThrowRadius} 0 0 0 ${120 + this.halfCourt.freeThrowRadius} ${10 + this.halfCourt.keyDepth}`;
  readonly halfNoCharge = `M${120 - this.halfCourt.noChargeRadius} ${HALF_BASKET_Y} A${this.halfCourt.noChargeRadius} ${this.halfCourt.noChargeRadius} 0 0 0 ${120 + this.halfCourt.noChargeRadius} ${HALF_BASKET_Y}`;

  readonly spots: ShotSpot[] = [
    { x: 120, y: 104, points: 1, note: 'slobodno' },
    { x: 120, y: 62, points: 2, note: '' },
    { x: 62, y: 74, points: 2, note: '' },
    { x: 178, y: 80, points: 2, note: '' },
    { x: 50, y: 103, points: 2, note: 'na liniji' },
    { x: 15, y: 30, points: 3, note: '' },
    { x: 226, y: 38, points: 3, note: '' },
    { x: 42, y: 128, points: 3, note: '' },
    { x: 120, y: 147, points: 3, note: '' },
    { x: 200, y: 124, points: 3, note: '' },
  ];

  isRevealed(index: number): boolean {
    return this.revealed().includes(index);
  }

  toggleSpot(index: number, event: Event): void {
    if (!this.interactive()) return;
    event.stopPropagation();
    this.revealed.update((list) => (list.includes(index) ? list.filter((item) => item !== index) : [...list, index]));
  }

  revealAll(event: Event): void {
    event.stopPropagation();
    this.revealed.set(this.revealed().length === this.spots.length ? [] : this.spots.map((_, index) => index));
  }
}
