import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { QuestionDetail } from './question-detail';
import { Questions } from './questions';

describe('Pitanja i odgovori', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista šalje oblast i pretragu i prikazuje napomenu da nije pravni savet', async () => {
    const fixture = TestBed.createComponent(Questions);
    fixture.componentRef.setInput('oblast', 'ocenjivanje');
    fixture.componentRef.setInput('pretraga', 'ocene');
    fixture.detectChanges();

    http.expectOne('/api/questions?category=ocenjivanje&q=ocene').flush([
      { id: 1, slug: 'koliko-ocena', category: 'ocenjivanje', title: 'Koliko ocena?', body: null, excerpt: 'Najmanje 4.', valid_on: '2026-11-05', published_at: null },
    ]);
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Koliko ocena?');
    expect(text).toContain('važi na dan 5. 11. 2026.');
    expect(text).toContain('nisu pravni savet');
  });

  it('detalj prikazuje odgovor i propise sa linkom', async () => {
    const fixture = TestBed.createComponent(QuestionDetail);
    fixture.componentRef.setInput('slug', 'koliko-ocena');
    fixture.detectChanges();

    http.expectOne('/api/questions/koliko-ocena').flush({
      id: 1, slug: 'koliko-ocena', category: 'ocenjivanje', title: 'Koliko ocena?', body: null, excerpt: 'Najmanje 4.',
      valid_on: '2026-11-05', published_at: null, answer: 'Najmanje **4** ocene.',
      regulations: [{ key: 'ocenjivanje-os-2024', title: 'Pravilnik o ocenjivanju', gazette: '10/2024', url: 'https://example.com/p' }],
    });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.answer strong')?.textContent).toBe('4');
    expect(element.querySelector('.regulation-refs a')?.getAttribute('href')).toBe('https://example.com/p');
  });
});
