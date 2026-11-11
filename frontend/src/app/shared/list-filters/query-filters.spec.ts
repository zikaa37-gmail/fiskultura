import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { DeleteService } from '../../core/delete.service';
import { NotificationService } from '../../core/notification.service';
import { ConfirmService } from '../confirm-dialog/confirm-dialog';
import { matchesSearch, queryFilters } from './query-filters';

describe('Filteri u adresi i brisanje', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('pretraga ne pazi na velika slova i prazan pojam prolazi sve', () => {
    expect(matchesSearch('  zosov ', ['Zakon (ZOSOV)', null])).toBe(true);
    expect(matchesSearch('ishodi', ['Zakon', undefined])).toBe(false);
    expect(matchesSearch('', [null])).toBe(true);
  });

  it('vrednosti dolaze iz query parametara, a izmena ih upisuje i briše', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/?vrsta=zakon&strana=2');
    const filters = runInInjectionContext(TestBed.inject(Injector), () => queryFilters(['vrsta', 'pretraga']));
    expect(filters.values()).toEqual({ vrsta: 'zakon', pretraga: '' });

    await filters.set({ key: 'pretraga', value: 'ishodi' });
    expect(router.url).toBe('/?vrsta=zakon&strana=2&pretraga=ishodi');

    await filters.set({ key: 'vrsta', value: '' });
    expect(router.url).toBe('/?strana=2&pretraga=ishodi');

    await filters.clear();
    expect(router.url).toBe('/');
  });

  it('brisanje ide na API tek posle potvrde i javlja poruku', () => {
    const confirm = { confirm: vi.fn().mockReturnValueOnce(of(false)).mockReturnValueOnce(of(true)) };
    const notifications = { show: vi.fn() };
    TestBed.overrideProvider(ConfirmService, { useValue: confirm });
    TestBed.overrideProvider(NotificationService, { useValue: notifications });
    const http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(DeleteService);
    const done = vi.fn();
    const request = { title: 'Brisanje', message: 'Obrisati?', url: '/api/admin/x/1' };

    service.confirmDelete(request, done);
    http.expectNone('/api/admin/x/1');

    service.confirmDelete(request, done);
    http.expectOne({ method: 'DELETE', url: '/api/admin/x/1' }).flush({ message: 'Obrisano sa servera.' });
    expect(notifications.show).toHaveBeenCalledWith('Obrisano sa servera.');
    expect(done).toHaveBeenCalledTimes(1);
  });
});
