import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pricing-grid">
      <div class="pricing-card" *ngFor="let tier of tiers" [class.popular]="tier.popular">
        <div class="popular-badge" *ngIf="tier.popular">Most Popular</div>
        <div class="card-top">
          <div class="tier-icon">{{ tier.icon }}</div>
          <h3 class="tier-name">{{ tier.name }}</h3>
          <div class="price-row">
            <span class="from">from</span>
            <span class="price">{{ tier.price }} DH</span>
            <span class="unit">/Hour</span>
          </div>
        </div>
        <ul class="features">
          <li *ngFor="let f of tier.features">
            <span class="check">✓</span>
            <span>{{ f }}</span>
          </li>
        </ul>
        <button routerLink="/centers" class="cta-btn">Book Now →</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 28px;
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px 80px;
    }

    .pricing-card {
      position: relative;
      background: white;
      border-radius: 24px;
      border: 1.5px solid #e2e8f0;
      padding: 36px 32px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      transition: all 0.3s;
      &:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
      &.popular {
        border-color: #14b8a6;
        background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
        box-shadow: 0 20px 48px rgba(20,184,166,0.2);
        .tier-name { color: white; }
        .price { color: #14b8a6; }
        .from, .unit { color: rgba(255,255,255,0.5); }
        .features li { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.08); }
        .check { color: #14b8a6; }
        .cta-btn { background: #14b8a6; color: white; border-color: #14b8a6; &:hover { background: #0d9488; } }
      }
    }

    .popular-badge {
      position: absolute;
      top: -14px; left: 50%; transform: translateX(-50%);
      background: #14b8a6; color: white;
      font-size: 0.75rem; font-weight: 700;
      padding: 5px 18px; border-radius: 100px;
      white-space: nowrap;
    }

    .card-top { display: flex; flex-direction: column; gap: 8px; }

    .tier-icon { font-size: 2rem; }

    .tier-name {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-top: 4px;
    }
    .from { font-size: 0.85rem; color: #94a3b8; }
    .price { font-size: 2.4rem; font-weight: 900; color: #1e293b; line-height: 1; }
    .unit { font-size: 0.9rem; color: #94a3b8; }

    .features {
      list-style: none;
      padding: 0; margin: 0;
      display: flex; flex-direction: column;
      flex: 1;
    }
    .features li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.9rem;
      color: #475569;
      &:last-child { border-bottom: none; }
    }
    .check {
      color: #14b8a6;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .cta-btn {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      color: #1e293b;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { background: #14b8a6; border-color: #14b8a6; color: white; }
    }

    @media (max-width: 640px) {
      .pricing-grid { grid-template-columns: 1fr; padding: 0 16px 60px; }
    }
  `]
})
export class PricingComponent {
  tiers = [
    {
      icon: '🖥️',
      name: 'Open Space',
      price: 25,
      popular: false,
      features: [
        'Furnished',
        'Day 100 DH',
        'Week 650 DH',
        'Month 2,500 DH',
        'Year 27,600 DH',
        '20 Pages → Monthly',
        '40% off Hot Drinks & Soda',
      ]
    },
    {
      icon: '🏢',
      name: 'Bureau Small',
      price: 100,
      popular: true,
      features: [
        'Furnished',
        'Day 350 DH',
        'Week 1,000 DH',
        'Month 4,000 DH',
        '8H Conference Room',
        '40 Pages → Monthly',
        '40% off Hot Drinks & Soda',
      ]
    },
    {
      icon: '🏛️',
      name: 'Bureau Standard',
      price: 150,
      popular: false,
      features: [
        'Furnished',
        'Day 400 DH',
        'Week 2,000 DH',
        'Month 7,000 DH',
        'Year 78,000 DH',
        '8H Conference Room',
        '40 Pages → Monthly',
        '40% off Hot Drinks & Soda',
      ]
    }
  ];
}
