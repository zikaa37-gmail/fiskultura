import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { InboxService } from '../../core/inbox/inbox.service';
import { NotificationsPage } from './notifications-page';

describe('Notifikacije', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('prikazuje kanal i nepročitano, a klik označava kao pročitano i vodi na stranicu', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(NotificationsPage);
    fixture.detectChanges();

    http.expectOne('/api/me/notifications?page=1').flush({
      data: [
        { id: 3, kind: 'debate_post', title: 'Novi prilog u debati: Administracija', body: 'Ana: Dnevnik vodim duplo.', url: '/debate/administracija', channels: ['mail'], read: false, created_at: '2026-11-11T10:00:00Z' },
        { id: 2, kind: 'question_answered', title: 'Objavljen je odgovor na vaše pitanje', body: null, url: '/pitanja/norma', channels: ['mail'], read: true, created_at: '2026-11-10T10:00:00Z' },
      ],
      meta: { current_page: 1, last_page: 1, total: 2 },
      unread: 1,
    });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(InboxService).unread()).toBe(1);
    expect(element.querySelectorAll('.inbox-item-unread').length).toBe(1);
    expect(element.textContent).toContain('mejl');
    expect(element.textContent).toContain('Označi sve kao pročitano');

    (element.querySelector('.inbox-item-unread .inbox-open') as HTMLButtonElement).click();
    const read = http.expectOne('/api/me/notifications/read');
    expect(read.request.body).toEqual({ ids: [3] });
    read.flush({ unread: 0 });
    expect(navigate).toHaveBeenCalledWith('/debate/administracija');
    expect(TestBed.inject(InboxService).unread()).toBe(0);
  });

  it('jedna notifikacija se označava kao pročitana bez otvaranja', async () => {
    const fixture = TestBed.createComponent(NotificationsPage);
    const http = TestBed.inject(HttpTestingController);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fixture.detectChanges();
    http.expectOne('/api/me/notifications?page=1').flush({
      data: [{ id: 5, kind: 'debate_post', title: 'Prilog', body: null, url: '/debate/x', channels: ['mail'], read: false, created_at: '2026-11-11T10:00:00Z' }],
      meta: { current_page: 1, last_page: 1, total: 1 },
      unread: 1,
    });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('.inbox-read') as HTMLButtonElement).click();
    http.expectOne('/api/me/notifications/read').flush({ unread: 0 });
    await fixture.whenStable();
    expect(navigate).not.toHaveBeenCalled();
    expect(element.querySelectorAll('.inbox-item-unread').length).toBe(0);
  });
});
