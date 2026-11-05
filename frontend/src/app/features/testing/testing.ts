import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Icon } from '../../shared/icon/icon';
import { TestPictureView } from './test-picture';
import { BATTERIES, BatteryGuide, REFERENCE_TABLES } from './testing-content';

@Component({
  selector: 'app-testing',
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, Icon, TestPictureView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../sports/basketball/basketball-rules.scss', './testing.scss'],
  templateUrl: './testing.html',
  host: { class: 'rules-scope rules-testing' },
})
export class Testing {
  protected readonly batteries = BATTERIES;
  protected readonly batteryId = signal<BatteryGuide['id']>('zdravitas');
  protected readonly battery = computed(() => this.batteries.find((item) => item.id === this.batteryId()) ?? this.batteries[0]);
  protected readonly references = computed(() => REFERENCE_TABLES.filter((table) => table.battery === this.batteryId()));

  protected selectBattery(id: BatteryGuide['id']): void {
    this.batteryId.set(id);
  }

  protected print(): void {
    window.print();
  }

  protected range(values: [number, number]): string {
    return `${this.format(values[0])} – ${this.format(values[1])}`;
  }

  private format(value: number): string {
    return value.toLocaleString('sr-Latn-RS', { maximumFractionDigits: 2 });
  }
}
