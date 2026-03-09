import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { CurrencyService, Currency } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  template: `
    <div class="auth-page">
      <!-- Left Panel -->
      <div class="auth-left">
        <a routerLink="/" class="auth-logo">
          <img src="assets/images/icons/logo-full.png" alt="AIHub" />
        </a>
        <div class="auth-left-content">
          <div class="ai-badge">
            <img src="assets/images/icons/icon-star.svg" alt="star" class="badge-icon" />
            Join the Community
          </div>
          <h2>Start Your <span>Journey</span> with AIHub</h2>
          <p>Get access to premium coworking spaces, events, and a thriving tech community across Morocco.</p>
          <div class="perks">
            <div class="perk">
              <img src="assets/images/icons/icon-star.svg" alt="" />
              <span>Free first day on any Open Space</span>
            </div>
            <div class="perk">
              <img src="assets/images/icons/icon-calendar.svg" alt="" />
              <span>Flexible booking — hourly, daily, monthly</span>
            </div>
            <div class="perk">
              <img src="assets/images/icons/icon-search.svg" alt="" />
              <span>Access to all centers across Morocco</span>
            </div>
          </div>
        </div>
        <img src="assets/images/backgrounds/bg-dashboard-pattern.png" alt="" class="auth-pattern" />
      </div>

      <!-- Right Panel -->
      <div class="auth-right">
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
          <h1 [innerHTML]="'AUTH.REGISTER_TITLE' | translate"></h1>
          <p class="auth-subtitle">{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label>{{ 'AUTH.FULL_NAME' | translate }}</label>
              <div class="input-wrap">
                <img src="assets/images/icons/icon-user.svg" alt="" class="input-icon" />
                <input formControlName="fullName" type="text" placeholder="Your full name" />
              </div>
            </div>
            <div class="field">
              <label>{{ 'AUTH.EMAIL' | translate }}</label>
              <div class="input-wrap">
                <img src="assets/images/icons/icon-search.svg" alt="" class="input-icon" />
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

            <div *ngIf="successMessage" class="success-msg">{{ successMessage }}</div>
            <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>

            <button type="submit" [disabled]="registerForm.invalid || isLoading" class="submit-btn">
              <span *ngIf="!isLoading">{{ 'AUTH.SIGN_UP' | translate }}</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <p class="switch-auth">
            {{ 'AUTH.HAS_ACCOUNT' | translate }}
            <a routerLink="/login">{{ 'AUTH.SIGN_IN' | translate }}</a>
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
    .auth-left-content h2 { font-size: 2.2rem; font-weight: 900; color: white; line-height: 1.2; margin: 0; span { color: #14b8a6; } }
    .auth-left-content p { color: #94a3b8; font-size: 1rem; line-height: 1.7; margin: 0; }
    .perks { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
    .perk {
      display: flex; align-items: center; gap: 12px;
      img { width: 20px; height: 20px; filter: invert(1); opacity: 0.5; flex-shrink: 0; }
      span { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    }
    .auth-pattern { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.04; pointer-events: none; }

    .auth-right {
      background: #f8fafc; display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 40px; position: relative;
    }
    .auth-controls { position: absolute; top: 24px; right: 24px; display: flex; gap: 8px; }
    .ctrl-select {
      background: white; border: 1.5px solid #e2e8f0; padding: 6px 10px; border-radius: 8px;
      font-size: 0.8rem; font-weight: 600; color: #64748b; cursor: pointer; outline: none;
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
        font-size: 0.9rem; outline: none; background: white; transition: border-color 0.2s;
        &:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
      }
    }
    .error-msg { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; }
    .success-msg { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; }
    .submit-btn {
      width: 100%; padding: 14px; border-radius: 12px;
      background: #14b8a6; border: none; color: white;
      font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
      &:hover:not(:disabled) { background: #0d9488; box-shadow: 0 8px 20px rgba(20,184,166,0.3); transform: translateY(-1px); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .switch-auth { text-align: center; margin-top: 24px; font-size: 0.9rem; color: #64748b;
      a { color: #14b8a6; font-weight: 700; text-decoration: none; &:hover { text-decoration: underline; } }
    }
    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 80px 24px 40px; }
      .auth-controls { position: fixed; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  i18n = inject(I18nService);
  currency = inject(CurrencyService);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onLangChange(e: any) { this.i18n.use(e.target.value); }
  onCurrencyChange(e: any) { this.currency.setCurrency(e.target.value as Currency); }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage = this.translate.instant('SUCCESS.REGISTERED');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || this.translate.instant('ERRORS.SERVER_ERROR');
        }
      });
    }
  }
}
