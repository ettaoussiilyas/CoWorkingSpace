import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCurrencyPipe } from '../../../../core/pipes/app-currency.pipe';
import { BookingService } from '../../../../core/services/booking.service';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { BookingResponse } from '../../../../core/models/booking.models';

interface CalendarDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: BookingResponse[];
}

interface CenterGroup {
  centerName: string;
  color: string;
  count: number;
  bookings: BookingResponse[];
}

const CENTER_COLORS = [
  '#14b8a6', '#6366f1', '#f59e0b', '#ef4444',
  '#8b5cf6', '#10b981', '#f97316', '#06b6d4'
];

@Component({
  selector: 'app-admin-calendar',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe],
  template: `
    <div class="cal-wrap">

      <!-- Header -->
      <div class="cal-header">
        <div class="cal-nav">
          <button class="nav-btn" (click)="prevMonth()">&#8249;</button>
          <div class="cal-title">
            <h2>{{ monthName() }} {{ currentYear() }}</h2>
            <span class="cal-sub">{{ monthBookings().length }} bookings this month</span>
          </div>
          <button class="nav-btn" (click)="nextMonth()">&#8250;</button>
        </div>

        <div class="cal-actions">
          <div class="legend">
            <div class="legend-item" *ngFor="let c of centers(); let i = index">
              <span class="legend-dot" [style.background]="getColor(i)"></span>
              <span class="legend-name">{{ c.name }}</span>
            </div>
          </div>
          <button class="btn-export" (click)="exportCsv()" [disabled]="exporting()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ exporting() ? 'Exporting...' : 'Export ' + monthName() + ' CSV' }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="cal-loading">
        <div class="cal-spinner"></div>
        <span>Loading bookings...</span>
      </div>

      <!-- Calendar Grid -->
      <div *ngIf="!loading()" class="cal-grid-wrap">
        <div class="day-headers">
          <div class="day-hdr" *ngFor="let d of dayNames">{{ d }}</div>
        </div>
        <div class="days-grid">
          <div *ngFor="let day of calendarDays()"
            class="day-cell"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.has-bookings]="day.bookings.length > 0"
            (click)="day.bookings.length > 0 ? selectDay(day) : null">

            <div class="day-num-wrap">
              <span class="day-num" [class.today-num]="day.isToday">{{ day.dayNum }}</span>
              <span *ngIf="day.bookings.length > 0" class="day-total">{{ day.bookings.length }}</span>
            </div>

            <div class="day-bookings" *ngIf="day.bookings.length > 0">
              <div *ngFor="let group of getGrouped(day.bookings) | slice:0:3"
                class="booking-chip"
                [style.background]="group.color + '18'"
                [style.border-color]="group.color + '44'"
                [style.color]="group.color">
                <span class="chip-dot" [style.background]="group.color"></span>
                <span class="chip-text">{{ group.centerName }}</span>
                <span class="chip-count">{{ group.count }}</span>
              </div>
              <div *ngIf="getGrouped(day.bookings).length > 3" class="more-chip">
                +{{ getGrouped(day.bookings).length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Day Detail Modal -->
      <div class="modal-backdrop" *ngIf="selectedDay()" (click)="selectedDay.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>{{ selectedDay()!.date | date:'EEEE, MMMM d, y' }}</h3>
              <span class="modal-sub">{{ selectedDay()!.bookings.length }} booking(s)</span>
            </div>
            <button class="modal-close" (click)="selectedDay.set(null)">&#10005;</button>
          </div>

          <div class="modal-body">
            <div *ngFor="let group of getGrouped(selectedDay()!.bookings)" class="center-group">
              <div class="cg-header" [style.border-left-color]="group.color">
                <span class="cg-dot" [style.background]="group.color"></span>
                <strong>{{ group.centerName }}</strong>
                <span class="cg-count">{{ group.count }} booking(s)</span>
              </div>
              <div class="booking-row" *ngFor="let b of group.bookings">
                <div class="br-time">
                  <span class="br-start">{{ b.startDateTime | date:'HH:mm' }}</span>
                  <span class="br-arrow">&#8594;</span>
                  <span class="br-end">{{ b.endDateTime | date:'HH:mm' }}</span>
                </div>
                <div class="br-info">
                  <span class="br-space">{{ b.spaceName }}</span>
                  <span class="br-user">{{ b.userName }} &middot; {{ b.userEmail }}</span>
                </div>
                <div class="br-right">
                  <span class="br-price">{{ b.totalPrice | appCurrency }}</span>
                  <span class="br-status" [ngClass]="'st-' + b.status.toLowerCase()">{{ b.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <span class="modal-total">
              Revenue: <strong>{{ getDayRevenue(selectedDay()!.bookings) | appCurrency }}</strong>
            </span>
            <button class="modal-close-btn" (click)="selectedDay.set(null)">Close</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .cal-wrap { font-family: 'Inter', sans-serif; }

    .cal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
    .cal-nav { display: flex; align-items: center; gap: 16px; }
    .nav-btn { width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; font-size: 1.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; transition: all 0.2s; line-height: 1; &:hover { border-color: #14b8a6; color: #14b8a6; } }
    .cal-title h2 { font-size: 1.3rem; font-weight: 900; color: #1e293b; margin: 0 0 2px; }
    .cal-sub { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }
    .cal-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .legend { display: flex; flex-wrap: wrap; gap: 10px; }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-name { font-size: 0.78rem; font-weight: 600; color: #64748b; }
    .btn-export { display: flex; align-items: center; gap: 8px; padding: 9px 18px; background: #0f172a; color: white; border: none; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; &:hover:not(:disabled) { background: #14b8a6; } &:disabled { opacity: 0.6; cursor: not-allowed; } }

    .cal-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: #94a3b8; font-size: 0.9rem; }
    .cal-spinner { width: 24px; height: 24px; border: 2px solid #e2e8f0; border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .cal-grid-wrap { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    .day-headers { display: grid; grid-template-columns: repeat(7, 1fr); background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .day-hdr { padding: 12px 8px; text-align: center; font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
    .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); }

    .day-cell { min-height: 110px; padding: 8px; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; position: relative; transition: background 0.15s; }
    .day-cell:nth-child(7n) { border-right: none; }
    .day-cell.other-month { background: #fafafa; }
    .day-cell.other-month .day-num { color: #cbd5e1; }
    .day-cell.has-bookings { cursor: pointer; }
    .day-cell.has-bookings:hover { background: #f8fafc; }

    .day-num-wrap { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .day-num { font-size: 0.82rem; font-weight: 700; color: #475569; }
    .today-num { background: #14b8a6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; }
    .day-total { background: #0f172a; color: white; font-size: 0.6rem; font-weight: 800; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .day-bookings { display: flex; flex-direction: column; gap: 3px; }
    .booking-chip { display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 6px; border: 1px solid; font-size: 0.65rem; font-weight: 700; overflow: hidden; }
    .chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .chip-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip-count { background: rgba(0,0,0,0.08); border-radius: 4px; padding: 0 4px; flex-shrink: 0; }
    .more-chip { font-size: 0.62rem; color: #94a3b8; font-weight: 600; padding: 2px 4px; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal { background: white; border-radius: 24px; width: 100%; max-width: 680px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 32px 64px rgba(0,0,0,0.2); animation: modalIn 0.2s ease; }
    @keyframes modalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px 20px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0; }
    .modal-header h3 { font-size: 1.1rem; font-weight: 900; color: #1e293b; margin: 0 0 4px; }
    .modal-sub { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }
    .modal-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 0.85rem; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; &:hover { background: #e2e8f0; } }
    .modal-body { overflow-y: auto; padding: 20px 28px; flex: 1; display: flex; flex-direction: column; gap: 20px; }

    .center-group { }
    .cg-header { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f8fafc; border-radius: 10px; border-left: 3px solid; margin-bottom: 10px; }
    .cg-header strong { font-size: 0.88rem; font-weight: 800; color: #1e293b; flex: 1; }
    .cg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .cg-count { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }

    .booking-row { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border-radius: 10px; border: 1px solid #f1f5f9; margin-bottom: 6px; transition: background 0.15s; &:hover { background: #f8fafc; } }
    .br-time { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .br-start, .br-end { font-size: 0.88rem; font-weight: 800; color: #1e293b; }
    .br-arrow { color: #94a3b8; font-size: 0.75rem; }
    .br-info { flex: 1; min-width: 0; }
    .br-space { display: block; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
    .br-user { display: block; font-size: 0.75rem; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .br-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .br-price { font-size: 0.88rem; font-weight: 800; color: #14b8a6; }
    .br-status { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; text-transform: uppercase; }
    .st-pending { background: #fffbeb; color: #f59e0b; }
    .st-confirmed { background: #f0fdf4; color: #10b981; }
    .st-cancelled { background: #fef2f2; color: #ef4444; }
    .st-completed { background: #f8fafc; color: #64748b; }

    .modal-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 28px; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
    .modal-total { font-size: 0.85rem; color: #64748b; }
    .modal-total strong { color: #1e293b; font-weight: 900; }
    .modal-close-btn { background: #0f172a; color: white; border: none; padding: 9px 20px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; &:hover { background: #14b8a6; } }

    @media (max-width: 768px) {
      .day-cell { min-height: 70px; padding: 4px; }
      .booking-chip { display: none; }
      .cal-header { flex-direction: column; }
    }
  `]
})
export class AdminCalendarComponent implements OnInit {
  private bookingService = inject(BookingService);
  private catalogueService = inject(CatalogueService);

