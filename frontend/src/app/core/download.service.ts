import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { busyContext } from './http/busy';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  readonly #http = inject(HttpClient);

  file(url: string, fileName: string, params: Record<string, string | number> = {}): Observable<void> {
    return this.#http.get(url, { params: new HttpParams({ fromObject: params }), responseType: 'blob', context: busyContext('Pripremam fajl…') }).pipe(
      map((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }),
    );
  }
}
