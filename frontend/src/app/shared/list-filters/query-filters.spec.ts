import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { DeleteService } from '../../core/delete.service';
import { NotificationService } from '../../core/notification.service';
import { ConfirmService } from '../confirm-dialog/confirm-dialog';
import { ListFilters } from './list-filters';
import { matchesSearch, queryFilters } from './query-filters';
import { SEARCH_DELAY } from './search-input';

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

  it('pretraga se šalje sama posle pauze u kucanju, a Enter odmah', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    try {
      const fixture = TestBed.createComponent(ListFilters);
      fixture.componentRef.setInput('fields', [{ key: 'pretraga', label: 'Pretraga', type: 'search' }]);
      const changes: string[] = [];
      fixture.componentInstance.filterChange.subscribe((change) => {
        changes.push(change.value);
        fixture.componentRef.setInput('values', { pretraga: change.value });
      });
      fixture.detectChanges();
      const list = fixture.componentInstance as unknown as { setDraft(key: string, value: string): void; submitSearch(key: string): void; drafts(): Record<string, string> };

      list.setDraft('pretraga', 'beo');
      vi.advanceTimersByTime(SEARCH_DELAY - 50);
      list.setDraft('pretraga', 'beo ');
      vi.advanceTimersByTime(SEARCH_DELAY - 50);
      expect(changes).toEqual([]);
      vi.advanceTimersByTime(50);
      expect(changes).toEqual(['beo']);
      fixture.detectChanges();
      expect(list.drafts()['pretraga']).toBe('beo ');

      list.setDraft('pretraga', 'beo grad');
      list.submitSearch('pretraga');
      expect(changes).toEqual(['beo', 'beo grad']);
      vi.advanceTimersByTime(SEARCH_DELAY);
      expect(changes).toEqual(['beo', 'beo grad']);
    } finally {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  });
});