  loading = signal(true);
  exporting = signal(false);
  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth() + 1);
  monthBookings = signal<BookingResponse[]>([]);
  centers = signal<{ centerId: number; name: string }[]>([]);
  selectedDay = signal<CalendarDay | null>(null);

  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  monthName = computed(() =>
    new Date(this.currentYear(), this.currentMonth() - 1, 1)
      .toLocaleString('en', { month: 'long' })
  );

  calendarDays = computed((): CalendarDay[] => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const today = new Date();
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const days: CalendarDay[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(year, month - 1, -firstDay.getDay() + i + 1);
      days.push({ date: d, dayNum: d.getDate(), isCurrentMonth: false, isToday: false, bookings: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d);
      const isToday = date.toDateString() === today.toDateString();
      const bookings = this.monthBookings().filter(b => {
        const bd = new Date(b.startDateTime);
        return bd.getFullYear() === year && bd.getMonth() + 1 === month && bd.getDate() === d;
      });
      days.push({ date, dayNum: d, isCurrentMonth: true, isToday, bookings });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, dayNum: d.getDate(), isCurrentMonth: false, isToday: false, bookings: [] });
    }
    return days;
  });

  ngOnInit() {
    this.catalogueService.getCenters().subscribe(c => this.centers.set(c));
    this.loadMonth();
  }

  loadMonth() {
    this.loading.set(true);
    this.bookingService.getBookingsByMonth(this.currentYear(), this.currentMonth()).subscribe({
      next: data => { this.monthBookings.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  prevMonth() {
    if (this.currentMonth() === 1) { this.currentMonth.set(12); this.currentYear.update(y => y - 1); }
    else this.currentMonth.update(m => m - 1);
    this.loadMonth();
  }

  nextMonth() {
    if (this.currentMonth() === 12) { this.currentMonth.set(1); this.currentYear.update(y => y + 1); }
    else this.currentMonth.update(m => m + 1);
    this.loadMonth();
  }

  selectDay(day: CalendarDay) { this.selectedDay.set(day); }

  getColor(index: number): string {
    return CENTER_COLORS[index % CENTER_COLORS.length];
  }

  getGrouped(bookings: BookingResponse[]): CenterGroup[] {
    const map = new Map<string, BookingResponse[]>();
    bookings.forEach(b => {
      const key = b.centerName || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return Array.from(map.entries()).map(([centerName, bks], i) => {
      const centerIdx = this.centers().findIndex(c => c.name === centerName);
      return {
        centerName,
        color: CENTER_COLORS[(centerIdx >= 0 ? centerIdx : i) % CENTER_COLORS.length],
        count: bks.length,
        bookings: bks.sort((a, b) =>
          new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        )
      };
    });
  }

  getDayRevenue(bookings: BookingResponse[]): number {
    return bookings
      .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);
  }

  exportCsv() {
    this.exporting.set(true);
    this.bookingService.exportMonthCsv(this.currentYear(), this.currentMonth());
    setTimeout(() => this.exporting.set(false), 2000);
  }
}
