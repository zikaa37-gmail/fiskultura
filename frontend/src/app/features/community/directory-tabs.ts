import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';

export type DirectoryTab = 'kolege' | 'osnovne' | 'srednje' | 'fakulteti' | 'institucije';

export const DIRECTORY_TABS: { id: DirectoryTab; label: string; link: string }[] = [
  { id: 'kolege', label: 'Kolege', link: '/imenik' },
  { id: 'osnovne', label: 'Osnovne škole', link: '/imenik/osnovne-skole' },
  { id: 'srednje', label: 'Srednje škole', link: '/imenik/srednje-skole' },
  { id: 'fakulteti', label: 'Fakulteti', link: '/imenik/fakulteti' },
  { id: 'institucije', label: 'Institucije', link: '/imenik/institucije' },
];

@Component({
  selector: 'app-directory-tabs',
  imports: [MatTabsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav mat-tab-nav-bar class="directory-tabs mb-3" [tabPanel]="panel" mat-stretch-tabs="false" aria-label="Imenik">
      @for (tab of tabs; track tab.id) {
        <a mat-tab-link [routerLink]="tab.link" [active]="active() === tab.id">{{ tab.label }}</a>
      }
    </nav>
    <mat-tab-nav-panel #panel>
      <ng-content />
    </mat-tab-nav-panel>
  `,
  styles: `
    :host {
      display: block;
    }
    .directory-tabs {
      border-bottom: 1px solid var(--color-border);
    }
  `,
})
export class DirectoryTabs {
  readonly active = input.required<DirectoryTab>();
  protected readonly tabs = DIRECTORY_TABS;
}
