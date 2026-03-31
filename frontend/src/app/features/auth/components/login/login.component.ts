import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { CurrencyService, Currency } from '../../../../core/services/currency.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  template: `
    <div class="auth-page">
      <!-- Left Panel -->
      <div class="auth-left">
        <div class="auth-left-content">
          <div class="ai-badge">
            <img src="assets/images/icons/icon-star.svg" alt="star" class="badge-icon" />
            AI-Powered Workspace
          </div>
          <h2>The Future of <span>Coworking</span> is Here</h2>
          <p>Join thousands of innovators, developers and creators working smarter at AIHub.</p>
          <div class="auth-stats">
            <div class="auth-stat">
              <img src="assets/images/icons/icon-user.svg" alt="users" />
              <div><strong>500+</strong><span>Members</span></div>
            </div>
            <div class="auth-stat">
              <img src="assets/images/icons/icon-map-pin.svg" alt="locations" />
              <div><strong>3</strong><span>Cities</span></div>
            </div>
            <div class="auth-stat">
              <img src="assets/images/icons/icon-booking.svg" alt="bookings" />
              <div><strong>2k+</strong><span>Bookings</span></div>
            </div>
          </div>
        </div>
        <img src="assets/images/backgrounds/bg-dashboard-pattern.png" alt="" class="auth-pattern" />
      </div>

      <!-- Right Panel -->
      <div class="auth-right">
        <!-- Lang & Currency -->
        <div class="auth-controls">
          <select [value]="i18n.currentLang()" (change)="onLangChange($event)" class="ctrl-select">
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="de">🇩🇪 DE</option>
          </select>
          <select [value]="currency.currentCurrency()" (change)="onCurrencyChange($event)" class="ctrl-select">
            <option value="MAD">DH (MAD)</option>
            <option value="USD">$ (USD)</option>
          </select>
        </div>

        <div class="auth-form-wrap">
          <h1>{{ 'AUTH.LOGIN_TITLE' | translate }} <span>{{ 'AUTH.LOGIN_TITLE_HIGHLIGHT' | translate }}</span></h1>
          <p class="auth-subtitle">{{ 'AUTH.LOGIN_SUBTITLE' | translate }}</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label>{{ 'AUTH.EMAIL' | translate }}</label>
              <div class="input-wrap">
                <img src="assets/images/icons/icon-user.svg" alt="" class="input-icon" />
                <input formControlName="email" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div class="field">
              <label>{{ 'AUTH.PASSWORD' | translate }}</label>
              <div class="input-wrap">
                <img src="assets/images/icons/icon-booking.svg" alt="" class="input-icon" />
                <input formControlName="password" type="password" placeholder="••••••••" />
              </div>
            </div>

            <div class="form-footer-row">
              <label class="remember">
                <input type="checkbox" /> {{ 'AUTH.REMEMBER_ME' | translate }}
              </label>
              <a href="#" class="forgot">{{ 'AUTH.FORGOT_PASSWORD' | translate }}</a>
            </div>

            <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>

            <button type="submit" [disabled]="loginForm.invalid || isLoading" class="submit-btn">
              <span *ngIf="!isLoading">{{ 'AUTH.SIGN_IN' | translate }}</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <!-- Divider -->
          <div class="divider">
            <span>or continue with</span>
          </div>

          <!-- Google Button -->
          <button class="google-btn" (click)="signInWithGoogle()" [disabled]="googleLoading">
            <ng-container *ngIf="!googleLoading">
              <svg width="20" height="20" viewBox="0 0 48 48" style="flex-shrink:0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Continue with Google</span>
            </ng-container>
            <span *ngIf="googleLoading" class="spinner dark"></span>
          </button>

          <p class="switch-auth">
            {{ 'AUTH.NO_ACCOUNT' | translate }}
            <a routerLink="/register">{{ 'AUTH.SIGN_UP' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .auth-page {
      min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
      font-family: 'Inter', sans-serif;
    }

    /* LEFT */
    .auth-left {
      background: linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #134e4a 100%);
      padding: 40px; display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    .auth-logo img { height: 36px; filter: brightness(0) invert(1); opacity: 0.9; }
    .auth-left-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 24px; position: relative; z-index: 2; }
    .ai-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(20,184,166,0.15); border: 1px solid rgba(20,184,166,0.3);
      color: #5eead4; font-size: 0.8rem; font-weight: 700;
      padding: 8px 16px; border-radius: 100px; width: fit-content;
      .badge-icon { width: 16px; height: 16px; filter: invert(1); opacity: 0.8; }
    }
    .auth-left-content h2 {
      font-size: 2.2rem; font-weight: 900; color: white; line-height: 1.2; margin: 0;
      span { color: #14b8a6; }
    }
    .auth-left-content p { color: #94a3b8; font-size: 1rem; line-height: 1.7; margin: 0; }
    .auth-stats { display: flex; gap: 24px; margin-top: 8px; }
    .auth-stat {
      display: flex; align-items: center; gap: 10px;
      img { width: 32px; height: 32px; filter: invert(1); opacity: 0.4; }
      strong { display: block; color: white; font-size: 1.2rem; font-weight: 900; }
      span { color: #64748b; font-size: 0.78rem; }
    }
    .auth-pattern {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; opacity: 0.04; pointer-events: none;
    }

    /* RIGHT */
    .auth-right {
      background: #f8fafc; display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 40px;
    }
    .auth-controls {
      position: absolute; top: 24px; right: 24px;
      display: flex; gap: 8px;
    }
    .ctrl-select {
      background: white; border: 1.5px solid #e2e8f0;
      padding: 6px 10px; border-radius: 8px;
      font-size: 0.8rem; font-weight: 600; color: #64748b;
      cursor: pointer; outline: none;
      &:hover { border-color: #14b8a6; }
    }
    .auth-form-wrap { width: 100%; max-width: 400px; }
    h1 { font-size: 2rem; font-weight: 900; color: #1e293b; margin: 0 0 8px; ::ng-deep span { color: #14b8a6; } }
    .auth-subtitle { color: #64748b; font-size: 0.95rem; margin: 0 0 32px; }

    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 0.85rem; font-weight: 600; color: #374151; }
    .input-wrap {
      position: relative;
      .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; opacity: 0.4; }
      input {
        width: 100%; padding: 12px 16px 12px 44px;
        border: 1.5px solid #e2e8f0; border-radius: 12px;
        font-size: 0.9rem; outline: none; background: white;
        transition: border-color 0.2s;
        &:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
      }
    }
    .form-footer-row {
      display: flex; justify-content: space-between; align-items: center;
      .remember { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #64748b; cursor: pointer; }
      .forgot { font-size: 0.85rem; color: #14b8a6; text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
    }
    .error-msg { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; }
    .submit-btn {
      width: 100%; padding: 14px; border-radius: 12px;
      background: #14b8a6; border: none; color: white;
      font-weight: 700; font-size: 1rem; cursor: pointer;
      transition: all 0.2s; display: flex; align-items: center; justify-content: center;
      &:hover:not(:disabled) { background: #0d9488; box-shadow: 0 8px 20px rgba(20,184,166,0.3); transform: translateY(-1px); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .spinner {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .switch-auth { text-align: center; margin-top: 24px; font-size: 0.9rem; color: #64748b;
      a { color: #14b8a6; font-weight: 700; text-decoration: none; &:hover { text-decoration: underline; } }
    }

    .divider {
      display: flex; align-items: center; gap: 12px; margin: 24px 0 16px;
      &::before, &::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
      span { font-size: 0.78rem; color: #94a3b8; font-weight: 600; white-space: nowrap; }
    }
    .google-btn {
      width: 100%; padding: 13px 16px; border-radius: 12px;
      background: white; border: 1.5px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      font-size: 0.92rem; font-weight: 700; color: #1e293b;
      cursor: pointer; transition: all 0.2s; white-space: nowrap;
      svg { flex-shrink: 0; width: 20px; height: 20px; }
      &:hover:not(:disabled) { border-color: #4285F4; box-shadow: 0 4px 16px rgba(66,133,244,0.15); transform: translateY(-1px); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
      .spinner.dark { border-color: rgba(0,0,0,0.15); border-top-color: #4285F4; }
    }

    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 80px 24px 40px; }
      .auth-controls { position: fixed; }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private http = inject(HttpClient);
  i18n = inject(I18nService);
  currency = inject(CurrencyService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  googleLoading = false;
  errorMessage = '';

  ngOnInit() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCallback(response)
      });
    }
  }

  signInWithGoogle() {
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    }
  }

  private handleGoogleCallback(response: any) {
    this.googleLoading = true;
    this.errorMessage = '';
    this.http.post<any>(`${environment.apiUrl}/auth/google`, { credential: response.credential })
      .subscribe({
        next: (res) => {
          this.authService.handleGoogleAuth(res);
          this.router.navigate(['/']);
        },
        error: () => {
          this.googleLoading = false;
          this.errorMessage = 'Google sign-in failed. Please try again.';
        }
      });
  }

  onLangChange(e: any) { this.i18n.use(e.target.value); }
  onCurrencyChange(e: any) { this.currency.setCurrency(e.target.value as Currency); }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/']),
        error: () => {
          this.isLoading = false;
          this.errorMessage = this.translate.instant('ERRORS.AUTH_FAILED');
        }
      });
    }
  }
}
