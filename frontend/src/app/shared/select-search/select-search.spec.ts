import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { By } from '@angular/platform-browser';
import { isCustomValue, SelectSearch, SelectSearchValue } from './select-search';

@Component({
  imports: [ReactiveFormsModule, SelectSearch],
  template: `<app-select-search inputId="tema" [formControl]="control" [options]="options" emptyLabel="Nije izabrana" [allowCustom]="true" customLabel="Nova tema" />`,
})
class Host {
  readonly control = new FormControl<SelectSearchValue<number>>(1);
  readonly options = [
    { value: 1, label: 'Skijanje i ski centri' },
    { value: 2, label: 'Spasilaštvo i plivanje' },
  ];
}

describe('SelectSearch', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    const trigger = fixture.debugElement.query(By.directive(MatAutocompleteTrigger)).injector.get(MatAutocompleteTrigger);
    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      trigger.openPanel();
      await fixture.whenStable();
    };
    const options = () => Array.from(document.querySelectorAll('mat-option')) as HTMLElement[];
    return { fixture, input, type, options };
  }

  it('shows the label of the chosen value and narrows the list while typing, ignoring diacritics', async () => {
    const { input, type, options } = await setup();
    expect(input.value).toBe('Skijanje i ski centri');

    await type('spasilas');
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Nije izabrana', 'Spasilaštvo i plivanje', 'Nova tema: „spasilas”']);
  });

  it('offers the typed text as a new item at the bottom and writes it to the form', async () => {
    const { fixture, input, type, options } = await setup();

    await type('Plivanje u školi');
    const last = options().at(-1)!;
    expect(last.textContent?.trim()).toBe('Nova tema: „Plivanje u školi”');
    last.click();
    await fixture.whenStable();

    const value = fixture.componentInstance.control.value;
    expect(isCustomValue(value) && value.custom).toBe('Plivanje u školi');
    expect(input.value).toBe('Plivanje u školi');
  });

  it('lets the user start a new item from the bottom option without typing first', async () => {
    const { fixture, input, type, options } = await setup();
    await type('');
    const last = options().at(-1)!;
    expect(last.textContent?.trim()).toBe('Upiši novu stavku');
    expect(last.getAttribute('aria-disabled')).toBe('false');
    last.click();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Upiši naziv');
    expect(fixture.componentInstance.control.value).toBe(1);

    await type('Odbojka na pesku');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    const value = fixture.componentInstance.control.value;
    expect(isCustomValue(value) && value.custom).toBe('Odbojka na pesku');
  });
});
