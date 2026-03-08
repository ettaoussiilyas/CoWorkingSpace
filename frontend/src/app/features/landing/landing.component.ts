import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PricingComponent } from './components/pricing/pricing.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, PricingComponent, RouterModule, TranslateModule],
  template: `
    <div class="landing-page">

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <img src="assets/images/backgrounds/hero-hero-image.jpg" alt="Hero" class="hero-img" />
          <div class="hero-overlay"></div>
        </div>
        <div class="container hero-content">
          <div class="hero-badge">
            <img src="assets/images/icons/icon-star.svg" alt="" class="badge-svg" />
            {{ 'LANDING.HERO_BADGE' | translate }}
          </div>
          <h1 [innerHTML]="'LANDING.HERO_TITLE' | translate"></h1>
          <p>{{ 'LANDING.HERO_SUBTITLE' | translate }}</p>
          <div class="hero-ctas">
            <button routerLink="/centers" class="btn-primary">{{ 'LANDING.BOOK_NOW' | translate }}</button>
            <a href="#services" class="btn-ghost">{{ 'LANDING.HERO_SERVICES_BTN' | translate }}</a>
          </div>
          <div class="hero-stats">
            <div class="stat"><strong>500+</strong><span>{{ 'LANDING.STAT_MEMBERS' | translate }}</span></div>
            <div class="stat-divider"></div>
            <div class="stat"><strong>12+</strong><span>{{ 'LANDING.STAT_SPACES' | translate }}</span></div>
            <div class="stat-divider"></div>
            <div class="stat"><strong>3</strong><span>{{ 'LANDING.STAT_CITIES' | translate }}</span></div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services" class="services">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">{{ 'LANDING.SERVICES_TAG' | translate }}</span>
            <h2 [innerHTML]="'LANDING.SERVICES_TITLE' | translate"></h2>
            <p>{{ 'LANDING.SERVICES_DESC' | translate }}</p>
          </div>
          <div class="services-grid">
            <div class="service-card" *ngFor="let s of services">
              <div class="service-icon-wrap" [ngClass]="s.color">
                <img [src]="s.icon" alt="" class="service-svg" />
              </div>
              <h3>{{ s.titleKey | translate }}</h3>
              <p>{{ s.descKey | translate }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Centers Preview Section -->
      <section class="centers-preview">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">{{ 'LANDING.CENTERS_TAG' | translate }}</span>
            <h2 [innerHTML]="'LANDING.CENTERS_TITLE' | translate"></h2>
            <p>{{ 'LANDING.CENTERS_DESC' | translate }}</p>
          </div>
          <div class="centers-grid">
            <div class="center-card featured">
              <div class="center-img-wrap">
                <img src="assets/images/centers/center-hero-casablanca.jpg" alt="Casablanca Hub" />
                <div class="center-badge">Featured</div>
              </div>
              <div class="center-info">
                <div class="center-meta">
                  <span class="city-tag">
                    <img src="assets/images/icons/icon-map-pin.svg" alt="" class="meta-svg" /> Casablanca
                  </span>
                  <span class="rating">
                    <img src="assets/images/icons/icon-star.svg" alt="" class="meta-svg star-svg" /> 4.9
                  </span>
                </div>
                <h3>AIHub Casablanca</h3>
                <p>{{ 'LANDING.CENTER_CASA_DESC' | translate }}</p>
                <div class="center-amenities">
                  <img src="assets/images/amenities/amenity-wifi.svg" alt="WiFi" title="High-Speed WiFi" />
                  <img src="assets/images/amenities/amenity-coffee.svg" alt="Coffee" title="Coffee Bar" />
                  <img src="assets/images/amenities/amenity-parking.svg" alt="Parking" title="Free Parking" />
                  <img src="assets/images/amenities/amenity-projector.svg" alt="Projector" title="Projector" />
                </div>
                <button routerLink="/centers" class="btn-primary">{{ 'LANDING.VIEW_SPACES' | translate }}</button>
              </div>
            </div>
            <div class="center-card">
              <div class="center-img-wrap">
                <img src="assets/images/centers/photo1.jpg" alt="Rabat Hub" />
              </div>
              <div class="center-info">
                <div class="center-meta">
                  <span class="city-tag">
                    <img src="assets/images/icons/icon-map-pin.svg" alt="" class="meta-svg" /> Rabat
                  </span>
                  <span class="rating">
                    <img src="assets/images/icons/icon-star.svg" alt="" class="meta-svg star-svg" /> 4.7
                  </span>
                </div>
                <h3>AIHub Rabat</h3>
                <p>{{ 'LANDING.CENTER_RABAT_DESC' | translate }}</p>
                <div class="center-amenities">
                  <img src="assets/images/amenities/amenity-wifi.svg" alt="WiFi" />
                  <img src="assets/images/amenities/amenity-coffee.svg" alt="Coffee" />
                  <img src="assets/images/amenities/amenity-parking.svg" alt="Parking" />
                </div>
                <button routerLink="/centers" class="btn-outline">{{ 'LANDING.VIEW_SPACES' | translate }}</button>
              </div>
            </div>
            <div class="center-card">
              <div class="center-img-wrap">
                <img src="assets/images/spaces/space1.jpg" alt="Marrakech Hub" />
              </div>
              <div class="center-info">
                <div class="center-meta">
                  <span class="city-tag">
                    <img src="assets/images/icons/icon-map-pin.svg" alt="" class="meta-svg" /> Marrakech
                  </span>
                  <span class="rating">
                    <img src="assets/images/icons/icon-star.svg" alt="" class="meta-svg star-svg" /> 4.8
                  </span>
                </div>
                <h3>AIHub Marrakech</h3>
                <p>{{ 'LANDING.CENTER_MARRAKECH_DESC' | translate }}</p>
                <div class="center-amenities">
                  <img src="assets/images/amenities/amenity-wifi.svg" alt="WiFi" />
                  <img src="assets/images/amenities/amenity-coffee.svg" alt="Coffee" />
                  <img src="assets/images/amenities/amenity-projector.svg" alt="Projector" />
                </div>
                <button routerLink="/centers" class="btn-outline">{{ 'LANDING.VIEW_SPACES' | translate }}</button>
              </div>
            </div>
          </div>
          <div class="centers-cta">
            <button routerLink="/centers" class="btn-primary large">{{ 'LANDING.VIEW_ALL_CENTERS' | translate }}</button>
          </div>
        </div>
      </section>

      <!-- Gallery Strip -->
      <section class="gallery-strip">
        <div class="gallery-item"><img src="assets/images/spaces/gallery/space-gallery-101-1.jpg" alt="Space" /></div>
        <div class="gallery-item"><img src="assets/images/spaces/gallery/space-gallery-101-2.jpg" alt="Space" /></div>
        <div class="gallery-item"><img src="assets/images/spaces/gallery/space-gallery-101-3.jpg" alt="Space" /></div>
        <div class="gallery-item"><img src="assets/images/centers/center-thumb-casablanca.jpg" alt="Center" /></div>
        <div class="gallery-item"><img src="assets/images/spaces/space-thumb-101.jpg" alt="Space" /></div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="pricing-section-wrap">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">{{ 'LANDING.PRICING_TAG' | translate }}</span>
            <h2 [innerHTML]="'LANDING.PRICING_TITLE' | translate"></h2>
            <p>{{ 'LANDING.PRICING_DESC' | translate }}</p>
          </div>
        </div>
        <app-pricing></app-pricing>
      </section>

      <!-- Testimonials -->
      <section class="testimonials">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">{{ 'LANDING.TESTIMONIALS_TAG' | translate }}</span>
            <h2 [innerHTML]="'LANDING.TESTIMONIALS.TITLE' | translate"></h2>
          </div>
          <div class="testimonials-grid">
            <div class="testimonial-card" *ngFor="let t of testimonials; let i = index" [class.featured-testimonial]="i === 1">
              <div class="stars">
                <img src="assets/images/icons/icon-star.svg" alt="star" class="star-icon" *ngFor="let s of [1,2,3,4,5]" />
              </div>
              <p>"{{ t.quote | translate }}"</p>
              <div class="testimonial-author">
                <img [src]="t.avatar" [alt]="t.name" />
                <div>
                  <strong>{{ t.name }}</strong>
                  <span>{{ t.role | translate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="contact">
        <div class="container">
          <div class="contact-inner">
            <div class="contact-text">
              <span class="section-tag light">{{ 'LANDING.CONTACT_TAG' | translate }}</span>
              <h2 [innerHTML]="'LANDING.CONTACT_TITLE' | translate"></h2>
              <p>{{ 'LANDING.CONTACT.READY_SUBTITLE' | translate }}</p>
              <div class="contact-items">
                <div class="contact-item">
                  <img src="assets/images/icons/icon-map-pin.svg" alt="" class="contact-svg" />
                  <span>Rabat & Casablanca, Maroc</span>
                </div>
                <div class="contact-item">
                  <img src="assets/images/icons/icon-booking.svg" alt="" class="contact-svg" />
                  <span>+212 5 37 00 00 00</span>
                </div>
                <div class="contact-item">
                  <img src="assets/images/icons/icon-search.svg" alt="" class="contact-svg" />
                  <span>contact&#64;aihub.ma</span>
                </div>
              </div>
              <button routerLink="/register" class="btn-primary">{{ 'LANDING.GET_STARTED' | translate }}</button>
            </div>
            <div class="contact-image">
              <img src="assets/images/backgrounds/bg-dashboard-pattern.png" alt="" class="contact-pattern" />
              <img src="assets/images/centers/center-thumb-casablanca.jpg" alt="Center" class="contact-photo" />
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .landing-page { font-family: 'Inter', sans-serif; color: #1e293b; background: #f8fafc; }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }

    .section-header {
      text-align: center; margin-bottom: 64px;
      .section-tag {
        display: inline-block; background: #f0fdfa; color: #0d9488;
        font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
        padding: 6px 16px; border-radius: 100px; margin-bottom: 16px; border: 1px solid #ccfbf1;
      }
      h2 { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 900; margin: 0 0 16px; span { color: #14b8a6; } }
      p { color: #64748b; font-size: 1.1rem; max-width: 560px; margin: 0 auto; }
    }

    .btn-primary {
      background: #14b8a6; color: white; border: none; padding: 14px 28px;
      border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
      &:hover { background: #0d9488; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(20,184,166,0.3); }
      &.large { padding: 16px 40px; font-size: 1.1rem; }
    }
    .btn-outline {
      background: white; color: #1e293b; border: 1.5px solid #e2e8f0; padding: 14px 28px;
      border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; display: inline-flex; align-items: center;
      &:hover { border-color: #14b8a6; color: #14b8a6; }
    }
    .btn-ghost {
      background: rgba(255,255,255,0.15); color: white; border: 1.5px solid rgba(255,255,255,0.4);
      padding: 14px 28px; border-radius: 12px; font-size: 1rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s; text-decoration: none;
      display: inline-flex; align-items: center; backdrop-filter: blur(4px);
      &:hover { background: rgba(255,255,255,0.25); }
    }

    /* HERO */
    .hero { position: relative; min-height: 92vh; display: flex; align-items: center; overflow: hidden; }
    .hero-bg {
      position: absolute; inset: 0;
      .hero-img { width: 100%; height: 100%; object-fit: cover; }
      .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.55) 60%, rgba(20,184,166,0.15) 100%); }
    }
    .hero-content { position: relative; z-index: 2; padding-top: 80px; padding-bottom: 80px; max-width: 720px; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(20,184,166,0.15); border: 1px solid rgba(20,184,166,0.4);
      color: #5eead4; font-size: 0.85rem; font-weight: 600;
      padding: 8px 18px; border-radius: 100px; margin-bottom: 24px; backdrop-filter: blur(4px);
      .badge-svg { width: 16px; height: 16px; filter: invert(1) sepia(1) saturate(2) hue-rotate(130deg); opacity: 0.9; }
    }
    .hero-content h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; color: white; line-height: 1.1; margin: 0 0 24px; span { color: #14b8a6; } }
    .hero-content p { font-size: 1.2rem; color: rgba(255,255,255,0.8); line-height: 1.7; margin: 0 0 40px; max-width: 560px; }
    .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 60px; }
    .hero-stats {
      display: flex; align-items: center; gap: 32px;
      .stat { color: white; strong { display: block; font-size: 1.8rem; font-weight: 900; color: #14b8a6; } span { font-size: 0.85rem; color: rgba(255,255,255,0.6); } }
      .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }
    }

    /* SERVICES */
    .services { padding: 100px 0; background: white; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .service-card {
      padding: 32px; border-radius: 20px; border: 1px solid #f1f5f9; background: #fafafa; transition: all 0.3s;
      &:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); background: white; border-color: #e2e8f0; }
      h3 { font-size: 1.1rem; font-weight: 700; margin: 16px 0 8px; }
      p { color: #64748b; font-size: 0.9rem; line-height: 1.6; margin: 0; }
    }
    .service-icon-wrap {
      width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
      &.teal { background: #f0fdfa; } &.indigo { background: #eef2ff; }
      &.purple { background: #faf5ff; } &.orange { background: #fff7ed; } &.rose { background: #fff1f2; }
    }
    .service-svg { width: 28px; height: 28px; opacity: 0.8; }

    /* CENTERS */
    .centers-preview { padding: 100px 0; background: #f8fafc; }
    .centers-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 24px; align-items: start; }
    .center-card {
      background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; transition: all 0.3s;
      &:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
    }
    .center-img-wrap {
      position: relative; overflow: hidden; height: 220px;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
      .center-badge { position: absolute; top: 16px; left: 16px; background: #14b8a6; color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
    }
    .center-card:hover .center-img-wrap img { transform: scale(1.05); }
    .center-card.featured .center-img-wrap { height: 280px; }
    .center-info {
      padding: 24px;
      h3 { font-size: 1.2rem; font-weight: 800; margin: 8px 0; }
      p { color: #64748b; font-size: 0.88rem; line-height: 1.6; margin: 0 0 16px; }
    }
    .center-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .city-tag { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: #64748b; }
    .meta-svg { width: 14px; height: 14px; opacity: 0.6; }
    .star-svg { filter: sepia(1) saturate(4) hue-rotate(5deg); opacity: 1; }
    .rating { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 700; color: #f59e0b; }
    .center-amenities { display: flex; gap: 10px; margin-bottom: 20px; img { width: 28px; height: 28px; opacity: 0.7; transition: opacity 0.2s; &:hover { opacity: 1; } } }
    .centers-cta { text-align: center; margin-top: 48px; }

    /* GALLERY */
    .gallery-strip { display: grid; grid-template-columns: repeat(5, 1fr); height: 220px; overflow: hidden; }
    .gallery-item { overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; } &:hover img { transform: scale(1.1); } }

    /* PRICING */
    .pricing-section-wrap { padding: 100px 0; background: white; }

    /* TESTIMONIALS */
    .testimonials { padding: 100px 0; background: #f8fafc; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .testimonial-card {
      background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; transition: all 0.3s;
      &:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.08); }
      .stars { display: flex; gap: 4px; margin-bottom: 16px; }
      .star-icon { width: 18px; height: 18px; filter: sepia(1) saturate(4) hue-rotate(5deg); }
      p { color: #475569; line-height: 1.7; font-size: 0.95rem; margin: 0 0 24px; font-style: italic; }
    }
    .featured-testimonial {
      background: linear-gradient(135deg, #0f172a, #1e293b); border-color: transparent;
      p { color: rgba(255,255,255,0.8); }
      .testimonial-author strong { color: white; }
      .testimonial-author span { color: rgba(255,255,255,0.5); }
    }
    .testimonial-author {
      display: flex; align-items: center; gap: 12px;
      img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; }
      strong { display: block; font-size: 0.9rem; font-weight: 700; color: #1e293b; }
      span { font-size: 0.8rem; color: #94a3b8; }
    }

    /* CONTACT */
    .contact { padding: 100px 0; background: #0f172a; }
    .contact-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .contact-text {
      .section-tag.light {
        display: inline-block; background: rgba(20,184,166,0.15); color: #5eead4;
        font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
        padding: 6px 16px; border-radius: 100px; margin-bottom: 16px; border: 1px solid rgba(20,184,166,0.3);
      }
      h2 { font-size: clamp(2rem, 3vw, 2.8rem); font-weight: 900; color: white; margin: 0 0 16px; span { color: #14b8a6; } }
      p { color: #94a3b8; font-size: 1.05rem; line-height: 1.7; margin: 0 0 32px; }
    }
    .contact-items { margin-bottom: 40px; display: flex; flex-direction: column; gap: 16px; }
    .contact-item { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.8); font-size: 0.95rem; }
    .contact-svg { width: 20px; height: 20px; filter: invert(1); opacity: 0.6; flex-shrink: 0; }
    .contact-image {
      position: relative;
      .contact-pattern { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; border-radius: 24px; }
      .contact-photo { width: 100%; border-radius: 24px; object-fit: cover; height: 420px; position: relative; z-index: 1; border: 3px solid rgba(255,255,255,0.1); }
    }

    @media (max-width: 1024px) {
      .centers-grid { grid-template-columns: 1fr 1fr; }
      .center-card.featured { grid-column: span 2; }
      .contact-inner { grid-template-columns: 1fr; gap: 48px; }
      .contact-image { display: none; }
    }
    @media (max-width: 768px) {
      .centers-grid { grid-template-columns: 1fr; }
      .center-card.featured { grid-column: span 1; }
      .gallery-strip { grid-template-columns: repeat(3, 1fr); height: 160px; }
      .gallery-item:nth-child(4), .gallery-item:nth-child(5) { display: none; }
      .services-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .services-grid { grid-template-columns: 1fr; }
      .hero-ctas { flex-direction: column; }
    }
  `]
})
export class LandingComponent {
  services = [
    { icon: 'assets/images/icons/icon-booking.svg', color: 'teal', titleKey: 'LANDING.SERVICES.OPEN_SPACE_TITLE', descKey: 'LANDING.SERVICES.OPEN_SPACE_DESC' },
    { icon: 'assets/images/icons/icon-user.svg', color: 'indigo', titleKey: 'LANDING.SERVICES.PRIVATE_OFFICE_TITLE', descKey: 'LANDING.SERVICES.PRIVATE_OFFICE_DESC' },
    { icon: 'assets/images/icons/icon-calendar.svg', color: 'purple', titleKey: 'LANDING.SERVICES.MEETING_ROOMS_TITLE', descKey: 'LANDING.SERVICES.MEETING_ROOMS_DESC' },
    { icon: 'assets/images/amenities/amenity-coffee.svg', color: 'orange', titleKey: 'LANDING.SERVICES.CAFETERIA_TITLE', descKey: 'LANDING.SERVICES.CAFETERIA_DESC' },
    { icon: 'assets/images/icons/icon-search.svg', color: 'rose', titleKey: 'LANDING.SERVICES.PODCAST_TITLE', descKey: 'LANDING.SERVICES.PODCAST_DESC' },
    { icon: 'assets/images/icons/icon-star.svg', color: 'teal', titleKey: 'LANDING.SERVICES.TRAINING_TITLE', descKey: 'LANDING.SERVICES.TRAINING_DESC' },
    { icon: 'assets/images/icons/icon-map-pin.svg', color: 'indigo', titleKey: 'LANDING.SERVICES.DOMICILIATION_TITLE', descKey: 'LANDING.SERVICES.DOMICILIATION_DESC' },
    { icon: 'assets/images/amenities/amenity-projector.svg', color: 'purple', titleKey: 'LANDING.SERVICES.INCUBATOR_TITLE', descKey: 'LANDING.SERVICES.INCUBATOR_DESC' },
  ];

  testimonials = [
    { quote: 'LANDING.TESTIMONIAL_1', name: 'Sarah M.', role: 'LANDING.ROLE_DESIGNER', avatar: 'assets/images/users/user-avatar-1.jpg' },
    { quote: 'LANDING.TESTIMONIAL_2', name: 'Karim B.', role: 'LANDING.ROLE_FOUNDER', avatar: 'assets/images/users/user-avatar-2.jpg' },
    { quote: 'LANDING.TESTIMONIAL_3', name: 'Amina R.', role: 'LANDING.ROLE_TECH_LEAD', avatar: 'assets/images/users/user-avatar-default.png' },
  ];
}
