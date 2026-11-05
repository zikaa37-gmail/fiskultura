import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type FigureTeam = 'us' | 'them' | 'ref';
export type FigureHand = 'open' | 'fist' | 'three' | 'flat' | 'none';
export type FigureLegs = 'stand' | 'run' | 'jump' | 'wide';

const SHOULDER_Y = -74;
const SHOULDER_X = 11;

@Component({
  selector: 'svg:g[appRuleFigure]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.transform]': 'transform()',
    '[attr.class]': "'rp-figure rp-figure-' + team()",
  },
  template: `
    <svg:g class="rp-legs">
      <svg:polyline [attr.points]="leftLeg()" />
      <svg:polyline [attr.points]="rightLeg()" />
    </svg:g>
    <svg:path class="rp-torso" d="M-12 -76 Q0 -81 12 -76 L10 -40 Q0 -36 -10 -40 Z" />
    @if (team() === 'ref') {
      <svg:path class="rp-stripes" d="M-6 -78 L-6 -38 M0 -80 L0 -37 M6 -78 L6 -38" />
    }
    @if (number()) {
      <svg:text class="rp-number" x="0" y="-52" text-anchor="middle">{{ number() }}</svg:text>
    }
    <svg:g class="rp-arm" [class]="leftArmClass()">
      <svg:line [attr.x1]="-shoulderX" [attr.y1]="shoulderY" [attr.x2]="-shoulderX + leftArm()[0]" [attr.y2]="shoulderY + leftArm()[1]" />
      <svg:g [attr.transform]="'translate(' + (-shoulderX + leftArm()[0]) + ' ' + (shoulderY + leftArm()[1]) + ')'">
        <svg:g [attr.class]="'rp-hand rp-hand-' + leftHand()">
          <ng-container *ngTemplateOutlet="hand; context: { $implicit: leftHand() }" />
        </svg:g>
      </svg:g>
    </svg:g>
    <svg:g class="rp-arm" [class]="rightArmClass()">
      <svg:line [attr.x1]="shoulderX" [attr.y1]="shoulderY" [attr.x2]="shoulderX + rightArm()[0]" [attr.y2]="shoulderY + rightArm()[1]" />
      <svg:g [attr.transform]="'translate(' + (shoulderX + rightArm()[0]) + ' ' + (shoulderY + rightArm()[1]) + ')'">
        <svg:g [attr.class]="'rp-hand rp-hand-' + rightHand()">
          <ng-container *ngTemplateOutlet="hand; context: { $implicit: rightHand() }" />
        </svg:g>
      </svg:g>
    </svg:g>
    <svg:circle class="rp-head" cx="0" cy="-89" r="9" />

    <ng-template #hand let-kind>
      @switch (kind) {
        @case ('fist') {
          <svg:circle r="5.5" />
        }
        @case ('three') {
          <svg:circle r="4" />
          <svg:path class="rp-fingers" d="M-4 -3 L-5 -11 M0 -4 L0 -12 M4 -3 L5 -11" />
        }
        @case ('flat') {
          <svg:rect x="-6" y="-3" width="12" height="6" rx="3" />
        }
        @case ('open') {
          <svg:circle r="4" />
        }
      }
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
})
export class RuleFigure {
  readonly x = input(0);
  readonly y = input(0);
  readonly scale = input(1);
  readonly flip = input(false);
  readonly team = input<FigureTeam>('us');
  readonly legs = input<FigureLegs>('stand');
  readonly leftArm = input<[number, number]>([-6, 30]);
  readonly rightArm = input<[number, number]>([6, 30]);
  readonly leftHand = input<FigureHand>('open');
  readonly rightHand = input<FigureHand>('open');
  readonly leftArmClass = input('');
  readonly rightArmClass = input('');
  readonly number = input<string | number | null>(null);

  readonly shoulderX = SHOULDER_X;
  readonly shoulderY = SHOULDER_Y;

  readonly transform = computed(() => `translate(${this.x()} ${this.y()}) scale(${this.flip() ? -this.scale() : this.scale()} ${this.scale()})`);

  readonly leftLeg = computed(() => this.leg(-1));
  readonly rightLeg = computed(() => this.leg(1));

  private leg(side: -1 | 1): string {
    const hip = `${side * 6},-40`;
    switch (this.legs()) {
      case 'run':
        return side < 0 ? `${hip} -12,-20 -20,-2` : `${hip} 10,-18 6,0`;
      case 'jump':
        return `${hip} ${side * 9},-22 ${side * 4},-6`;
      case 'wide':
        return `${hip} ${side * 16},0`;
      default:
        return `${hip} ${side * 7},0`;
    }
  }
}
