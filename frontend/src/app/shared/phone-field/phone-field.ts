import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { formatPhone, isValidPhone } from '../../core/phone';

@Component({
  selector: 'app-phone-field',
  imports: [FORM_FIELD_IMPORTS, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      <input
        #field
        matInput
        type="tel"
        inputmode="tel"
        maxlength="40"
        autocomplete="tel"
        placeholder="+381 60 1234567"
        [value]="value()"
        (input)="value.set(field.value)"
        (blur)="normalize()"
      />
      @if (invalid()) {
        <mat-hint class="danger-text">Broj nije ispravan. Upišite npr. 060 1234567.</mat-hint>
      } @else {
        <mat-hint>Čuva se kao +381 60 1234567, da može da se pozove sa mobilnog.</mat-hint>
      }
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }
    mat-form-field {
      width: 100%;
    }
  `,
})
export class PhoneField {
  readonly value = model('');
  readonly label = input('Telefon');

  protected readonly invalid = computed(() => !isValidPhone(this.value()));

  protected normalize(): void {
    const formatted = formatPhone(this.value());
    if (formatted) {
      this.value.set(formatted);
    }
  }
}
