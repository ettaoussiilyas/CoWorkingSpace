import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <footer class="footer">
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">

            <!-- Brand -->
            <div class="footer-brand">
              <p>{{ 'LANDING.FOOTER.COPYRIGHT' | translate }}</p>
              <div class="social-links">
                <a href="#" class="social-btn" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" class="social-btn" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" class="social-btn" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a routerLink="/" fragment="services">{{ 'NAV.SERVICES' | translate }}</a></li>
                <li><a routerLink="/" fragment="pricing">{{ 'NAV.PRICING' | translate }}</a></li>
                <li><a routerLink="/centers">{{ 'NAV.CENTERS' | translate }}</a></li>
                <li><a routerLink="/register">{{ 'NAV.REGISTER' | translate }}</a></li>
              </ul>
            </div>

            <!-- Spaces -->
            <div class="footer-col">
              <h4>Spaces</h4>
              <ul>
                <li><a routerLink="/centers">Open Space</a></li>
                <li><a routerLink="/centers">Bureau Small</a></li>
                <li><a routerLink="/centers">Bureau Standard</a></li>
                <li><a routerLink="/centers">Conference Room</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div class="footer-col">
              <h4>Contact</h4>
              <div class="contact-list">
                <div class="contact-row">
                  <img src="assets/images/icons/icon-map-pin.svg" alt="" class="contact-icon" />
                  <span>Rabat & Casablanca, Maroc</span>
                </div>
                <div class="contact-row">
                  <img src="assets/images/icons/icon-booking.svg" alt="" class="contact-icon" />
                  <span>+212 5 37 00 00 00</span>
                </div>
                <div class="contact-row">
                  <img src="assets/images/icons/icon-search.svg" alt="" class="contact-icon" />
                  <span>contact&#64;aihub.ma</span>
                </div>
              </div>
              <div class="amenities-row">
                <img src="assets/images/amenities/amenity-wifi.svg" alt="WiFi" title="Free WiFi" />
                <img src="assets/images/amenities/amenity-coffee.svg" alt="Coffee" title="Coffee Bar" />
                <img src="assets/images/amenities/amenity-parking.svg" alt="Parking" title="Parking" />
                <img src="assets/images/amenities/amenity-projector.svg" alt="Projector" title="Projector" />
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="container">
          <span>© 2024 AIHub. All rights reserved.</span>
          <div class="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { font-family: 'Inter', sans-serif; background: #0f172a; color: #94a3b8; }
    .footer-main { padding: 80px 0 60px; }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
    .footer-grid { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1.4fr; gap: 48px; }

    .footer-brand {
      .footer-logo { height: 40px; width: auto; margin-bottom: 20px; filter: brightness(0) invert(1); opacity: 0.85; display: block; }
      p { font-size: 0.88rem; line-height: 1.7; color: #475569; max-width: 280px; margin: 0 0 24px; }
    }
    .social-links { display: flex; gap: 10px; }
    .social-btn {
      width: 38px; height: 38px; border-radius: 10px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      color: #64748b; text-decoration: none; transition: all 0.2s;
      svg { width: 16px; height: 16px; }
      &:hover { background: #14b8a6; border-color: #14b8a6; color: white; }
    }

    .footer-col {
      h4 { font-size: 0.8rem; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 20px; }
      ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
      a { color: #475569; text-decoration: none; font-size: 0.88rem; transition: color 0.2s; &:hover { color: #14b8a6; } }
    }

    .contact-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .contact-row {
      display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #475569;
    }
    .contact-icon { width: 16px; height: 16px; filter: invert(52%) sepia(98%) saturate(400%) hue-rotate(130deg); opacity: 0.7; flex-shrink: 0; }

    .amenities-row {
      display: flex; gap: 10px;
      img { width: 24px; height: 24px; opacity: 0.5; filter: invert(52%) sepia(98%) saturate(400%) hue-rotate(130deg); transition: opacity 0.2s; &:hover { opacity: 1; } }
    }

    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.06); padding: 20px 0;
      .container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
      span { font-size: 0.82rem; color: #334155; }
    }
    .footer-bottom-links {
      display: flex; gap: 24px;
      a { font-size: 0.82rem; color: #334155; text-decoration: none; &:hover { color: #14b8a6; } }
    }

    @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; } }
    @media (max-width: 640px) {
      .footer-grid { grid-template-columns: 1fr; gap: 32px; }
      .footer-bottom .container { flex-direction: column; text-align: center; }
    }
  `]
})
export class FooterComponent {}
