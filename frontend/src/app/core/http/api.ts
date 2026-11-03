import { HttpErrorResponse } from '@angular/common/http';

export const API_URL = '/api';

export function apiErrorMessage(error: unknown, fallback = 'Nešto nije u redu. Pokušajte ponovo.'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  const errors = error.error?.errors as Record<string, string[]> | undefined;
  const first = errors ? Object.values(errors)[0]?.[0] : undefined;
  if (first) {
    return first;
  }
  if (error.status === 0) {
    return 'Server nije dostupan. Proverite vezu.';
  }
  if (error.status === 429) {
    return 'Previše pokušaja. Sačekajte minut pa pokušajte ponovo.';
  }
  return (error.error?.message as string | undefined) ?? fallback;
}
