import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from '../icon/icon';
import { ModuleAccent, ModuleStatus } from '../../content/portal-content';

@Component({
  selector: 'app-module-card',
  imports: [NgTemplateOutlet, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #body>
      <span class="module-icon"><app-icon [name]="icon()" [size]="26" /></span>
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
      <span class="status" [class.status-next]="status() !== 'soon'">{{ statusLabel() }}</span>
    </ng-template>

    @if (route(); as path) {
      <a class="module module-link" [class]="'accent-' + accent()" [routerLink]="path">
        <ng-container [ngTemplateOutlet]="body" />
      </a>
    } @else if (href(); as url) {
      <a class="module module-link" [class]="'accent-' + accent()" [href]="url" target="_blank" rel="noopener">
        <ng-container [ngTemplateOutlet]="body" />
      </a>
    } @else {
      <article class="module" [class]="'accent-' + accent()">
        <ng-container [ngTemplateOutlet]="body" />
      </article>
    }
  `,
})
export class ModuleCard {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input.required<IconName>();
  readonly accent = input<ModuleAccent>('primary');
  readonly status = input<ModuleStatus>('soon');
  readonly statusLabel = input.required<string>();
  readonly route = input<string>();
  readonly href = input<string>();
}
