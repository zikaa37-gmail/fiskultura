import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, shareReplay, tap } from 'rxjs';

import { API_URL } from '../http/api';
import { MessageResponse, ProfilePayload, RegisterPayload, TokenResponse, User } from './user.model';

const ACCESS_TOKEN_KEY = 'fk_access_token';
const REFRESH_TOKEN_KEY = 'fk_refresh_token';
const USER_KEY = 'fk_user';
const SOURCE_KEY = 'fk_source';
const SOURCE_PATTERN = /^[a-z0-9-]{2,40}$/;

@Injectable({ providedIn: 'root' })
export class AuthService {
  #http = inject(HttpClient);
  #router = inject(Router);
  #apiUrl = API_URL;
  #refreshInFlight: Observable<TokenResponse> | null = null;
  #storage: Storage | null = isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null;

  #currentUser = signal<User | null>(this.#readStoredUser());
  readonly currentUser = this.#currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.#currentUser() !== null);
  readonly isAdmin = computed(() => this.#currentUser()?.role === 'admin');
  readonly isEditor = computed(() => ['editor', 'admin'].includes(this.#currentUser()?.role ?? ''));

  login(email: string, password: string): Observable<TokenResponse> {
    return this.#http
      .post<TokenResponse>(`${this.#apiUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.#storeSession(response)));
  }

  register(payload: RegisterPayload): Observable<MessageResponse> {
    return this.#http.post<MessageResponse>(`${this.#apiUrl}/auth/register`, payload).pipe(tap(() => this.#storage?.removeItem(SOURCE_KEY)));
  }

  rememberSource(value: string | null): void {
    const source = value?.trim().toLowerCase() ?? '';
    if (SOURCE_PATTERN.test(source) && !this.#storage?.getItem(SOURCE_KEY)) {
      this.#storage?.setItem(SOURCE_KEY, source);
    }
  }

  source(): string | null {
    return this.#storage?.getItem(SOURCE_KEY) ?? null;
  }

  verifyEmail(token: string): Observable<TokenResponse> {
    return this.#http
      .post<TokenResponse>(`${this.#apiUrl}/auth/verify-email`, { token })
      .pipe(tap((response) => this.#storeSession(response)));
  }

  resendVerification(email: string): Observable<MessageResponse> {
    return this.#http.post<MessageResponse>(`${this.#apiUrl}/auth/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.#http.post<MessageResponse>(`${this.#apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<MessageResponse> {
    return this.#http.post<MessageResponse>(`${this.#apiUrl}/auth/reset-password`, {
      token,
      password,
      password_confirmation: password,
    });
  }

  updateProfile(payload: ProfilePayload): Observable<User> {
    return this.#http.patch<User>(`${this.#apiUrl}/auth/me`, payload).pipe(
      tap((user) => {
        this.#storage?.setItem(USER_KEY, JSON.stringify(user));
        this.#currentUser.set(user);
      }),
    );
  }

  reloadUser(): Observable<User> {
    return this.#http.get<User>(`${this.#apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.#storage?.setItem(USER_KEY, JSON.stringify(user));
        this.#currentUser.set(user);
      }),
    );
  }

  changePassword(currentPassword: string, password: string): Observable<MessageResponse> {
    return this.#http.post<MessageResponse>(`${this.#apiUrl}/auth/change-password`, {
      current_password: currentPassword,
      password,
      password_confirmation: password,
    });
  }

  logoutAll(): Observable<MessageResponse> {
    return this.#http.post<MessageResponse>(`${this.#apiUrl}/auth/logout-all`, {}).pipe(tap(() => this.clearSession()));
  }

  exportData(): Observable<unknown> {
    return this.#http.get(`${this.#apiUrl}/me/export`);
  }

  deleteAccount(password: string): Observable<MessageResponse> {
    return this.#http.delete<MessageResponse>(`${this.#apiUrl}/auth/me`, { body: { password } }).pipe(tap(() => this.clearSession()));
  }

  refresh(): Observable<TokenResponse> {
    this.#refreshInFlight ??= this.#http
      .post<TokenResponse>(`${this.#apiUrl}/auth/refresh`, {
        refresh_token: this.refreshToken(),
      })
      .pipe(
        tap({
          next: (response) => this.#storeSession(response),
          finalize: () => (this.#refreshInFlight = null),
        }),
        shareReplay(1),
      );

    return this.#refreshInFlight;
  }

  logout(): void {
    const refreshToken = this.refreshToken();
    this.clearSession();
    this.#http
      .post(`${this.#apiUrl}/auth/logout`, { refresh_token: refreshToken })
      .subscribe({ error: () => undefined });
  }

  clearSession(): void {
    this.#storage?.removeItem(ACCESS_TOKEN_KEY);
    this.#storage?.removeItem(REFRESH_TOKEN_KEY);
    this.#storage?.removeItem(USER_KEY);
    this.#currentUser.set(null);
    this.#router.navigate(['/prijava']);
  }

  accessToken(): string | null {
    return this.#storage?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  refreshToken(): string | null {
    return this.#storage?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  #storeSession(response: TokenResponse): void {
    this.#storage?.setItem(ACCESS_TOKEN_KEY, response.access_token);
    this.#storage?.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    this.#storage?.setItem(USER_KEY, JSON.stringify(response.user));
    this.#currentUser.set(response.user);
  }

  #readStoredUser(): User | null {
    const stored = this.#storage?.getItem(USER_KEY);
    if (!stored || !this.#storage?.getItem(REFRESH_TOKEN_KEY)) {
      return null;
    }
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
}
