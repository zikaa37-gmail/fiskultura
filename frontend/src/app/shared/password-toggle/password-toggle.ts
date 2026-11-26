import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-password-toggle',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="password-toggle" [attr.aria-label]="visible() ? 'Sakrij lozinku' : 'Prikaži lozinku'" [attr.aria-pressed]="visible()" (click)="toggle()">
      <app-icon [name]="visible() ? 'eye-slash' : 'eye'" [size]="20" />
    </button>
  `,
})
export class PasswordToggle {
  readonly input = input.required<HTMLInputElement>();

  protected readonly visible = signal(false);

  protected toggle(): void {
    const next = !this.visible();
    this.visible.set(next);
    this.input().type = next ? 'text' : 'password';
  }
}
