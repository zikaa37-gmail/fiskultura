import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NotificationsPage } from './notifications';
import { SubscriptionLink } from './subscription-link';

describe('Obaveštenja', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('prijava bez naloga šalje mejl i izabrane kategorije', async () => {
    const fixture = TestBed.createComponent(NotificationsPage);
    fixture.detectChanges();
    http.expectOne('/api/organizations').flush([]);

    const page = fixture.componentInstance as unknown as {
      email: { set(value: string): void };
      toggleCategory(category: string): void;
      save(): void;
    };
    page.email.set('nastavnik@primer.rs');
    page.toggleCategory('seminar');
    page.save();

    const request = http.expectOne('/api/subscriptions');
    expect(request.request.body).toEqual({ email: 'nastavnik@primer.rs', frequency: 'weekly', categories: ['seminar'], organization_ids: [] });
    request.flush({ message: 'Proverite mejl.' });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Proverite mejl.');
  });

  it('link iz mejla učitava podešavanja preko tokena', async () => {
    const fixture = TestBed.createComponent(NotificationsPage);
    fixture.componentRef.setInput('id', '7');
    fixture.componentRef.setInput('token', 'abc');
    fixture.detectChanges();
    http.expectOne('/api/organizations').flush([]);

    const request = http.expectOne('/api/subscriptions/manage');
    expect(request.request.body).toEqual({ id: 7, token: 'abc' });
    request.flush({ email: 'p@primer.rs', frequency: 'instant', categories: [], organization_ids: [], confirmed: true, active: true });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('p@primer.rs');
    expect(fixture.nativeElement.textContent).toContain('Isključi obaveštenja');
  });

  it('odjava jednim klikom nudi ponovno uključivanje', async () => {
    const fixture = TestBed.createComponent(SubscriptionLink);
    fixture.componentRef.setInput('action', 'unsubscribe');
    fixture.componentRef.setInput('id', '7');
    fixture.componentRef.setInput('token', 'xyz');
    fixture.detectChanges();

    http.expectOne('/api/subscriptions/unsubscribe').flush({
      email: 'p@primer.rs', frequency: 'weekly', categories: [], organization_ids: [], confirmed: true, active: false, id: 7, manage_token: 'm',
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Odjavljeni ste');
    expect(fixture.nativeElement.textContent).toContain('Uključi ponovo');
  });

  afterEach(() => http.verify());
});
