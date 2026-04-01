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
import { AdminCalendarComponent } from '../components/booking-calendar/booking-calendar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, AppCurrencyPipe, AdminCalendarComponent],
  template: `
    <div class="admin-page">

      <!-- Header -->
      <div class="admin-header">
        <div class="container">
          <div class="header-left">
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Stats
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'bookings'" (click)="activeTab.set('bookings'); loadBookings()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Bookings
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'spaces'" (click)="activeTab.set('spaces'); loadSpaces()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Spaces
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'centers'" (click)="activeTab.set('centers'); loadCenters()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Centers
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'calendar'" (click)="activeTab.set('calendar')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/></svg>
            Calendar
          </button>
        </div>

        <!-- STATS TAB -->
        <div *ngIf="activeTab() === 'stats'">

          <!-- Skeleton -->
          <div *ngIf="statsLoading()" class="sk-wrap">
            <div class="sk-hero"></div>
            <div class="sk-row"><div class="sk-card" *ngFor="let i of [1,2,3,4]"></div></div>
            <div class="sk-row"><div class="sk-wide"></div><div class="sk-wide"></div></div>
          </div>

          <!-- Error -->
          <div *ngIf="statsError()" class="stats-error">⚠️ Could not load stats. Make sure you are logged in as admin.</div>

          <div *ngIf="!statsLoading() && !statsError()">

            <!-- Welcome Banner -->
            <div class="welcome-banner">
              <div class="wb-left">
                <div class="wb-greeting">Good day, Admin 👋</div>
                <h2>Here's what's happening with <span>SpaceHub</span> today</h2>
                <p>All systems operational · Last updated just now</p>
              </div>
              <div class="wb-right">
                <div class="wb-date">{{ today | date:'EEEE, MMMM d, y' }}</div>
                <div class="wb-pulse"><span class="pulse-dot"></span> Live</div>
              </div>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid">
              <div class="kpi-card k-teal">
                <div class="kpi-top">
                  <div class="kpi-shape">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <span class="kpi-trend up">+12% this month</span>
                </div>
                <div class="kpi-value">{{ stats()?.totalBookings ?? 0 }}</div>
                <div class="kpi-label">Total Bookings</div>
                <div class="kpi-bar"><div class="kpi-bar-fill" [style.width]="bookingBarWidth()"></div></div>
              </div>
              <div class="kpi-card k-indigo">
                <div class="kpi-top">
                  <div class="kpi-shape">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span class="kpi-trend up">+5 this week</span>
                </div>
                <div class="kpi-value">{{ stats()?.totalUsers ?? 0 }}</div>
                <div class="kpi-label">Registered Users</div>
                <div class="kpi-bar"><div class="kpi-bar-fill" [style.width]="userBarWidth()"></div></div>
              </div>
              <div class="kpi-card k-purple">
                <div class="kpi-top">
                  <div class="kpi-shape">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <span class="kpi-trend neutral">All active</span>
                </div>
                <div class="kpi-value">{{ stats()?.totalSpaces ?? 0 }}</div>
                <div class="kpi-label">Active Spaces</div>
                <div class="kpi-bar"><div class="kpi-bar-fill" [style.width]="spaceBarWidth()"></div></div>
              </div>
              <div class="kpi-card k-emerald">
                <div class="kpi-top">
                  <div class="kpi-shape">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <span class="kpi-trend up">Total earned</span>
                </div>
                <div class="kpi-value rev">{{ stats()?.totalRevenue | appCurrency }}</div>
                <div class="kpi-label">Total Revenue</div>
                <div class="kpi-bar"><div class="kpi-bar-fill" style="width:65%"></div></div>
              </div>
            </div>

            <!-- Middle Row -->
            <div class="mid-row">

              <!-- Booking Status Breakdown -->
              <div class="breakdown-card">
                <div class="bc-header">
                  <h3>Booking Status Breakdown</h3>
                  <span class="bc-total">{{ stats()?.totalBookings ?? 0 }} total</span>
                </div>
                <div class="bc-items">
                  <div class="bc-item">
                    <div class="bc-dot pending"></div>
                    <span class="bc-name">Pending</span>
                    <div class="bc-track"><div class="bc-fill pending" style="width:30%"></div></div>
                    <span class="bc-pct">30%</span>
                  </div>
                  <div class="bc-item">
                    <div class="bc-dot confirmed"></div>
                    <span class="bc-name">Confirmed</span>
                    <div class="bc-track"><div class="bc-fill confirmed" style="width:45%"></div></div>
                    <span class="bc-pct">45%</span>
                  </div>
                  <div class="bc-item">
                    <div class="bc-dot completed"></div>
                    <span class="bc-name">Completed</span>
                    <div class="bc-track"><div class="bc-fill completed" style="width:20%"></div></div>
                    <span class="bc-pct">20%</span>
                  </div>
                  <div class="bc-item">
                    <div class="bc-dot cancelled"></div>
                    <span class="bc-name">Cancelled</span>
                    <div class="bc-track"><div class="bc-fill cancelled" style="width:5%"></div></div>
                    <span class="bc-pct">5%</span>
                  </div>
                </div>
                <!-- Donut visual -->
                <div class="donut-wrap">
                  <svg viewBox="0 0 80 80" class="donut-svg">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#f1f5f9" stroke-width="12"/>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#14b8a6" stroke-width="12" stroke-dasharray="84.8 188" stroke-dashoffset="0" stroke-linecap="round"/>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#6366f1" stroke-width="12" stroke-dasharray="56.5 188" stroke-dashoffset="-84.8" stroke-linecap="round"/>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" stroke-width="12" stroke-dasharray="37.7 188" stroke-dashoffset="-141.3" stroke-linecap="round"/>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" stroke-width="12" stroke-dasharray="9.4 188" stroke-dashoffset="-179" stroke-linecap="round"/>
                  </svg>
                  <div class="donut-center">
                    <strong>{{ stats()?.totalBookings ?? 0 }}</strong>
                    <span>bookings</span>
                  </div>
                </div>
              </div>

              <!-- Quick Actions + Platform Health -->
              <div class="right-col">

                <!-- Quick Actions -->
                <div class="quick-actions">
                  <div class="qa-header">Quick Actions</div>
                  <div class="qa-grid">
                    <button class="qa-btn" (click)="activeTab.set('bookings'); loadBookings()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      <span>View Bookings</span>
                    </button>
                    <button class="qa-btn" [routerLink]="['/admin/spaces/new']">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      <span>Add Space</span>
                    </button>
                    <button class="qa-btn" routerLink="/admin/centers/new">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <span>New Center</span>
                    </button>
                    <button class="qa-btn" (click)="activeTab.set('spaces'); loadSpaces()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      <span>Manage Spaces</span>
                    </button>
                  </div>
                </div>

                <!-- Platform Health -->
                <div class="health-card">
                  <div class="hc-header">Platform Health</div>
                  <div class="hc-items">
                    <div class="hc-item">
                      <span class="hc-label">API Server</span>
                      <span class="hc-badge ok">Operational</span>
                    </div>
                    <div class="hc-item">
                      <span class="hc-label">Database</span>
                      <span class="hc-badge ok">Healthy</span>
                    </div>
                    <div class="hc-item">
                      <span class="hc-label">Image Storage</span>
                      <span class="hc-badge ok">Connected</span>
                    </div>
                    <div class="hc-item">
                      <span class="hc-label">Centers Online</span>
                      <span class="hc-badge info">{{ centers().length }} active</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Bottom: Space Type Distribution -->
            <div class="dist-card">
              <div class="dist-header">
                <h3>Space Type Distribution</h3>
                <span class="dist-sub">{{ stats()?.totalSpaces ?? 0 }} spaces across {{ centers().length }} centers</span>
              </div>
              <div class="dist-bars">
                <div class="dist-item" *ngFor="let t of spaceTypes">
                  <div class="dist-meta">
                    <span class="dist-name">{{ t.label }}</span>
                    <span class="dist-count">{{ t.count }}</span>
                  </div>
                  <div class="dist-track">
                    <div class="dist-fill" [style.width]="t.pct" [style.background]="t.color"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- CALENDAR TAB -->
        <div *ngIf="activeTab() === 'calendar'">
          <app-admin-calendar></app-admin-calendar>
        </div>

        <!-- BOOKINGS TAB -->
        <div *ngIf="activeTab() === 'bookings'">
          <div class="section-toolbar">
            <h2>All Bookings <span class="count-badge">{{ filteredBookings().length }}</span></h2>
            <div class="toolbar-right">
              <input [value]="bookingSearch()" (input)="bookingSearch.set($any($event.target).value)" placeholder="Search by name, email, space..." class="search-input" />
              <select [value]="bookingStatusFilter()" (change)="bookingStatusFilter.set($any($event.target).value)" class="filter-select">
                <option value="">All Statuses</option>
                <option value="PENDING">🕐 Pending</option>
                <option value="CONFIRMED">✅ Confirmed</option>
                <option value="CANCELLED">✕ Cancelled</option>
                <option value="COMPLETED">🏁 Completed</option>
              </select>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Space / Center</th>
                  <th>Period</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of filteredBookings()">
                  <td class="ref">#{{ b.id }}</td>
                  <td>
                    <div class="client-cell">
                      <div class="avatar">{{ b.userName ? b.userName.charAt(0) : '?' }}</div>
                      <div>
                        <strong>{{ b.userName }}</strong>
                        <span>{{ b.userEmail }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="contact-cell">
                      <a [href]="'mailto:' + b.userEmail" class="contact-btn email" title="Send email">
                        ✉️ Email
                      </a>
                      <a *ngIf="b.userPhone" [href]="'tel:' + b.userPhone" class="contact-btn phone" title="Call client">
                        📞 Call
                      </a>
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
                      <button *ngIf="b.status === 'CONFIRMED'" (click)="updateStatus(b.id, 'COMPLETED')" class="act-btn complete">✔ Done</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredBookings().length === 0">
                  <td colspan="8" class="empty-row">No bookings found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SPACES TAB -->
        <div *ngIf="activeTab() === 'spaces'">
          <div class="section-toolbar">
            <h2>All Spaces <span class="count-badge">{{ spaces().length }}</span></h2>
            <button [routerLink]="['/admin/spaces/new']" class="btn-primary">+ New Space</button>
          </div>

          <div class="center-filter">
            <button class="center-pill" [class.active]="selectedCenterId() === null" (click)="selectedCenterId.set(null)">All Centers</button>
            <button class="center-pill" *ngFor="let c of centers()" [class.active]="selectedCenterId() === c.centerId" (click)="selectedCenterId.set(c.centerId)">{{ c.name }}</button>
          </div>

          <div class="spaces-grid">
            <div class="space-card" *ngFor="let s of filteredSpaces()">
              <div class="space-img">
                <img [src]="s.photos && s.photos[0] ? s.photos[0] : 'assets/images/spaces/space1.jpg'" [alt]="s.name" />
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
            <button routerLink="/admin/centers/new" class="btn-primary">+ New Center</button>
          </div>
          <div class="centers-grid-admin">
            <div class="center-card-admin" *ngFor="let c of centers()">
              <div class="cca-img">
                <img [src]="c.photos && c.photos[0] ? c.photos[0] : 'assets/images/centers/center-hero-casablanca.jpg'" [alt]="c.name" class="cca-img-el" />
                <span class="cca-city">📍 {{ c.city }}</span>
              </div>
              <div class="cca-body">
                <div class="cca-top">
                  <h3>{{ c.name }}</h3>
                  <span class="cca-rating" *ngIf="c.averageRating">⭐ {{ c.averageRating | number:'1.1-1' }}</span>
                </div>
                <p>{{ c.address }}</p>
                <div class="cca-meta">
                  <span *ngIf="c.openingHours">🕐 {{ c.openingHours }}</span>
                  <span *ngIf="c.phone">📞 {{ c.phone }}</span>
                </div>
                <div class="cca-actions">
                  <button [routerLink]="['/centers', c.centerId]" class="btn-view-spaces">View Spaces →</button>
                  <button [routerLink]="['/admin/spaces/new']" [queryParams]="{centerId: c.centerId}" class="btn-add-space">+ Space</button>
                </div>
              </div>
            </div>
            <div *ngIf="centers().length === 0" class="empty-centers">
              <p>No centers yet.</p>
              <button routerLink="/admin/centers/new" class="btn-primary">+ Add First Center</button>
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
      svg { flex-shrink: 0; stroke: currentColor; }
      &:hover { background: #f8fafc; color: #14b8a6; }
      &.active { background: #0f172a; color: white; }
    }

    /* STATS SKELETON */
    .sk-wrap { display: flex; flex-direction: column; gap: 20px; padding-bottom: 40px; }
    .sk-hero { background: #e2e8f0; border-radius: 20px; height: 120px; animation: pulse 1.5s ease-in-out infinite; }
    .sk-row { display: flex; gap: 20px; }
    .sk-card { flex: 1; background: #e2e8f0; border-radius: 16px; height: 130px; animation: pulse 1.5s ease-in-out infinite; }
    .sk-wide { flex: 1; background: #e2e8f0; border-radius: 16px; height: 260px; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .stats-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 16px 20px; border-radius: 12px; margin-bottom: 28px; font-weight: 600; font-size: 0.9rem; }

    /* WELCOME BANNER */
    .welcome-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      border-radius: 20px; padding: 32px 36px; margin-bottom: 24px;
      display: flex; justify-content: space-between; align-items: center; gap: 24px;
      position: relative; overflow: hidden;
      &::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%); }
      &::after { content: ''; position: absolute; bottom: -60px; left: 30%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%); }
    }
    .wb-left { position: relative; z-index: 1; }
    .wb-greeting { font-size: 0.85rem; color: #5eead4; font-weight: 600; margin-bottom: 8px; }
    .wb-left h2 { font-size: 1.5rem; font-weight: 900; color: white; margin: 0 0 8px; span { color: #14b8a6; } }
    .wb-left p { font-size: 0.82rem; color: #64748b; margin: 0; }
    .wb-right { text-align: right; position: relative; z-index: 1; flex-shrink: 0; }
    .wb-date { font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px; }
    .wb-pulse { display: inline-flex; align-items: center; gap: 6px; background: rgba(20,184,166,0.15); border: 1px solid rgba(20,184,166,0.3); color: #5eead4; font-size: 0.78rem; font-weight: 700; padding: 5px 12px; border-radius: 100px; }
    .pulse-dot { width: 7px; height: 7px; background: #14b8a6; border-radius: 50%; animation: blink 1.4s ease-in-out infinite; }
    @keyframes blink { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:0.4; transform: scale(0.7); } }

    /* KPI CARDS */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card {
      background: white; border-radius: 20px; padding: 24px;
      border: 1px solid #e2e8f0; position: relative; overflow: hidden;
      transition: transform 0.25s, box-shadow 0.25s;
      &:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
    }
    .k-teal    { border-top: 3px solid #14b8a6; }
    .k-indigo  { border-top: 3px solid #6366f1; }
    .k-purple  { border-top: 3px solid #8b5cf6; }
    .k-emerald { border-top: 3px solid #10b981; }
    .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .kpi-shape {
      width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      .k-teal & { background: #f0fdfa; color: #0d9488; }
      .k-indigo & { background: #eef2ff; color: #6366f1; }
      .k-purple & { background: #faf5ff; color: #8b5cf6; }
      .k-emerald & { background: #f0fdf4; color: #10b981; }
    }
    .kpi-trend { font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 100px; white-space: nowrap;
      .k-teal & { background: #f0fdfa; color: #0d9488; }
      .k-indigo & { background: #eef2ff; color: #6366f1; }
      .k-purple & { background: #f8fafc; color: #64748b; }
      .k-emerald & { background: #f0fdf4; color: #10b981; }
    }
    .kpi-value { font-size: 2.6rem; font-weight: 900; color: #1e293b; line-height: 1; margin-bottom: 4px; &.rev { font-size: 1.7rem; } }
    .kpi-label { font-size: 0.78rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px; }
    .kpi-bar { height: 4px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
    .kpi-bar-fill { height: 100%; border-radius: 100px; transition: width 1s ease;
      .k-teal & { background: #14b8a6; }
      .k-indigo & { background: #6366f1; }
      .k-purple & { background: #8b5cf6; }
      .k-emerald & { background: #10b981; }
    }

    /* MIDDLE ROW */
    .mid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }

    /* BREAKDOWN CARD */
    .breakdown-card {
      background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 28px;
      display: flex; flex-direction: column; gap: 20px;
    }
    .bc-header { display: flex; justify-content: space-between; align-items: center;
      h3 { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0; }
    }
    .bc-total { background: #f0fdfa; color: #0d9488; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
    .bc-items { display: flex; flex-direction: column; gap: 14px; }
    .bc-item { display: flex; align-items: center; gap: 10px; }
    .bc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      &.pending { background: #f59e0b; } &.confirmed { background: #14b8a6; }
      &.completed { background: #6366f1; } &.cancelled { background: #ef4444; }
    }
    .bc-name { font-size: 0.82rem; font-weight: 600; color: #475569; width: 80px; flex-shrink: 0; }
    .bc-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
    .bc-fill { height: 100%; border-radius: 100px; transition: width 1s ease;
      &.pending { background: #f59e0b; } &.confirmed { background: #14b8a6; }
      &.completed { background: #6366f1; } &.cancelled { background: #ef4444; }
    }
    .bc-pct { font-size: 0.75rem; font-weight: 700; color: #94a3b8; width: 32px; text-align: right; flex-shrink: 0; }
    .donut-wrap { display: flex; justify-content: center; align-items: center; position: relative; margin-top: 4px; }
    .donut-svg { width: 100px; height: 100px; transform: rotate(-90deg); }
    .donut-center { position: absolute; text-align: center;
      strong { display: block; font-size: 1.3rem; font-weight: 900; color: #1e293b; }
      span { font-size: 0.65rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
    }

    /* RIGHT COL */
    .right-col { display: flex; flex-direction: column; gap: 16px; }

    /* QUICK ACTIONS */
    .quick-actions { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 24px; }
    .qa-header { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }
    .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .qa-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border-radius: 12px; border: 1.5px solid #e2e8f0;
      background: #f8fafc; cursor: pointer; transition: all 0.2s; font-size: 0.82rem; font-weight: 600; color: #475569;
      text-decoration: none;
      svg { flex-shrink: 0; }
      &:hover { border-color: #14b8a6; background: #f0fdfa; color: #0d9488; }
    }

    /* HEALTH CARD */
    .health-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 24px; }
    .hc-header { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }
    .hc-items { display: flex; flex-direction: column; gap: 10px; }
    .hc-item { display: flex; justify-content: space-between; align-items: center; }
    .hc-label { font-size: 0.85rem; font-weight: 600; color: #475569; }
    .hc-badge { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 100px;
      &.ok { background: #f0fdf4; color: #16a34a; }
      &.info { background: #f0fdfa; color: #0d9488; }
      &.warn { background: #fffbeb; color: #d97706; }
    }

    /* DISTRIBUTION CARD */
    .dist-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 28px; margin-bottom: 40px; }
    .dist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h3 { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0; }
    }
    .dist-sub { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }
    .dist-bars { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .dist-item { display: flex; flex-direction: column; gap: 8px; }
    .dist-meta { display: flex; align-items: center; gap: 8px; }
    .dist-name { font-size: 0.85rem; font-weight: 700; color: #475569; flex: 1; }
    .dist-count { font-size: 0.82rem; font-weight: 800; color: #1e293b; }
    .dist-track { height: 10px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
    .dist-fill { height: 100%; border-radius: 100px; transition: width 1s ease; }

    @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .mid-row { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr; } .dist-bars { grid-template-columns: 1fr; } .welcome-banner { flex-direction: column; align-items: flex-start; } .wb-right { text-align: left; } }

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
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #14b8a6, #6366f1); color: white; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-transform: uppercase; }
    .contact-cell { display: flex; flex-direction: column; gap: 5px; }
    .contact-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 7px; font-size: 0.72rem; font-weight: 700; text-decoration: none; cursor: pointer; transition: all 0.2s; white-space: nowrap;
      &.email { background: #eef2ff; color: #6366f1; &:hover { background: #6366f1; color: white; } }
      &.phone { background: #f0fdf4; color: #16a34a; &:hover { background: #16a34a; color: white; } }
    }
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
    .centers-grid-admin { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .center-card-admin { background: white; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; transition: all 0.2s; &:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); } }
    .cca-img { position: relative; height: 160px; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; } }
    .center-card-admin:hover .cca-img img { transform: scale(1.05); }
    .cca-city { position: absolute; bottom: 10px; left: 10px; background: rgba(15,23,42,0.75); color: white; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 100px; }
    .cca-body { padding: 16px; }
    .cca-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .cca-top h3 { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0; }
    .cca-rating { background: #fffbeb; color: #f59e0b; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; flex-shrink: 0; }
    .cca-body p { font-size: 0.8rem; color: #94a3b8; margin: 0 0 10px; }
    .cca-meta { display: flex; flex-direction: column; gap: 3px; margin-bottom: 14px; span { font-size: 0.78rem; color: #64748b; } }
    .cca-actions { display: flex; gap: 8px; }
    .btn-view-spaces { flex: 1; padding: 8px; border-radius: 8px; background: #0f172a; border: none; color: white; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; &:hover { background: #14b8a6; } }
    .btn-add-space { padding: 8px 14px; border-radius: 8px; background: #f0fdfa; border: 1px solid #ccfbf1; color: #0d9488; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; white-space: nowrap; &:hover { background: #14b8a6; color: white; border-color: #14b8a6; } }
    .empty-centers { grid-column: 1/-1; text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #e2e8f0; p { color: #94a3b8; margin-bottom: 16px; } }

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

  today = new Date();
  activeTab = signal<'stats' | 'bookings' | 'spaces' | 'centers' | 'calendar'>('stats');
  bookings = signal<BookingResponse[]>([]);
  spaces = signal<Space[]>([]);
  centers = signal<Center[]>([]);
  stats = signal<any>(null);
  statsError = signal(false);
  statsLoading = signal(true);
  bookingSearch = signal('');
  bookingStatusFilter = signal('');
  selectedCenterId = signal<number | null>(null);

  bookingBarWidth = computed(() => Math.min((this.stats()?.totalBookings ?? 0) / 20 * 100, 100) + '%');
  userBarWidth    = computed(() => Math.min((this.stats()?.totalUsers    ?? 0) / 50 * 100, 100) + '%');
  spaceBarWidth   = computed(() => Math.min((this.stats()?.totalSpaces   ?? 0) / 20 * 100, 100) + '%');

  spaceTypes = [
    { emoji: '🏢', label: 'Private Office',  color: '#6366f1', count: 0, pct: '0%' },
    { emoji: '🎯', label: 'Conference Room', color: '#f59e0b', count: 0, pct: '0%' },
    { emoji: '🌐', label: 'Open Space',      color: '#14b8a6', count: 0, pct: '0%' },
    { emoji: '🎓', label: 'Training Room',   color: '#8b5cf6', count: 0, pct: '0%' },
  ];

  filteredBookings = computed(() =>
    this.bookings().filter(b => {
      const q = this.bookingSearch().toLowerCase();
      const matchSearch = !q ||
        b.userName?.toLowerCase().includes(q) ||
        b.spaceName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q);
      const matchStatus = !this.bookingStatusFilter() || b.status === this.bookingStatusFilter();
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
    this.statsLoading.set(true);
    this.statsError.set(false);
    this.http.get<any>(`${environment.apiUrl}/stats/dashboard`).subscribe({
      next: (data) => {
        const cards = data?.summaryCards || data;
        this.stats.set({
          totalBookings: cards?.totalBookings ?? 0,
          totalUsers: cards?.totalUsers ?? 0,
          totalSpaces: cards?.activeSpaces ?? cards?.totalSpaces ?? 0,
          totalRevenue: cards?.totalRevenue ?? 0
        });
        this.statsLoading.set(false);
        this.loadSpaceDistribution();
      },
      error: () => {
        this.statsError.set(true);
        this.statsLoading.set(false);
      }
    });
  }

  loadSpaceDistribution() {
    this.catalogueService.getCenters().subscribe(centers => {
      if (!centers.length) return;
      const counts: Record<string, number> = { PRIVATE_OFFICE: 0, CONFERENCE_ROOM: 0, OPEN_SPACE: 0, TRAINING_ROOM: 0 };
      let loaded = 0;
      centers.forEach(c => {
        this.catalogueService.getSpacesByCenter(c.centerId).subscribe(spaces => {
          spaces.forEach(s => { if (counts[s.type] !== undefined) counts[s.type]++; });
          loaded++;
          if (loaded === centers.length) {
            const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
            const keys = ['PRIVATE_OFFICE', 'CONFERENCE_ROOM', 'OPEN_SPACE', 'TRAINING_ROOM'];
            keys.forEach((k, i) => {
              this.spaceTypes[i].count = counts[k];
              this.spaceTypes[i].pct = Math.round(counts[k] / total * 100) + '%';
            });
          }
        });
      });
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
