import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppCurrencyPipe } from '../../../../core/pipes/app-currency.pipe';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Center, Space, SpaceType } from '../../../../core/models/catalogue.models';
import { ReviewListComponent } from '../review-list/review-list.component';
import { SeoService } from '../../../../core/services/seo.service';

const TYPE_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  PRIVATE_OFFICE:  { label: 'Private Office',   emoji: '🏢', color: '#6366f1', bg: '#eef2ff' },
  CONFERENCE_ROOM: { label: 'Conference Room',  emoji: '🎯', color: '#f59e0b', bg: '#fffbeb' },
  OPEN_SPACE:      { label: 'Open Space',        emoji: '🌐', color: '#10b981', bg: '#f0fdf4' },
  TRAINING_ROOM:   { label: 'Training Room',     emoji: '🎓', color: '#8b5cf6', bg: '#faf5ff' },
};

@Component({
  selector: 'app-space-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AppCurrencyPipe, ReviewListComponent],
  template: `
    <div class="page">

      <!-- Center Hero -->
      <div class="center-hero" *ngIf="center()">
        <div class="hero-bg">
          <img [src]="center()?.photos?.[0] || 'assets/images/centers/center-hero-casablanca.jpg'" [alt]="center()?.name" />
          <div class="hero-overlay"></div>
        </div>
        <div class="container hero-content">
          <a routerLink="/centers" class="back-link">← All Centers</a>
          <div class="hero-body">
            <div class="hero-left">
              <div class="hero-tags">
                <span class="city-tag">📍 {{ center()?.city }}</span>
                <span class="rating-tag" *ngIf="center()?.averageRating">⭐ {{ center()?.averageRating | number:'1.1-1' }}</span>
              </div>
              <h1>{{ center()?.name }}</h1>
              <p>{{ center()?.description }}</p>
              <div class="hero-meta">
                <span *ngIf="center()?.openingHours">🕐 {{ center()?.openingHours }}</span>
                <span *ngIf="center()?.phone">📞 {{ center()?.phone }}</span>
                <span *ngIf="center()?.email">✉️ {{ center()?.email }}</span>
              </div>
            </div>
            <div class="hero-right">
              <div class="spaces-count-card">
                <span class="count">{{ spaces().length }}</span>
                <span class="count-label">Spaces Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spaces Section -->
      <div class="container spaces-section">

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <h2>Available Spaces</h2>
            <span class="count-pill">{{ filteredSpaces().length }}</span>
          </div>
          <div class="toolbar-right">
            <!-- Type Filter -->
            <div class="type-filters">
              <button class="type-pill" [class.active]="activeFilter() === ''" (click)="activeFilter.set('')">All</button>
              <button class="type-pill" *ngFor="let t of spaceTypes"
                [class.active]="activeFilter() === t"
                (click)="activeFilter.set(t)">
                {{ typeMeta[t]?.emoji }} {{ typeMeta[t]?.label }}
              </button>
            </div>
            <button *ngIf="auth.isAdmin()" [routerLink]="['/admin/spaces/new']" [queryParams]="{centerId: center()?.centerId}" class="btn-add">
              + Add Space
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="loading-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
        </div>

        <!-- Spaces Grid -->
        <div class="spaces-grid" *ngIf="!loading()">
          <div class="space-card" *ngFor="let space of filteredSpaces()">

            <!-- Image -->
            <div class="card-img">
              <img [src]="space.photos && space.photos[0] ? space.photos[0] : 'assets/images/spaces/space1.jpg'" [alt]="space.name"
                   (error)="onImgError($event)" />
              <div class="type-badge" [style.background]="typeMeta[space.type]?.bg" [style.color]="typeMeta[space.type]?.color">
                {{ typeMeta[space.type]?.emoji }} {{ typeMeta[space.type]?.label }}
              </div>
              <div class="capacity-badge">👥 {{ space.capacity }}</div>
            </div>

            <!-- Body -->
            <div class="card-body">
              <div class="card-top">
                <div>
                  <h3>{{ space.name }}</h3>
                  <p class="card-desc">{{ space.description }}</p>
                </div>
                <div class="rating-wrap" *ngIf="space.averageRating > 0">
                  <span class="star">★</span>
                  <span class="rating-val">{{ space.averageRating | number:'1.1-1' }}</span>
                </div>
              </div>

              <!-- Amenities -->
              <div class="amenities" *ngIf="space.amenities && space.amenities.length">
                <span class="amenity" *ngFor="let a of space.amenities | slice:0:4">{{ a }}</span>
                <span class="amenity more" *ngIf="space.amenities.length > 4">+{{ space.amenities.length - 4 }}</span>
              </div>

              <!-- Pricing + CTA -->
              <div class="card-footer">
                <div class="pricing">
                  <span class="price">{{ space.pricePerHour | appCurrency }}</span>
                  <span class="per">/ hour</span>
                  <span class="per-day" *ngIf="space.pricePerDay">· {{ space.pricePerDay | appCurrency }}/day</span>
                </div>
                <div class="card-actions">
                  <button *ngIf="!auth.isAdmin()" [routerLink]="['/booking/new', space.id]" class="btn-book">
                    Book Now →
                  </button>
                  <div *ngIf="auth.isAdmin()" class="admin-actions">
                    <button [routerLink]="['/admin/spaces/edit', space.id]" [queryParams]="{centerId: center()?.centerId}" class="btn-edit">
                      ✏ Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews -->
            <div class="card-reviews">
              <app-review-list [spaceId]="space.id"></app-review-list>
            </div>
          </div>

          <!-- Empty -->
          <div *ngIf="filteredSpaces().length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No spaces found</h3>
            <p>Try a different filter or check back later.</p>
            <button (click)="activeFilter.set('')" class="btn-reset">Clear Filter</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }

    /* HERO */
    .center-hero { position: relative; min-height: 380px; display: flex; align-items: flex-end; overflow: hidden; }
    .hero-bg {
      position: absolute; inset: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
      .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 60%, rgba(15,23,42,0.2) 100%); }
    }
    .hero-content { position: relative; z-index: 2; padding: 32px 24px; width: 100%; }
    .back-link { color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: 600; text-decoration: none; display: inline-block; margin-bottom: 20px; transition: color 0.2s; &:hover { color: #14b8a6; } }
    .hero-body { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
    .hero-left { flex: 1; }
    .hero-tags { display: flex; gap: 8px; margin-bottom: 12px; }
    .city-tag, .rating-tag { background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); color: white; font-size: 0.8rem; font-weight: 600; padding: 5px 14px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.2); }
    .rating-tag { color: #fbbf24; }
    .hero-left h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 900; color: white; margin: 0 0 12px; }
    .hero-left p { color: rgba(255,255,255,0.75); font-size: 1rem; line-height: 1.6; margin: 0 0 16px; max-width: 600px; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 16px; }
    .hero-meta span { color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: 500; }
    .spaces-count-card { background: rgba(20,184,166,0.15); border: 1px solid rgba(20,184,166,0.3); backdrop-filter: blur(8px); border-radius: 20px; padding: 24px 32px; text-align: center; flex-shrink: 0; }
    .count { display: block; font-size: 3rem; font-weight: 900; color: #14b8a6; line-height: 1; }
    .count-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }

    /* SPACES SECTION */
    .spaces-section { padding: 40px 24px 80px; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .toolbar-left { display: flex; align-items: center; gap: 12px; }
    .toolbar-left h2 { font-size: 1.4rem; font-weight: 900; color: #1e293b; margin: 0; }
    .count-pill { background: #e2e8f0; color: #64748b; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
    .toolbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .type-filters { display: flex; gap: 6px; flex-wrap: wrap; }
    .type-pill { padding: 7px 14px; border-radius: 100px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; &:hover { border-color: #14b8a6; color: #14b8a6; } &.active { background: #0f172a; border-color: #0f172a; color: white; } }
    .btn-add { background: #14b8a6; color: white; border: none; padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; white-space: nowrap; text-decoration: none; display: inline-block; &:hover { background: #0d9488; } }

    /* SKELETON */
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
    .skeleton-card { background: white; border-radius: 20px; height: 420px; border: 1px solid #e2e8f0; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* SPACES GRID */
    .spaces-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
    .space-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; transition: all 0.3s; display: flex; flex-direction: column; &:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); } }

    /* Card Image */
    .card-img { position: relative; height: 200px; overflow: hidden; flex-shrink: 0;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    }
    .space-card:hover .card-img img { transform: scale(1.05); }
    .type-badge { position: absolute; top: 12px; left: 12px; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
    .capacity-badge { position: absolute; top: 12px; right: 12px; background: rgba(15,23,42,0.7); backdrop-filter: blur(4px); color: white; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 100px; }

    /* Card Body */
    .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 14px; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .card-top h3 { font-size: 1.05rem; font-weight: 800; color: #1e293b; margin: 0 0 6px; }
    .card-desc { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .rating-wrap { display: flex; align-items: center; gap: 3px; flex-shrink: 0; background: #fffbeb; padding: 4px 10px; border-radius: 100px; }
    .star { color: #f59e0b; font-size: 0.85rem; }
    .rating-val { font-size: 0.8rem; font-weight: 700; color: #92400e; }

    /* Amenities */
    .amenities { display: flex; flex-wrap: wrap; gap: 6px; }
    .amenity { background: #f0fdfa; color: #0d9488; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; border: 1px solid #ccfbf1; }
    .amenity.more { background: #f8fafc; color: #94a3b8; border-color: #e2e8f0; }

    /* Footer */
    .card-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: auto; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .pricing { display: flex; align-items: baseline; gap: 4px; }
    .price { font-size: 1.4rem; font-weight: 900; color: #1e293b; }
    .per { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }
    .per-day { font-size: 0.75rem; color: #94a3b8; }
    .card-actions { display: flex; gap: 8px; }
    .btn-book { background: #14b8a6; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-decoration: none; display: inline-block; &:hover { background: #0d9488; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(20,184,166,0.3); } }
    .admin-actions { display: flex; gap: 6px; }
    .btn-edit { background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; padding: 9px 16px; border-radius: 9px; font-size: 0.82rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; &:hover { background: #eef2ff; color: #6366f1; border-color: #6366f1; } }

    /* Reviews */
    .card-reviews { padding: 0 20px 20px; }

    /* Empty */
    .empty-state { grid-column: 1/-1; text-align: center; padding: 80px 24px; background: white; border-radius: 20px; border: 2px dashed #e2e8f0; }
    .empty-icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0 0 8px; }
    .empty-state p { color: #94a3b8; margin: 0 0 20px; }
    .btn-reset { background: #14b8a6; color: white; border: none; padding: 10px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; &:hover { background: #0d9488; } }

    @media (max-width: 768px) {
      .hero-body { flex-direction: column; align-items: flex-start; }
      .spaces-count-card { display: none; }
      .spaces-grid { grid-template-columns: 1fr; }
      .toolbar { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class SpaceListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogueService = inject(CatalogueService);
  private seo = inject(SeoService);
  auth = inject(AuthService);

  center = signal<Center | null>(null);
  spaces = signal<Space[]>([]);
  loading = signal(true);
  activeFilter = signal('');

  typeMeta = TYPE_META;
  spaceTypes = Object.keys(TYPE_META);

  filteredSpaces = computed(() =>
    this.activeFilter()
      ? this.spaces().filter(s => s.type === this.activeFilter())
      : this.spaces()
  );

  ngOnInit(): void {
    const centerId = Number(this.route.snapshot.paramMap.get('id'));
    if (centerId) {
      this.catalogueService.getCenterById(centerId).subscribe(c => {
        this.center.set(c);
        if (c) this.seo.setMeta(c.name, c.description || 'Explore our available co-working spaces.');
      });
      this.catalogueService.getSpacesByCenter(centerId).subscribe(s => {
        this.spaces.set(s);
        this.loading.set(false);
      });
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/images/spaces/space1.jpg';
  }
}
