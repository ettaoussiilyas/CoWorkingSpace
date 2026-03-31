import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../services/i18n.service';
import { CurrencyService, Currency } from '../../services/currency.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled()">
      <div class="container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <img src="assets/images/icons/logo-full.png" alt="AIHub" class="logo-img" />
        </a>

        <!-- Desktop Nav -->
        <div class="nav-links">
          <a routerLink="/" fragment="services" class="nav-link">{{ 'NAV.SERVICES' | translate }}</a>
          <a routerLink="/" fragment="pricing" class="nav-link">{{ 'NAV.PRICING' | translate }}</a>
          <a routerLink="/centers" class="nav-link">{{ 'NAV.CENTERS' | translate }}</a>
        </div>

        <!-- Right Controls -->
        <div class="nav-right">
          <div class="selectors">
            <select [value]="i18n.currentLang()" (change)="onLangChange($event)" class="selector">
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </select>
            <select [value]="currency.currentCurrency()" (change)="onCurrencyChange($event)" class="selector">
              <option value="MAD">DH</option>
              <option value="USD">$</option>
            </select>
          </div>

          <div class="auth-group">
            <ng-container *ngIf="!auth.currentUser(); else loggedIn">
              <button routerLink="/login" class="btn-login">{{ 'NAV.LOGIN' | translate }}</button>
              <button routerLink="/register" class="btn-signup">{{ 'NAV.REGISTER' | translate }}</button>
            </ng-container>
            <ng-template #loggedIn>
              <button routerLink="/admin" *ngIf="auth.isAdmin()" class="btn-admin">⚙ Admin</button>
              <button routerLink="/my-bookings" *ngIf="!auth.isAdmin()" class="btn-login">{{ 'NAV.MY_BOOKINGS' | translate }}</button>
              <button (click)="auth.logout()" class="btn-logout">{{ 'NAV.LOGOUT' | translate }}</button>
            </ng-template>
          </div>

          <!-- Mobile Menu Toggle -->
          <button class="menu-toggle" (click)="toggleMenu()">
            <span class="hamburger" [class.open]="menuOpen()">
              <span></span><span></span><span></span>
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.open]="menuOpen()">
        <a routerLink="/" fragment="services" class="mobile-link" (click)="closeMenu()">{{ 'NAV.SERVICES' | translate }}</a>
        <a routerLink="/" fragment="pricing" class="mobile-link" (click)="closeMenu()">{{ 'NAV.PRICING' | translate }}</a>
        <a routerLink="/centers" class="mobile-link" (click)="closeMenu()">{{ 'NAV.CENTERS' | translate }}</a>
        <div class="mobile-divider"></div>
        <ng-container *ngIf="!auth.currentUser(); else mobileLoggedIn">
          <button routerLink="/login" class="mobile-link" (click)="closeMenu()">{{ 'NAV.LOGIN' | translate }}</button>
          <button routerLink="/register" class="btn-signup mobile-cta" (click)="closeMenu()">{{ 'NAV.REGISTER' | translate }}</button>
        </ng-container>
        <ng-template #mobileLoggedIn>
          <button routerLink="/admin" *ngIf="auth.isAdmin()" class="mobile-link" (click)="closeMenu()">⚙ Admin Panel</button>
          <button routerLink="/my-bookings" *ngIf="!auth.isAdmin()" class="mobile-link" (click)="closeMenu()">{{ 'NAV.MY_BOOKINGS' | translate }}</button>
          <button (click)="auth.logout(); closeMenu()" class="mobile-link">{{ 'NAV.LOGOUT' | translate }}</button>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 1000;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
      transition: box-shadow 0.3s;
      font-family: 'Inter', sans-serif;
      &.scrolled { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    }
    .container {
      max-width: 1240px; margin: 0 auto; padding: 0 24px;
      height: 72px; display: flex; align-items: center; gap: 32px;
    }
    .logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; }
    .logo-img { height: 36px; width: auto; object-fit: contain; }
    .nav-links {
      display: flex; gap: 8px; align-items: center; flex: 1;
    }
    .nav-link {
      text-decoration: none; color: #64748b; font-weight: 600; font-size: 0.9rem;
      padding: 8px 14px; border-radius: 8px; transition: all 0.2s;
      &:hover { color: #14b8a6; background: #f0fdfa; }
    }
    .nav-right { display: flex; align-items: center; gap: 16px; margin-left: auto; }
    .selectors { display: flex; gap: 8px; }
    .selector {
      background: #f8fafc; border: 1px solid #e2e8f0;
      padding: 6px 10px; border-radius: 8px;
      font-size: 0.8rem; font-weight: 600; color: #64748b;
      cursor: pointer; outline: none;
      &:hover { border-color: #14b8a6; }
    }
    .auth-group { display: flex; gap: 8px; align-items: center; }
    .btn-admin {
      background: linear-gradient(135deg, #0f172a, #1e293b); border: none; color: #14b8a6;
      padding: 8px 18px; border-radius: 10px; font-weight: 700; font-size: 0.88rem;
      cursor: pointer; transition: all 0.2s;
      &:hover { background: #14b8a6; color: white; }
    }
    .btn-login {
      background: none; border: 1.5px solid #e2e8f0; color: #475569;
      padding: 8px 18px; border-radius: 10px; font-weight: 600; font-size: 0.88rem;
      cursor: pointer; transition: all 0.2s;
      &:hover { border-color: #14b8a6; color: #14b8a6; }
    }
    .btn-signup {
      background: #14b8a6; border: none; color: white;
      padding: 8px 18px; border-radius: 10px; font-weight: 700; font-size: 0.88rem;
      cursor: pointer; transition: all 0.2s;
      &:hover { background: #0d9488; box-shadow: 0 4px 12px rgba(20,184,166,0.3); }
    }
    .btn-logout {
      background: none; border: 1.5px solid #fecaca; color: #ef4444;
      padding: 8px 18px; border-radius: 10px; font-weight: 600; font-size: 0.88rem;
      cursor: pointer; transition: all 0.2s;
      &:hover { background: #fef2f2; }
    }
    .menu-toggle {
      display: none; background: none; border: none; cursor: pointer;
      padding: 6px; align-items: center; justify-content: center;
    }
    .hamburger {
      display: flex; flex-direction: column; gap: 5px; width: 22px;
      span { display: block; height: 2px; background: #475569; border-radius: 2px; transition: all 0.3s; }
      &.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      &.open span:nth-child(2) { opacity: 0; }
      &.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    }
    .mobile-menu {
      display: none; flex-direction: column; padding: 16px 24px 24px;
      border-top: 1px solid #f1f5f9; background: white;
      &.open { display: flex; }
    }
    .mobile-link {
      text-decoration: none; color: #475569; font-weight: 600; font-size: 0.95rem;
      padding: 12px 0; border: none; background: none; cursor: pointer; text-align: left;
      border-bottom: 1px solid #f8fafc;
      &:hover { color: #14b8a6; }
    }
    .mobile-divider { height: 1px; background: #e2e8f0; margin: 8px 0; }
    .mobile-cta { width: 100%; margin-top: 8px; padding: 12px; border-radius: 10px; text-align: center; }

    @media (max-width: 768px) {
      .nav-links, .selectors, .auth-group { display: none; }
      .menu-toggle { display: flex; }
    }
  `]
})
export class NavbarComponent {
  i18n = inject(I18nService);
  currency = inject(CurrencyService);
  auth = inject(AuthService);

  isScrolled = signal(false);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() { this.isScrolled.set(window.scrollY > 20); }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }

  onLangChange(event: any) { this.i18n.use(event.target.value); }
  onCurrencyChange(event: any) { this.currency.setCurrency(event.target.value as Currency); }
}
