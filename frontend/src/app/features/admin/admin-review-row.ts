import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { formatDate } from '../../core/content/content.model';
import { RegulationReview } from '../../core/content/regulation.model';

@Component({
  selector: 'app-admin-review-row',
  imports: [RouterLink, BUTTON_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let item = regulation();
    <div class="admin-row" [class.admin-row-due]="item.change_detected_at">
      <div class="admin-row-main">
        <span class="admin-row-meta">
          @if (item.change_detected_at) {
            <span class="state-chip state-warn">izmena u PIS-u</span>
          } @else {
            <span class="state-chip state-muted">{{ item.checked_at ? 'provera istekla' : 'nije proveren' }}</span>
          }
          @if (item.checked_at) {
            <span>provereno {{ date(item.checked_at) }}{{ item.checked_by ? ', ' + item.checked_by : '' }}</span>
          }
        </span>
        <a class="post-title" [routerLink]="['/admin/propisi', item.key]">{{ item.title }}</a>
        @if (item.change_detail) {
          <span class="small">{{ item.change_detail }}</span>
        }
      </div>
      <div class="admin-row-actions">
        @if (item.url) {
          <a mat-button theme="tertiary" [href]="item.url" target="_blank" rel="noopener">Tekst</a>
        }
        <button type="button" mat-flat-button theme="tertiary" (click)="checked.emit(item)">Provereno</button>
      </div>
    </div>
  `,
})
export class AdminReviewRow {
  readonly regulation = input.required<RegulationReview>();
  readonly checked = output<RegulationReview>();

  protected date(value: string | null): string {
    return formatDate(value);
  }
}
