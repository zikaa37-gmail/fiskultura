import { HttpClient } from '@angular/common/http';
import { aiBusy } from '../../core/http/busy';
import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../../core/http/api';
import { FacilityReport } from './facility.model';

export type ReportScope = Record<string, string>;

interface ReportState {
  report: FacilityReport | null;
  loaded: boolean;
}

@Injectable({ providedIn: 'root' })
export class FacilityReportStore {
  readonly #http = inject(HttpClient);
  readonly #reports = new Map<string, WritableSignal<ReportState>>();

  state(scope: ReportScope): Signal<ReportState> {
    return this.#slot(scope).asReadonly();
  }

  loadLatest(scope: ReportScope): void {
    const slot = this.#slot(scope);
    if (slot().loaded) {
      return;
    }
    this.#http
      .get<FacilityReport | null>(`${API_URL}/institutions/reports/latest`, { params: scope })
      .subscribe((report) => slot.set({ report: report && 'id' in report ? report : null, loaded: true }));
  }

  generate(scope: ReportScope): Observable<FacilityReport> {
    return this.#http
      .post<FacilityReport>(`${API_URL}/admin/institutions/reports`, scope, { context: aiBusy() })
      .pipe(tap((report) => this.#slot(scope).set({ report, loaded: true })));
  }

  #slot(scope: ReportScope): WritableSignal<ReportState> {
    const key = JSON.stringify(Object.entries(scope).sort());
    let slot = this.#reports.get(key);
    if (!slot) {
      slot = signal<ReportState>({ report: null, loaded: false });
      this.#reports.set(key, slot);
    }
    return slot;
  }
}
