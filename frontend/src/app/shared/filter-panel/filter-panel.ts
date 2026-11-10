import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EXPANSION_IMPORTS } from '../../../theme/ui/expansion';

@Component({
  selector: 'app-filter-panel',
  imports: [EXPANSION_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'filter-panel' },
  template: `
    <mat-expansion-panel [expanded]="expanded()" (opened)="expanded.set(true)" (closed)="expanded.set(false)">
      <mat-expansion-panel-header>
        <mat-panel-title>{{ title() }}</mat-panel-title>
        <mat-panel-description>{{ summary() }}</mat-panel-description>
      </mat-expansion-panel-header>
      <div class="filter-panel-grid">
        <ng-content />
      </div>
    </mat-expansion-panel>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class FilterPanel {
  readonly title = input('Filteri');
  readonly summary = input('');

  protected readonly expanded = signal(isPlatformBrowser(inject(PLATFORM_ID)) && window.matchMedia('(min-width: 900px)').matches);
}
