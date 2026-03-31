import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppCurrencyPipe } from '../../../../core/pipes/app-currency.pipe';
import { BookingService } from '../../../../core/services/booking.service';
import { BookingResponse, BookingStatus } from '../../../../core/models/booking.models';
import { SubmitReviewComponent } from '../submit-review/submit-review.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AppCurrencyPipe, SubmitReviewComponent],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-left">
            <h1>My <span>Bookings</span></h1>
            <p>Track your reservations and manage your coworking sessions</p>
          </div>
          <div class="header-right">
            <div class="summary-pills">
              <div class="summary-pill pending">
                <span class="pill-count">{{ countByStatus('PENDING') }}</span>
                <span class="pill-label">Pending</span>
              </div>
              <div class="summary-pill confirmed">
                <span class="pill-count">{{ countByStatus('CONFIRMED') }}</span>
                <span class="pill-label">Confirmed</span>
              </div>
              <div class="summary-pill completed">
                <span class="pill-count">{{ countByStatus('COMPLETED') }}</span>
                <span class="pill-label">Completed</span>
              </div>
            </div>
            <button routerLink="/centers" class="btn-new">+ New Booking</button>
          </div>
        </div>
      </div>

      <div class="container content">

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button class="tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">All ({{ bookings().length }})</button>
          <button class="tab" [class.active]="activeTab() === 'PENDING'" (click)="activeTab.set('PENDING')">🕐 Pending</button>
          <button class="tab" [class.active]="activeTab() === 'CONFIRMED'" (click)="activeTab.set('CONFIRMED')">✅ Confirmed</button>
          <button class="tab" [class.active]="activeTab() === 'COMPLETED'" (click)="activeTab.set('COMPLETED')">🏁 Completed</button>
          <button class="tab" [class.active]="activeTab() === 'CANCELLED'" (click)="activeTab.set('CANCELLED')">✕ Cancelled</button>
        </div>

        <!-- Bookings List -->
        <div class="bookings-list" *ngIf="filteredBookings().length > 0">
          <div class="booking-card" *ngFor="let b of filteredBookings()" [class]="'status-' + b.status.toLowerCase()">

            <!-- Status Bar -->
            <div class="status-bar">
              <div class="status-left">
                <span class="status-dot"></span>
                <span class="status-text">{{ b.status }}</span>
                <span class="ref">REF #{{ b.id }}</span>
              </div>
              <span class="booking-date">Booked {{ b.startDateTime | date:'MMM d, y' }}</span>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <div class="space-info">
                <div class="space-icon">🏢</div>
                <div>
                  <h3>{{ b.spaceName }}</h3>
                  <p class="center-name">📍 {{ b.centerName }}</p>
                </div>
              </div>

              <div class="booking-details">
                <div class="detail-block">
                  <span class="detail-label">Check In</span>
                  <span class="detail-val">{{ b.startDateTime | date:'EEE, MMM d' }}</span>
                  <span class="detail-time">{{ b.startDateTime | date:'HH:mm' }}</span>
                </div>
                <div class="detail-arrow">→</div>
                <div class="detail-block">
                  <span class="detail-label">Check Out</span>
                  <span class="detail-val">{{ b.endDateTime | date:'EEE, MMM d' }}</span>
                  <span class="detail-time">{{ b.endDateTime | date:'HH:mm' }}</span>
                </div>
                <div class="detail-divider"></div>
                <div class="detail-block total-block">
                  <span class="detail-label">Total</span>
                  <span class="total-price">{{ b.totalPrice | appCurrency }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="card-actions">
                <button
                  *ngIf="(b.status === 'COMPLETED' || b.status === 'CONFIRMED') && !b.hasReview"
                  (click)="selectedBookingId.set(selectedBookingId() === b.id ? null : b.id)"
                  class="btn-review">
                  {{ selectedBookingId() === b.id ? '✕ Cancel' : '⭐ Leave Review' }}
                </button>
                <span *ngIf="b.hasReview" class="reviewed-badge">✅ Reviewed</span>
              </div>
            </div>

            <!-- Review Form -->
            <div *ngIf="selectedBookingId() === b.id" class="review-panel">
              <app-submit-review
                [bookingId]="b.id"
                (submitted)="onReviewSubmitted()"
                (cancel)="selectedBookingId.set(null)">
              </app-submit-review>
            </div>

          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredBookings().length === 0" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-circle">
              <span class="empty-emoji">📅</span>
            </div>
          </div>
          <h3>No bookings yet</h3>
          <p>Start exploring our coworking spaces and make your first reservation.</p>
          <button routerLink="/centers" class="btn-explore">Explore Spaces →</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { min-height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; }
    .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }

    /* HEADER */
    .page-header { background: linear-gradient(135deg, #0f172a, #1e293b); padding: 40px 0; }
    .page-header .container { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
    h1 { font-size: 2rem; font-weight: 900; color: white; margin: 0 0 6px; span { color: #14b8a6; } }
    .page-header p { color: #64748b; font-size: 0.88rem; margin: 0; }
    .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }
    .summary-pills { display: flex; gap: 10px; }
    .summary-pill { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 16px; text-align: center; min-width: 70px; }
    .pill-count { display: block; font-size: 1.4rem; font-weight: 900; }
    .pill-label { display: block; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.4); margin-top: 2px; }
    .summary-pill.pending .pill-count { color: #fbbf24; }
    .summary-pill.confirmed .pill-count { color: #34d399; }
    .summary-pill.completed .pill-count { color: #94a3b8; }
    .btn-new { background: #14b8a6; color: white; border: none; padding: 11px 22px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; cursor: pointer; text-decoration: none; display: inline-block; &:hover { background: #0d9488; } }

    /* CONTENT */
    .content { padding: 32px 24px 80px; }

    /* FILTER TABS */
    .filter-tabs { display: flex; gap: 4px; background: white; border-radius: 14px; padding: 6px; border: 1px solid #e2e8f0; margin-bottom: 24px; overflow-x: auto; }
    .tab { padding: 8px 16px; border-radius: 10px; border: none; background: none; color: #64748b; font-weight: 600; font-size: 0.85rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; &:hover { background: #f8fafc; color: #1e293b; } &.active { background: #0f172a; color: white; } }

    /* BOOKING CARD */
    .bookings-list { display: flex; flex-direction: column; gap: 16px; }
    .booking-card { background: white; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; transition: all 0.2s; &:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); } }

    /* Status Bar */
    .status-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; font-size: 0.78rem; font-weight: 700; }
    .status-left { display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-text { text-transform: uppercase; letter-spacing: 0.06em; }
    .ref { color: #94a3b8; font-weight: 600; }
    .booking-date { color: #94a3b8; font-weight: 500; }

    .booking-card.status-pending .status-bar { background: #fffbeb; }
    .booking-card.status-pending .status-dot { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); }
    .booking-card.status-pending .status-text { color: #d97706; }

    .booking-card.status-confirmed .status-bar { background: #f0fdf4; }
    .booking-card.status-confirmed .status-dot { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
    .booking-card.status-confirmed .status-text { color: #059669; }

    .booking-card.status-cancelled .status-bar { background: #fef2f2; }
    .booking-card.status-cancelled .status-dot { background: #ef4444; }
    .booking-card.status-cancelled .status-text { color: #dc2626; }

    .booking-card.status-completed .status-bar { background: #f8fafc; }
    .booking-card.status-completed .status-dot { background: #94a3b8; }
    .booking-card.status-completed .status-text { color: #64748b; }

    /* Card Body */
    .card-body { padding: 20px; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; }
    .space-info { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 200px; }
    .space-icon { width: 48px; height: 48px; background: #f0fdfa; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
    .space-info h3 { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0 0 4px; }
    .center-name { font-size: 0.82rem; color: #94a3b8; margin: 0; }

    .booking-details { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .detail-block { text-align: center; }
    .detail-label { display: block; font-size: 0.68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
    .detail-val { display: block; font-size: 0.88rem; font-weight: 700; color: #1e293b; }
    .detail-time { display: block; font-size: 1rem; font-weight: 900; color: #14b8a6; }
    .detail-arrow { color: #cbd5e1; font-size: 1.2rem; font-weight: 300; }
    .detail-divider { width: 1px; height: 40px; background: #e2e8f0; }
    .total-block .total-price { display: block; font-size: 1.4rem; font-weight: 900; color: #1e293b; }

    .card-actions { margin-left: auto; }
    .btn-review { background: #f0fdfa; color: #0d9488; border: 1.5px solid #ccfbf1; padding: 8px 16px; border-radius: 9px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; &:hover { background: #14b8a6; color: white; border-color: #14b8a6; } }
    .reviewed-badge { background: #f0fdf4; color: #16a34a; font-size: 0.78rem; font-weight: 700; padding: 6px 12px; border-radius: 9px; border: 1px solid #bbf7d0; }

    /* Review Panel */
    .review-panel { padding: 0 20px 20px; border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 20px; }

    /* EMPTY */
    .empty-state { text-align: center; padding: 80px 24px; background: white; border-radius: 20px; border: 2px dashed #e2e8f0; }
    .empty-circle { width: 100px; height: 100px; background: #f0fdfa; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .empty-emoji { font-size: 2.5rem; }
    .empty-state h3 { font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 0 0 8px; }
    .empty-state p { color: #94a3b8; margin: 0 0 24px; }
    .btn-explore { background: #14b8a6; color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 0.95rem; text-decoration: none; display: inline-block; &:hover { background: #0d9488; } }

    @media (max-width: 640px) {
      .booking-details { flex-direction: column; align-items: flex-start; }
      .detail-arrow { transform: rotate(90deg); }
      .detail-divider { width: 40px; height: 1px; }
      .card-body { flex-direction: column; align-items: flex-start; }
      .card-actions { margin-left: 0; }
      .summary-pills { display: none; }
    }
  `]
})
export class UserBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private seo = inject(SeoService);

  bookings = signal<BookingResponse[]>([]);
  selectedBookingId = signal<number | null>(null);
  activeTab = signal('all');

  filteredBookings = computed(() =>
    this.activeTab() === 'all'
      ? this.bookings()
      : this.bookings().filter(b => b.status === this.activeTab())
  );

  ngOnInit(): void {
    this.seo.setMeta('My Bookings', 'Manage your co-working space reservations.');
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getMyBookings().subscribe(data => this.bookings.set(data));
  }

  countByStatus(status: string): number {
    return this.bookings().filter(b => b.status === status).length;
  }

  onReviewSubmitted(): void {
    this.selectedBookingId.set(null);
    this.loadBookings();
  }
}
