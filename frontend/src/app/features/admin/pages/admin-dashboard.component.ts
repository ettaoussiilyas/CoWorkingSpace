import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppCurrencyPipe } from '../../../core/pipes/app-currency.pipe';
import { BookingService } from '../../../core/services/booking.service';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { AdminService } from '../../../core/services/admin.service';
import { BookingResponse, BookingStatus } from '../../../core/models/booking.models';
import { Center, Space } from '../../../core/models/catalogue.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, AppCurrencyPipe],
  template: `
    <div class="admin-page">

      <!-- Header -->
      <div class="admin-header">
        <div class="container">
          <div class="header-left">
            <img src="assets/images/icons/logo-full.png" alt="AIHub" class="admin-logo" />
            <div>
              <h1>Admin <span>Dashboard</span></h1>
              <p>Manage spaces, bookings and monitor performance</p>
            </div>
          </div>
          <div class="header-actions">
            <button routerLink="/" class="btn-ghost">← Back to Site</button>
          </div>
        </div>
      </div>

      <div class="container">

        <!-- Tab Nav -->
        <div class="tab-nav">
          <button class="tab-btn" [class.active]="activeTab() === 'stats'" (click)="activeTab.set('stats')">
            <img src="assets/images/icons/icon-star.svg" alt="" /> Stats
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'bookings'" (click)="activeTab.set('bookings'); loadBookings()">
            <img src="assets/images/icons/icon-booking.svg" alt="" /> Bookings
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'spaces'" (click)="activeTab.set('spaces'); loadSpaces()">
            <img src="assets/images/icons/icon-calendar.svg" alt="" /> Spaces
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'centers'" (click)="activeTab.set('centers'); loadCenters()">
            <img src="assets/images/icons/icon-map-pin.svg" alt="" /> Centers
          </button>
        </div>

        <!-- STATS TAB -->
        <div *ngIf="activeTab() === 'stats'">
          <div class="stats-grid">
            <div class="stat-card teal">
              <div class="stat-icon"><img src="assets/images/icons/icon-booking.svg" alt="" /></div>
              <div class="stat-body">
                <span>Total Bookings</span>
                <strong>{{ stats()?.totalBookings ?? '—' }}</strong>
              </div>
            </div>
            <div class="stat-card indigo">
              <div class="stat-icon"><img src="assets/images/icons/icon-user.svg" alt="" /></div>
              <div class="stat-body">
                <span>Total Users</span>
                <strong>{{ stats()?.totalUsers ?? '—' }}</strong>
              </div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon"><img src="assets/images/icons/icon-search.svg" alt="" /></div>
              <div class="stat-body">
                <span>Total Spaces</span>
                <strong>{{ stats()?.totalSpaces ?? '—' }}</strong>
              </div>
            </div>
            <div class="stat-card orange">
              <div class="stat-icon"><img src="assets/images/icons/icon-star.svg" alt="" /></div>
              <div class="stat-body">
                <span>Total Revenue</span>
                <strong>{{ stats()?.totalRevenue ?? '—' }} DH</strong>
              </div>
            </div>
          </div>

          <div class="info-banner">
            <img src="assets/images/icons/icon-star.svg" alt="" />
            <p>Stats are loaded from the backend. Make sure you have bookings and spaces to see data here.</p>
          </div>
        </div>

        <!-- BOOKINGS TAB -->
        <div *ngIf="activeTab() === 'bookings'">
          <div class="section-toolbar">
            <h2>All Bookings <span class="count-badge">{{ filteredBookings().length }}</span></h2>
            <div class="toolbar-right">
              <input [(ngModel)]="bookingSearch" placeholder="Search by name, space..." class="search-input" />
              <select [(ngModel)]="bookingStatusFilter" class="filter-select">
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Space / Center</th>
                  <th>Period</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of filteredBookings()">
                  <td class="ref">{{ b.id }}</td>
                  <td>
                    <div class="client-cell">
                      <div class="avatar">{{ b.userName?.charAt(0) | uppercase }}</div>
                      <div>
                        <strong>{{ b.userName }}</strong>
                        <span>{{ b.userEmail }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{{ b.spaceName }}</strong>
                    <span>{{ b.centerName }}</span>
                  </td>
                  <td>
                    <span>{{ b.startDateTime | date:'dd/MM/yy HH:mm' }}</span>
                    <span>→ {{ b.endDateTime | date:'dd/MM/yy HH:mm' }}</span>
                  </td>
                  <td class="price">{{ b.totalPrice | appCurrency }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="'s-' + b.status.toLowerCase()">
                      {{ b.status }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button *ngIf="b.status === 'PENDING'" (click)="updateStatus(b.id, 'CONFIRMED')" class="act-btn confirm">✓ Confirm</button>
                      <button *ngIf="b.status !== 'CANCELLED' && b.status !== 'COMPLETED'" (click)="updateStatus(b.id, 'CANCELLED')" class="act-btn cancel">✕ Cancel</button>
                      <button *ngIf="b.status === 'CONFIRMED'" (click)="updateStatus(b.id, 'COMPLETED')" class="act-btn complete">✔ Complete</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredBookings().length === 0">
                  <td colspan="7" class="empty-row">No bookings found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SPACES TAB -->
        <div *ngIf="activeTab() === 'spaces'">
          <div class="section-toolbar">
            <h2>All Spaces <span class="count-badge">{{ spaces().length }}</span></h2>
            <button [routerLink]="['/admin/spaces/new']" [queryParams]="{centerId: selectedCenterId()}" class="btn-primary">+ New Space</button>
          </div>

          <div class="center-filter">
            <button class="center-pill" [class.active]="selectedCenterId() === null" (click)="selectedCenterId.set(null)">All Centers</button>
            <button class="center-pill" *ngFor="let c of centers()" [class.active]="selectedCenterId() === c.centerId" (click)="selectedCenterId.set(c.centerId)">{{ c.name }}</button>
          </div>

          <div class="spaces-grid">
            <div class="space-card" *ngFor="let s of filteredSpaces()">
              <div class="space-img">
                <img [src]="s.photos?.[0] || 'assets/images/spaces/space1.jpg'" [alt]="s.name" />
                <span class="type-tag">{{ s.type }}</span>
              </div>
              <div class="space-body">
                <h3>{{ s.name }}</h3>
                <p>{{ s.description }}</p>
                <div class="space-meta">
                  <span>👥 {{ s.capacity }}</span>
                  <span class="space-price">{{ s.pricePerHour | appCurrency }}/h</span>
                </div>
                <div class="space-actions">
                  <button [routerLink]="['/admin/spaces/edit', s.id]" [queryParams]="{centerId: s.centerId}" class="btn-edit">✏ Edit</button>
                  <button (click)="deleteSpace(s.id)" class="btn-delete">🗑 Delete</button>
                </div>
              </div>
            </div>
            <div *ngIf="filteredSpaces().length === 0" class="empty-spaces">
              <p>No spaces yet.</p>
              <button [routerLink]="['/admin/spaces/new']" class="btn-primary">+ Add First Space</button>
            </div>
          </div>
        </div>

        <!-- CENTERS TAB -->
        <div *ngIf="activeTab() === 'centers'">
          <div class="section-toolbar">
            <h2>All Centers <span class="count-badge">{{ centers().length }}</span></h2>
          </div>
          <div class="centers-list">
            <div class="center-row" *ngFor="let c of centers()">
              <img [src]="c.photos?.[0] || 'assets/images/centers/center-hero-casablanca.jpg'" [alt]="c.name" class="center-thumb" />
              <div class="center-info">
                <h3>{{ c.name }}</h3>
                <p>{{ c.city }} — {{ c.address }}</p>
              </div>
              <div class="center-meta-right">
                <span class="rating-pill">⭐ {{ c.averageRating | number:'1.1-1' }}</span>
                <span class="hours-pill">{{ c.openingHours }}</span>
              </div>
              <button [routerLink]="['/centers', c.centerId]" class="btn-view-center">View Spaces →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .admin-page { min-height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; }

    .admin-header {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      padding: 24px 0; margin-bottom: 0;
      .container { display: flex; justify-content: space-between; align-items: center; }
    }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .admin-logo { height: 36px; filter: brightness(0) invert(1); opacity: 0.9; }
    h1 { font-size: 1.5rem; font-weight: 900; color: white; margin: 0; span { color: #14b8a6; } }
    .admin-header p { color: #64748b; font-size: 0.85rem; margin: 4px 0 0; }
    .btn-ghost { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; &:hover { background: rgba(255,255,255,0.15); } }

    .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

    .tab-nav { display: flex; gap: 4px; background: white; border-radius: 0 0 16px 16px; padding: 12px 16px; border: 1px solid #e2e8f0; border-top: none; margin-bottom: 28px; }
    .tab-btn {
      display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px;
      border: none; background: none; color: #64748b; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
      img { width: 16px; height: 16px; opacity: 0.5; }
      &:hover { background: #f8fafc; color: #1e293b; }
      &.active { background: #0f172a; color: white; img { filter: invert(1); opacity: 0.8; } }
    }

    /* STATS */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
    .stat-card {
      background: white; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px;
      border: 1px solid #e2e8f0; transition: all 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      img { width: 24px; height: 24px; }
    }
    .stat-card.teal .stat-icon { background: #f0fdfa; img { filter: invert(52%) sepia(98%) saturate(400%) hue-rotate(130deg); } }
    .stat-card.indigo .stat-icon { background: #eef2ff; img { filter: invert(40%) sepia(80%) saturate(500%) hue-rotate(210deg); } }
    .stat-card.purple .stat-icon { background: #faf5ff; img { filter: invert(40%) sepia(60%) saturate(500%) hue-rotate(260deg); } }
    .stat-card.orange .stat-icon { background: #fff7ed; img { filter: invert(60%) sepia(80%) saturate(500%) hue-rotate(10deg); } }
    .stat-body span { font-size: 0.78rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
    .stat-body strong { font-size: 1.8rem; font-weight: 900; color: #1e293b; }
    .info-banner { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 12px; color: #0d9488; font-size: 0.88rem; img { width: 18px; height: 18px; filter: invert(52%) sepia(98%) saturate(400%) hue-rotate(130deg); } }

    /* TOOLBAR */
    .section-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 10px; }
    }
    .count-badge { background: #e2e8f0; color: #64748b; font-size: 0.75rem; font-weight: 700; padding: 2px 10px; border-radius: 100px; }
    .toolbar-right { display: flex; gap: 10px; }
    .search-input { padding: 9px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; outline: none; width: 240px; &:focus { border-color: #14b8a6; } }
    .filter-select { padding: 9px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; outline: none; background: white; cursor: pointer; }
    .btn-primary { background: #14b8a6; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; &:hover { background: #0d9488; } }

    /* TABLE */
    .table-wrap { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 40px; overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse;
      th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e2e8f0; }
      td { padding: 14px 16px; border-bottom: 1px solid #f8fafc; font-size: 0.88rem; vertical-align: middle;
        strong { display: block; font-weight: 700; color: #1e293b; }
        span { display: block; color: #94a3b8; font-size: 0.78rem; }
      }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: #fafafa; }
    }
    .ref { color: #94a3b8; font-weight: 700; font-size: 0.8rem; }
    .client-cell { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #14b8a6, #6366f1); color: white; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .price { font-weight: 800; color: #14b8a6; font-size: 0.95rem; }
    .status-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      &.s-pending { background: #fffbeb; color: #f59e0b; }
      &.s-confirmed { background: #f0fdf4; color: #10b981; }
      &.s-cancelled { background: #fef2f2; color: #ef4444; }
      &.s-completed { background: #f8fafc; color: #64748b; }
    }
    .action-btns { display: flex; gap: 6px; }
    .act-btn { padding: 5px 10px; border-radius: 7px; border: none; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap;
      &.confirm { background: #f0fdf4; color: #10b981; &:hover { background: #10b981; color: white; } }
      &.cancel { background: #fef2f2; color: #ef4444; &:hover { background: #ef4444; color: white; } }
      &.complete { background: #f8fafc; color: #64748b; &:hover { background: #64748b; color: white; } }
    }
    .empty-row { text-align: center; color: #94a3b8; padding: 40px; font-style: italic; }

    /* SPACES */
    .center-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .center-pill { padding: 7px 16px; border-radius: 100px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; &:hover { border-color: #14b8a6; color: #14b8a6; } &.active { background: #14b8a6; border-color: #14b8a6; color: white; } }
    .spaces-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .space-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; transition: all 0.2s; &:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); } }
    .space-img { position: relative; height: 160px; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
    .type-tag { position: absolute; top: 10px; right: 10px; background: rgba(15,23,42,0.75); color: white; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
    .space-body { padding: 16px; h3 { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0 0 4px; } p { font-size: 0.82rem; color: #94a3b8; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } }
    .space-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 0.82rem; color: #64748b; }
    .space-price { font-weight: 800; color: #14b8a6; font-size: 0.95rem; }
    .space-actions { display: flex; gap: 8px; }
    .btn-edit { flex: 1; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; font-size: 0.82rem; font-weight: 600; cursor: pointer; &:hover { background: #eef2ff; color: #6366f1; border-color: #6366f1; } }
    .btn-delete { flex: 1; padding: 8px; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; font-size: 0.82rem; font-weight: 600; cursor: pointer; &:hover { background: #ef4444; color: white; } }
    .empty-spaces { grid-column: 1/-1; text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #e2e8f0; p { color: #94a3b8; margin-bottom: 16px; } }

    /* CENTERS */
    .centers-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
    .center-row { background: white; border-radius: 14px; border: 1px solid #e2e8f0; padding: 16px 20px; display: flex; align-items: center; gap: 16px; transition: all 0.2s; &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); } }
    .center-thumb { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
    .center-info { flex: 1; h3 { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0 0 4px; } p { font-size: 0.82rem; color: #94a3b8; margin: 0; } }
    .center-meta-right { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
    .rating-pill { background: #fffbeb; color: #f59e0b; font-size: 0.78rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
    .hours-pill { background: #f0fdfa; color: #0d9488; font-size: 0.78rem; font-weight: 600; padding: 3px 10px; border-radius: 100px; }
    .btn-view-center { background: #0f172a; color: white; border: none; padding: 9px 18px; border-radius: 9px; font-size: 0.82rem; font-weight: 700; cursor: pointer; white-space: nowrap; text-decoration: none; display: inline-block; &:hover { background: #14b8a6; } }

    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
      .tab-nav { overflow-x: auto; }
      .toolbar-right { flex-direction: column; }
      .search-input { width: 100%; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private bookingService = inject(BookingService);
  private catalogueService = inject(CatalogueService);
  private adminService = inject(AdminService);
  private http = inject(HttpClient);

  activeTab = signal<'stats' | 'bookings' | 'spaces' | 'centers'>('stats');
  bookings = signal<BookingResponse[]>([]);
  spaces = signal<Space[]>([]);
  centers = signal<Center[]>([]);
  stats = signal<any>(null);
  bookingSearch = '';
  bookingStatusFilter = '';
  selectedCenterId = signal<number | null>(null);

  filteredBookings = computed(() =>
    this.bookings().filter(b => {
      const matchSearch = !this.bookingSearch ||
        b.userName?.toLowerCase().includes(this.bookingSearch.toLowerCase()) ||
        b.spaceName?.toLowerCase().includes(this.bookingSearch.toLowerCase()) ||
        b.userEmail?.toLowerCase().includes(this.bookingSearch.toLowerCase());
      const matchStatus = !this.bookingStatusFilter || b.status === this.bookingStatusFilter;
      return matchSearch && matchStatus;
    })
  );

  filteredSpaces = computed(() =>
    this.selectedCenterId() === null
      ? this.spaces()
      : this.spaces().filter(s => s.centerId === this.selectedCenterId())
  );

  ngOnInit() {
    this.loadStats();
    this.loadCenters();
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/stats/dashboard`).subscribe({
      next: (data) => this.stats.set(data?.summaryCards || data),
      error: () => {}
    });
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe(data => this.bookings.set(data));
  }

  loadSpaces() {
    this.catalogueService.getCenters().subscribe(centers => {
      this.centers.set(centers);
      const all: Space[] = [];
      let loaded = 0;
      if (centers.length === 0) { this.spaces.set([]); return; }
      centers.forEach(c => {
        this.catalogueService.getSpacesByCenter(c.centerId).subscribe(spaces => {
          all.push(...spaces);
          loaded++;
          if (loaded === centers.length) this.spaces.set(all);
        });
      });
    });
  }

  loadCenters() {
    this.catalogueService.getCenters().subscribe(data => this.centers.set(data));
  }

  updateStatus(id: number, status: string) {
    this.bookingService.updateBookingStatus(id, status).subscribe(() => this.loadBookings());
  }

  deleteSpace(id: number) {
    if (!confirm('Delete this space? This cannot be undone.')) return;
    this.adminService.deleteSpace(id).subscribe(() => this.loadSpaces());
  }
}
