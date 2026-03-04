import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconsModule } from '@ng-icons/core';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { Center } from '../../../../core/models/catalogue.models';

const FALLBACK_IMAGES = [
  'assets/images/centers/center-hero-casablanca.jpg',
  'assets/images/centers/photo1.jpg',
  'assets/images/spaces/space1.jpg',
  'assets/images/centers/center-thumb-casablanca.jpg',
];

@Component({
  selector: 'app-center-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgIconsModule],
  template: `
    <div class="page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <span class="section-tag">Our Locations</span>
          <h1 [innerHTML]="'CATALOGUE.TITLE' | translate"></h1>
          <p>{{ 'CATALOGUE.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <div class="container">
        <!-- Filters -->
        <div class="filters">
          <div class="search-wrap">
            <ng-icon name="lucideSearch" size="18" class="search-icon"></ng-icon>
            <input type="text" [(ngModel)]="searchTerm"
              [placeholder]="'CATALOGUE.SEARCH_PLACEHOLDER' | translate"
              class="search-input" />
          </div>
          <div class="city-filters">
            <button class="city-btn" [class.active]="selectedCity === ''" (click)="selectedCity = ''">All Cities</button>
            <button class="city-btn" [class.active]="selectedCity === 'Casablanca'" (click)="selectedCity = 'Casablanca'">Casablanca</button>
            <button class="city-btn" [class.active]="selectedCity === 'Rabat'" (click)="selectedCity = 'Rabat'">Rabat</button>
            <button class="city-btn" [class.active]="selectedCity === 'Marrakech'" (click)="selectedCity = 'Marrakech'">Marrakech</button>
          </div>
        </div>

        <!-- Grid -->
        <div class="centers-grid" *ngIf="filteredCenters().length > 0; else empty">
          <div class="center-card" *ngFor="let center of filteredCenters(); let i = index">
            <div class="card-image">
              <img [src]="getImage(center, i)" [alt]="center.name"
                   (error)="onImgError($event, i)" />
              <div class="city-badge">
                <ng-icon name="lucideMapPin" size="12"></ng-icon>
                {{ center.city }}
              </div>
              <div class="rating-badge" *ngIf="center.averageRating">
                ⭐ {{ center.averageRating | number:'1.1-1' }}
              </div>
            </div>
            <div class="card-body">
              <h3>{{ center.name }}</h3>
              <p class="card-desc">{{ center.description }}</p>
              <div class="card-meta">
                <span class="meta-item">
                  <ng-icon name="lucideMapPin" size="14"></ng-icon>
                  {{ center.address }}
                </span>
                <span class="meta-item" *ngIf="center.openingHours">
                  <ng-icon name="lucideClock" size="14"></ng-icon>
                  {{ center.openingHours }}
                </span>
              </div>
              <div class="card-amenities">
                <img src="assets/images/amenities/amenity-wifi.svg" alt="WiFi" title="WiFi" />
                <img src="assets/images/amenities/amenity-coffee.svg" alt="Coffee" title="Coffee" />
                <img src="assets/images/amenities/amenity-parking.svg" alt="Parking" title="Parking" />
                <img src="assets/images/amenities/amenity-projector.svg" alt="Projector" title="Projector" />
              </div>
              <button [routerLink]="['/centers', center.centerId]" class="btn-view">
                View Spaces
                <ng-icon name="lucideArrowRight" size="16"></ng-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <ng-template #empty>
          <div class="empty-state">
            <img src="assets/images/backgrounds/empty-search.png" alt="No results" />
            <h3>{{ 'CATALOGUE.NO_RESULTS' | translate }}</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button class="btn-reset" (click)="searchTerm = ''; selectedCity = ''">Clear Filters</button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }

    .page-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 80px 0 60px;
      text-align: center;
      .section-tag {
        display: inline-block; background: rgba(20,184,166,0.15);
        color: #5eead4; font-size: 0.8rem; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        padding: 6px 16px; border-radius: 100px; margin-bottom: 16px;
        border: 1px solid rgba(20,184,166,0.3);
      }
      h1 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: white; margin: 0 0 16px; ::ng-deep span { color: #14b8a6; } }
      p { color: #94a3b8; font-size: 1.1rem; }
    }

    .filters {
      display: flex; flex-wrap: wrap; gap: 16px;
      align-items: center; padding: 32px 0;
    }
    .search-wrap {
      position: relative; flex: 1; min-width: 260px;
      .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    }
    .search-input {
      width: 100%; padding: 12px 16px 12px 44px;
      border: 1.5px solid #e2e8f0; border-radius: 12px;
      font-size: 0.9rem; outline: none; background: white;
      transition: border-color 0.2s;
      &:focus { border-color: #14b8a6; }
    }
    .city-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .city-btn {
      padding: 10px 18px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      background: white; color: #64748b; font-weight: 600; font-size: 0.85rem;
      cursor: pointer; transition: all 0.2s;
      &:hover { border-color: #14b8a6; color: #14b8a6; }
      &.active { background: #14b8a6; border-color: #14b8a6; color: white; }
    }

    .centers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 28px;
      padding-bottom: 80px;
    }
    .center-card {
      background: white; border-radius: 20px; overflow: hidden;
      border: 1px solid #e2e8f0; transition: all 0.3s;
      display: flex; flex-direction: column;
      &:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
    }
    .card-image {
      position: relative; height: 220px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    }
    .center-card:hover .card-image img { transform: scale(1.06); }
    .city-badge {
      position: absolute; top: 14px; left: 14px;
      background: rgba(15,23,42,0.75); backdrop-filter: blur(4px);
      color: white; font-size: 0.78rem; font-weight: 600;
      padding: 5px 12px; border-radius: 100px;
      display: flex; align-items: center; gap: 4px;
    }
    .rating-badge {
      position: absolute; top: 14px; right: 14px;
      background: rgba(255,255,255,0.95); backdrop-filter: blur(4px);
      color: #1e293b; font-size: 0.82rem; font-weight: 700;
      padding: 5px 12px; border-radius: 100px;
    }
    .card-body {
      padding: 24px; display: flex; flex-direction: column; flex: 1;
      h3 { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0 0 8px; }
    }
    .card-desc {
      color: #64748b; font-size: 0.88rem; line-height: 1.6;
      margin: 0 0 16px; flex: 1;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .meta-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.82rem; color: #94a3b8;
      ng-icon { color: #14b8a6; flex-shrink: 0; }
    }
    .card-amenities {
      display: flex; gap: 10px; margin-bottom: 20px;
      img { width: 26px; height: 26px; opacity: 0.5; transition: opacity 0.2s; &:hover { opacity: 1; } }
    }
    .btn-view {
      width: 100%; padding: 12px; border-radius: 12px;
      background: #f8fafc; border: 1.5px solid #e2e8f0;
      color: #1e293b; font-weight: 700; font-size: 0.9rem;
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      &:hover { background: #14b8a6; border-color: #14b8a6; color: white; }
    }

    .empty-state {
      text-align: center; padding: 80px 24px;
      img { width: 200px; opacity: 0.6; margin-bottom: 24px; }
      h3 { font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
      p { color: #94a3b8; margin: 0 0 24px; }
    }
    .btn-reset {
      padding: 12px 28px; border-radius: 12px; background: #14b8a6;
      border: none; color: white; font-weight: 700; cursor: pointer;
      &:hover { background: #0d9488; }
    }

    @media (max-width: 640px) {
      .centers-grid { grid-template-columns: 1fr; }
      .filters { flex-direction: column; }
      .search-wrap { min-width: 100%; }
    }
  `]
})
export class CenterGalleryComponent implements OnInit {
  private catalogueService = inject(CatalogueService);

  centers = signal<Center[]>([]);
  searchTerm = '';
  selectedCity = '';

  filteredCenters = computed(() =>
    this.centers().filter(c => {
      const matchSearch = (c.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          (c.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCity = !this.selectedCity || c.city === this.selectedCity;
      return matchSearch && matchCity;
    })
  );

  ngOnInit(): void {
    this.catalogueService.getCenters().subscribe((data: Center[]) => this.centers.set(data));
  }

  getImage(center: Center, index: number): string {
    if (center.photos && center.photos.length > 0) return center.photos[0];
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  }

  onImgError(event: any, index: number): void {
    event.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  }
}
