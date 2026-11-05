import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Icon } from '../../shared/icon/icon';
import { TestPictureView } from '../testing/test-picture';
import { CROSS_SECTIONS } from './cross-content';

@Component({
  selector: 'app-cross',
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, Icon, TestPictureView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../sports/basketball/basketball-rules.scss', '../testing/testing.scss'],
  templateUrl: './cross.html',
  host: { class: 'rules-scope rules-testing' },
})
export class Cross {
  protected readonly sections = CROSS_SECTIONS;
  protected readonly sectionId = signal(CROSS_SECTIONS[0].id);
  protected readonly section = computed(() => this.sections.find((item) => item.id === this.sectionId()) ?? this.sections[0]);

  protected selectSection(id: string): void {
    this.sectionId.set(id);
  }

  protected print(): void {
    window.print();
  }
}
