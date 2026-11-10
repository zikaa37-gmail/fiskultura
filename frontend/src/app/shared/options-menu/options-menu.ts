import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from '../icon/icon';

export interface MenuOption<T extends string = string> {
  value: T;
  label: string;
  icon?: IconName;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  link?: string | (string | number)[];
  newTab?: boolean;
}

@Component({
  selector: 'app-option-label',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'option-label' },
  template: `
    @if (option().icon; as icon) {
      <app-icon [name]="icon" [size]="20" />
    }
    <span>{{ option().label }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class OptionLabel {
  readonly option = input.required<MenuOption>();
}

@Component({
  selector: 'app-options-menu',
  imports: [BUTTON_IMPORTS, MatDividerModule, MatMenuModule, RouterLink, Icon, OptionLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" mat-icon-button [matMenuTriggerFor]="menu" [attr.aria-label]="label()" [title]="label()">
      <app-icon name="more-vert" />
    </button>
    <mat-menu #menu="matMenu" xPosition="before" class="row-actions-menu">
      @for (option of options(); track option.value) {
        @if (option.dividerBefore && !$first) {
          <mat-divider />
        }
        @if (option.link) {
          <a mat-menu-item [routerLink]="option.link" [attr.target]="option.newTab ? '_blank' : null" [class.row-action-danger]="option.danger" [disabled]="!!option.disabled">
            <app-option-label [option]="option" />
          </a>
        } @else {
          <button type="button" mat-menu-item [class.row-action-danger]="option.danger" [disabled]="!!option.disabled" (click)="selected.emit(option.value)">
            <app-option-label [option]="option" />
          </button>
        }
      }
    </mat-menu>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .mat-mdc-icon-button {
      width: 44px;
      height: 44px;
      padding: 10px;
    }
  `,
})
export class OptionsMenu<T extends string = string> {
  readonly options = input.required<MenuOption<T>[]>();
  readonly label = input('Opcije');
  readonly selected = output<T>();
}
