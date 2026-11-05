import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GymnasticsPose, GymnasticsPoseName, GymnasticsPoseRole } from './rules-content';

const STAND_LEGS = 'M0 -40 L0 -20 L0 0 M0 -40 L2 -20 L3 0';
const STAND_TORSO = 'M0 -42 L0 -70';
const STEP_LEGS = 'M0 -40 L6 -20 L10 0 M0 -40 L-4 -20 L-8 0';

const POSES: Record<GymnasticsPoseName, GymnasticsPose> = {
  stand: { head: [1, -80], torso: STAND_TORSO, legs: STAND_LEGS, arms: 'M0 -68 L2 -54 L3 -42' },
  'stand-up': { head: [1, -80], torso: STAND_TORSO, legs: STAND_LEGS, arms: 'M0 -68 L1 -84 L2 -98' },
  squat: { head: [16, -50], torso: 'M-6 -24 L8 -44', legs: 'M-6 -24 L10 -18 L0 0', arms: 'M8 -42 L18 -24 L24 0' },
  rock: { head: [-22, -18], torso: 'M-14 -10 Q-4 -2 6 -10', legs: 'M6 -10 L-2 -32 L12 -34', arms: 'M-12 -14 L-4 -24 L0 -30' },
  'roll-tuck': { head: [-6, -12], torso: 'M0 -6 L8 -28', legs: 'M8 -28 L22 -26 L20 -10', arms: 'M0 -8 L-10 -4 L-18 0' },
  'roll-head': { head: [0, -8], torso: 'M2 -16 L6 -46', legs: 'M6 -46 L18 -58 L28 -52', arms: 'M2 -18 L-8 -10 L-12 0' },
  'squat-hands-up': { head: [10, -54], torso: 'M-4 -24 L4 -48', legs: 'M-4 -24 L8 -16 L0 0', arms: 'M4 -46 L10 -54 L6 -62' },
  'back-roll': { head: [8, -12], torso: 'M0 -8 L-4 -34', legs: 'M-4 -34 L-20 -36 L-26 -22', arms: 'M0 -8 L4 -22 L12 0' },
  kneel: { head: [4, -66], torso: 'M0 -26 L2 -56', legs: 'M0 -26 L-2 -2 L-22 0', arms: 'M2 -54 L4 -40 L6 -28' },
  'lie-back': { head: [-34, -8], torso: 'M-26 -6 L4 -6', legs: 'M4 -6 L16 -26 L22 0', arms: 'M-24 -8 L-28 -26 L-36 -4' },
  'candle-tuck': { head: [-12, -8], torso: 'M-2 -6 L6 -30', legs: 'M6 -30 L-8 -36 L-6 -52', arms: 'M-2 -6 L10 -6 L8 -22' },
  candle: { head: [-12, -8], torso: 'M-2 -6 L2 -38', legs: 'M2 -38 L3 -62 L4 -86', arms: 'M-2 -6 L10 -6 L6 -26' },
  'candle-bad': { head: [-12, -8], torso: 'M-2 -6 L12 -30', legs: 'M12 -30 L-2 -46 L-16 -58', arms: 'M-2 -6 L10 -6 L12 -24' },
  bridge: { head: [-36, -30], torso: 'M-22 -38 Q-4 -62 14 -40', legs: 'M14 -40 L26 -22 L28 0', arms: 'M-22 -38 L-27 -18 L-30 0' },
  'bridge-bad': { head: [-22, -12], torso: 'M-16 -22 Q0 -46 14 -34', legs: 'M14 -34 L26 -18 L28 0', arms: 'M-16 -22 L-32 -14 L-30 0' },
  handstand: { head: [7, -22], torso: 'M0 -32 L0 -64', legs: 'M0 -64 L0 -84 L0 -104 M0 -64 L1 -84 L2 -104', arms: 'M0 0 L0 -32' },
  'handstand-bad': { head: [9, -16], torso: 'M2 -26 Q-10 -44 2 -58', legs: 'M2 -58 L14 -74 L26 -84', arms: 'M0 0 L-8 -12 L2 -26' },
  plank: { head: [9, -29], torso: 'M0 -24 L-32 -16', legs: 'M-32 -16 L-50 -9 L-68 -2', arms: 'M0 0 L0 -24' },
  cartwheel: { head: [0, -22], torso: 'M-10 -32 L10 -32 M0 -32 L0 -62', legs: 'M0 -62 L-18 -82 L-34 -100 M0 -62 L18 -82 L34 -100', arms: 'M-10 -32 L-12 0 M10 -32 L12 0' },
  'cartwheel-bad': { head: [0, -22], torso: 'M-10 -32 L10 -32 M0 -32 L0 -56', legs: 'M0 -56 L-20 -64 L-40 -62 M0 -56 L-18 -70 L-34 -80', arms: 'M-10 -32 L-12 0 M10 -32 L12 0' },
  'one-foot': { head: [6, -80], torso: 'M0 -40 L4 -70', legs: 'M0 -40 L2 -20 L3 0 M0 -40 L-12 -26 L-26 -30', arms: 'M4 -68 L16 -76 L26 -82' },
  landing: { head: [9, -70], torso: 'M-4 -32 L4 -60', legs: 'M-4 -32 L10 -18 L0 0 M-4 -32 L12 -16 L4 0', arms: 'M4 -58 L18 -60 L32 -62' },
  'landing-bad': { head: [-10, -80], torso: 'M0 -42 L-8 -70', legs: STAND_LEGS, arms: 'M-8 -68 L-18 -80 L-24 -94' },
  'vault-tuck': { head: [11, -32], torso: 'M2 -26 L-12 -38', legs: 'M-12 -38 L6 -46 L4 -30', arms: 'M0 0 L2 -26' },
  'vault-straddle': { head: [13, -32], torso: 'M4 -26 L-8 -36', legs: 'M-8 -36 L12 -46 L32 -50 M-8 -36 L12 -34 L32 -28', arms: 'M0 0 L4 -26' },
  'vault-hook': { head: [11, -28], torso: 'M2 -24 L-16 -22', legs: 'M-16 -22 L-24 -10 L-20 6', arms: 'M0 0 L2 -24' },
  'hang-knees': { head: [7, 32], torso: 'M0 26 L0 56', legs: 'M0 56 L20 52 L20 72', arms: 'M0 0 L0 26' },
  support: { head: [6, -38], torso: 'M1 -28 L-2 4', legs: 'M-2 4 L-3 28 L-4 52', arms: 'M0 0 L1 -28' },
  'support-bad': { head: [3, -25], torso: 'M0 -16 L-2 14', legs: 'M-2 14 L-3 38 L-4 60', arms: 'M0 0 L-10 -8 L0 -16' },
  swing: { head: [6, -38], torso: 'M1 -28 L10 2', legs: 'M10 2 L18 26 L26 48', arms: 'M0 0 L1 -28' },
  'swing-bad': { head: [6, -38], torso: 'M1 -28 L-2 2', legs: 'M-2 2 L20 10 L42 14', arms: 'M0 0 L1 -28' },
  'rings-inverted': { head: [0, 40], torso: 'M0 30 L0 -2', legs: 'M0 -2 L0 -26 L0 -50 M0 -2 L1 -26 L2 -50', arms: 'M0 30 L-6 0' },
  'rings-tuck': { head: [0, 38], torso: 'M0 28 L8 6', legs: 'M8 6 L-8 -4 L-12 14', arms: 'M0 28 L-6 0' },
  'rings-bad': { head: [0, 28], torso: 'M0 18 L0 -10', legs: 'M0 -10 L6 -32 L14 -54 M0 -10 L-6 -32 L-14 -54', arms: 'M0 18 L-14 10 L-6 0' },
  'beam-walk': { head: [2, -80], torso: STAND_TORSO, legs: STEP_LEGS, arms: 'M-16 -66 L0 -68 L16 -66' },
  'beam-look-down': { head: [16, -72], torso: 'M0 -42 L8 -68', legs: STEP_LEGS, arms: 'M8 -66 L10 -52 L12 -40' },
  'tuck-jump': { head: [4, -80], torso: 'M0 -40 L2 -70', legs: 'M0 -40 L12 -46 L6 -30', arms: 'M2 -68 L14 -78 L20 -90' },
  'kneel-spot': { head: [4, -70], torso: 'M0 -30 L2 -60', legs: 'M0 -30 L14 -26 L14 0 M0 -30 L-4 -2 L-20 0', arms: 'M2 -58 L14 -52 L24 -46' },
  'spot-forward': { head: [1, -80], torso: STAND_TORSO, legs: STAND_LEGS, arms: 'M0 -68 L12 -64 L22 -60' },
  'spot-up': { head: [1, -80], torso: STAND_TORSO, legs: STAND_LEGS, arms: 'M0 -68 L10 -80 L18 -92' },
  'spot-low': { head: [16, -74], torso: 'M0 -40 L10 -66', legs: 'M0 -40 L-2 -20 L0 0 M0 -40 L6 -20 L8 0', arms: 'M10 -64 L20 -54 L28 -44' },
};

@Component({
  selector: 'svg:g[appGymnasticsPose]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.transform]': 'transform()',
    '[attr.class]': "'rp-gy-pose rp-gy-pose-' + role()",
  },
  template: `
    @let body = data();
    <svg:path class="rp-gy-legs" [attr.d]="body.legs" />
    <svg:path class="rp-gy-torso" [attr.d]="body.torso" />
    <svg:path class="rp-gy-arms" [attr.d]="body.arms" />
    <svg:circle class="rp-gy-head" [attr.cx]="body.head[0]" [attr.cy]="body.head[1]" r="8" />
  `,
})
export class GymnasticsRulePose {
  readonly pose = input.required<GymnasticsPoseName>();
  readonly x = input(0);
  readonly y = input(0);
  readonly scale = input(1);
  readonly flip = input(false);
  readonly role = input<GymnasticsPoseRole>('us');

  readonly data = computed(() => POSES[this.pose()]);
  readonly transform = computed(() => `translate(${this.x()} ${this.y()}) scale(${this.flip() ? -this.scale() : this.scale()} ${this.scale()})`);
}
