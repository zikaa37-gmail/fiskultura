import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { MEMBER_STATUS_LABELS, MEMBER_STATUSES, MemberStatus, ROLE_LABELS, User } from '../../core/auth/user.model';
import { apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DISTRICTS } from '../../content/districts';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        @if (auth.currentUser(); as user) {
          <form class="auth-card" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <span class="status status-next">{{ roleLabels[user.role] }}</span>
            <h1>Moj profil</h1>
            <p class="muted">{{ user.email }}</p>
            <mat-form-field appearance="outline">
              <mat-label>Ime i prezime</mat-label>
              <input matInput formControlName="name" autocomplete="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Ja sam</mat-label>
              <mat-select formControlName="member_status">
                <mat-option value="">—</mat-option>
                @for (status of statuses; track status) {
                  <mat-option [value]="status">{{ statusLabels[status] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Škola ili fakultet</mat-label>
              <input matInput formControlName="school" />
            </mat-form-field>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Opština / grad</mat-label>
                <input matInput formControlName="municipality" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Okrug</mat-label>
                <mat-select formControlName="district">
                  <mat-option value="">—</mat-option>
                  @for (district of districts; track district) {
                    <mat-option [value]="district">{{ district }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <h2>Saglasnosti</h2>
            <p class="small muted">Svaku možeš da isključiš kad hoćeš. Bez saglasnosti tvoji podaci ostaju samo uredništvu.</p>
            <mat-checkbox formControlName="directory_consent">
              Prikaži me u imeniku struke
              <span class="small muted consent-note">Ime, status, škola, opština i okrug, vidljivo samo članovima koji su i sami u imeniku. Mejl se ne prikazuje.</span>
            </mat-checkbox>
            <mat-checkbox formControlName="surveys_consent">
              Pozivaj me na ankete i inicijative struke
              <span class="small muted consent-note">Povremeni mejl kad struka treba da kaže svoje mišljenje.</span>
            </mat-checkbox>
            <button type="submit" mat-flat-button [disabled]="busy()">Sačuvaj</button>
          </form>

          <div class="auth-card">
            <h2>Struka</h2>
            <div class="profile-links">
              <a mat-flat-button class="btn-tertiary" routerLink="/imenik">Imenik struke</a>
              <a mat-flat-button class="btn-tertiary" routerLink="/obavestenja">Moja obaveštenja</a>
              <a mat-flat-button class="btn-tertiary" routerLink="/pitanja/postavi">Postavi pitanje</a>
            </div>
          </div>

          <form class="auth-card" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <h2>Promena lozinke</h2>
            <mat-form-field appearance="outline">
              <mat-label>Trenutna lozinka</mat-label>
              <input matInput type="password" formControlName="current" autocomplete="current-password" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nova lozinka</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              <mat-hint>Najmanje 8 znakova</mat-hint>
            </mat-form-field>
            <button type="submit" mat-stroked-button [disabled]="busy()">Promeni lozinku</button>
          </form>

          <div class="auth-card">
            <h2>Nalog i podaci</h2>
            <p class="small muted">Na ovom uređaju ostaješ prijavljen dok koristiš portal. Ako si se prijavio na tuđem računaru, odjavi se sa svih uređaja.</p>
            <div class="profile-links">
              <button type="button" mat-stroked-button (click)="auth.logout()">Odjavi se</button>
              <button type="button" mat-stroked-button [disabled]="busy()" (click)="logoutAll()">Odjavi se sa svih uređaja</button>
              <button type="button" mat-button class="btn-tertiary-text" [disabled]="busy()" (click)="exportData()">Preuzmi moje podatke</button>
            </div>
            <details class="profile-delete">
              <summary>Obriši nalog</summary>
              <form [formGroup]="deleteForm" (ngSubmit)="deleteAccount()">
                <p class="small">Brišu se nalog, profil i prijava na obaveštenja. Objavljena pitanja ostaju, bez veze sa tobom.</p>
                <mat-form-field appearance="outline">
                  <mat-label>Lozinka</mat-label>
                  <input matInput type="password" formControlName="password" autocomplete="current-password" />
                </mat-form-field>
                <button type="submit" mat-flat-button class="danger-button" [disabled]="busy()">Obriši nalog</button>
              </form>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);
  readonly #formBuilder = inject(NonNullableFormBuilder);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly statuses = MEMBER_STATUSES;
  protected readonly statusLabels = MEMBER_STATUS_LABELS;
  protected readonly districts = DISTRICTS;
  protected readonly busy = signal(false);

  protected readonly profileForm = this.#formBuilder.group({
    name: ['', Validators.required],
    member_status: ['' as MemberStatus | ''],
    school: [''],
    municipality: [''],
    district: [''],
    directory_consent: [false],
    surveys_consent: [false],
  });

  protected readonly passwordForm = this.#formBuilder.group({
    current: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly deleteForm = this.#formBuilder.group({
    password: ['', Validators.required],
  });

  constructor() {
    const user = this.auth.currentUser();
    if (user) {
      this.#fill(user);
    }
    if (this.#browser && user) {
      this.auth.reloadUser().subscribe({ next: (fresh) => this.#fill(fresh), error: () => undefined });
    }
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const value = this.profileForm.getRawValue();
    this.busy.set(true);
    this.auth
      .updateProfile({
        name: value.name,
        member_status: value.member_status || null,
        school: value.school || null,
        municipality: value.municipality || null,
        district: value.district || null,
        directory_consent: value.directory_consent,
        surveys_consent: value.surveys_consent,
      })
      .subscribe({
        next: () => {
          this.#notifications.show('Profil je sačuvan.');
          this.busy.set(false);
        },
        error: (error) => {
          this.#notifications.show(apiErrorMessage(error));
          this.busy.set(false);
        },
      });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { current, password } = this.passwordForm.getRawValue();
    this.busy.set(true);
    this.auth.changePassword(current, password).subscribe({
      next: (response) => {
        this.#notifications.show(response.message);
        this.auth.clearSession();
      },
      error: (error) => {
        this.#notifications.show(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected logoutAll(): void {
    this.busy.set(true);
    this.auth.logoutAll().subscribe({
      next: (response) => this.#notifications.show(response.message),
      error: (error) => {
        this.#notifications.show(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected exportData(): void {
    this.busy.set(true);
    this.auth.exportData().subscribe({
      next: (data) => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'fiskultura-moji-podaci.json';
        link.click();
        URL.revokeObjectURL(url);
        this.busy.set(false);
      },
      error: (error) => {
        this.#notifications.show(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected deleteAccount(): void {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }
    this.#confirm
      .confirm({ title: 'Brisanje naloga', message: 'Nalog i podaci se brišu trajno i ne mogu da se vrate.', confirmLabel: 'Obriši nalog' })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.busy.set(true);
        this.auth.deleteAccount(this.deleteForm.getRawValue().password).subscribe({
          next: (response) => this.#notifications.show(response.message),
          error: (error) => {
            this.#notifications.show(apiErrorMessage(error));
            this.busy.set(false);
          },
        });
      });
  }

  #fill(user: User): void {
    this.profileForm.setValue({
      name: user.name,
      member_status: user.member_status ?? '',
      school: user.school ?? '',
      municipality: user.municipality ?? '',
      district: user.district ?? '',
      directory_consent: !!user.directory_consent,
      surveys_consent: !!user.surveys_consent,
    });
  }
}
