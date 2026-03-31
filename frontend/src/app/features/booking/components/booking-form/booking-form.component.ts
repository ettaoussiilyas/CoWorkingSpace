import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppCurrencyPipe } from '../../../../core/pipes/app-currency.pipe';
import { BookingService } from '../../../../core/services/booking.service';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { Space } from '../../../../core/models/catalogue.models';
import { AvailabilityPickerComponent } from '../availability-picker/availability-picker.component';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule, AppCurrencyPipe, AvailabilityPickerComponent],
  template: `
    <div class="page">
      <div class="container">

        <a routerLink="/centers" class="back-link">← Back to Centers</a>

        <div class="booking-layout" *ngIf="space(); else loadingTpl">

          <!-- LEFT: Space Info Panel -->
          <div class="info-panel">
            <div class="space-photo">
              <img [src]="space()?.photos?.[0] || 'assets/images/spaces/space1.jpg'" [alt]="space()?.name" />
              <div class="photo-overlay"></div>
              <div class="photo-badge">{{ space()?.type?.replace('_', ' ') }}</div>
            </div>

            <div class="info-body">
              <h2>{{ space()?.name }}</h2>
              <p class="info-desc">{{ space()?.description }}</p>

              <div class="info-stats">
                <div class="stat">
                  <span class="stat-icon">👥</span>
                  <div>
                    <span class="stat-val">{{ space()?.capacity }}</span>
                    <span class="stat-label">Capacity</span>
                  </div>
                </div>
                <div class="stat">
                  <span class="stat-icon">⭐</span>
                  <div>
                    <span class="stat-val">{{ space()?.averageRating || 'New' }}</span>
                    <span class="stat-label">Rating</span>
                  </div>
                </div>
                <div class="stat">
                  <span class="stat-icon">💰</span>
                  <div>
                    <span class="stat-val">{{ space()?.pricePerHour | appCurrency }}</span>
                    <span class="stat-label">Per Hour</span>
                  </div>
                </div>
              </div>

              <div class="amenities" *ngIf="space()?.amenities?.length">
                <span class="amenity" *ngFor="let a of space()?.amenities">{{ a }}</span>
              </div>

              <!-- Price Summary -->
              <div class="price-summary" *ngIf="totalPrice() > 0">
                <div class="price-row">
                  <span>Duration</span>
                  <span>{{ durationHours() }}h</span>
                </div>
                <div class="price-row">
                  <span>Rate</span>
                  <span>{{ space()?.pricePerHour | appCurrency }}/h</span>
                </div>
                <div class="price-row total">
                  <span>Total</span>
                  <span>{{ totalPrice() | appCurrency }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Booking Form -->
          <div class="form-panel">
            <div class="form-header">
              <h3>Reserve This Space</h3>
              <p>Pick a date and select your time slots below</p>
            </div>

            <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">

              <!-- Date Picker -->
              <div class="field">
                <label>📅 Select Date</label>
                <input type="date" formControlName="startDate" class="date-input" [min]="today" />
              </div>

              <!-- Time Picker -->
              <div class="time-section" *ngIf="bookingForm.get('startDate')?.value">
                <label class="time-label">🕐 Select Time Slots</label>
                <p class="time-hint">Click a slot to start, click another to set end time. Red = already booked.</p>
                <app-availability-picker
                  [spaceId]="space()!.id"
                  [date]="bookingForm.get('startDate')!.value!"
                  (selectionChange)="onTimeSelection($event)">
                </app-availability-picker>
              </div>

              <!-- No date selected hint -->
              <div class="date-hint" *ngIf="!bookingForm.get('startDate')?.value">
                <div class="hint-icon">📅</div>
                <p>Select a date above to see available time slots</p>
              </div>

              <!-- Submit -->
              <div class="submit-section">
                <div class="submit-summary" *ngIf="totalPrice() > 0">
                  <span class="summary-label">You'll pay</span>
                  <span class="summary-price">{{ totalPrice() | appCurrency }}</span>
                </div>
                <button type="submit" [disabled]="bookingForm.invalid || isLoading" class="btn-submit">
                  <span *ngIf="!isLoading">🚀 Confirm Booking</span>
                  <span *ngIf="isLoading" class="spinner-wrap"><span class="spinner"></span> Processing...</span>
                </button>
              </div>

              <div *ngIf="errorMessage" class="error-msg">
                ⚠️ {{ errorMessage }}
              </div>

            </form>
          </div>
        </div>

        <ng-template #loadingTpl>
          <div class="loading-state">
            <div class="spinner-lg"></div>
            <p>Loading space details...</p>
          </div>
        </ng-template>

      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { min-height: 100vh; background: #f1f5f9; padding: 40px 0 80px; font-family: 'Inter', sans-serif; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .back-link { color: #64748b; font-size: 0.85rem; font-weight: 600; text-decoration: none; display: inline-block; margin-bottom: 28px; transition: color 0.2s; &:hover { color: #14b8a6; } }

    /* LAYOUT */
    .booking-layout { display: grid; grid-template-columns: 380px 1fr; gap: 28px; align-items: start; }

    /* INFO PANEL */
    .info-panel { background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; position: sticky; top: 24px; }
    .space-photo { position: relative; height: 220px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
      .photo-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.6), transparent); }
      .photo-badge { position: absolute; bottom: 14px; left: 14px; background: rgba(20,184,166,0.9); color: white; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.06em; }
    }
    .info-body { padding: 24px; }
    .info-body h2 { font-size: 1.3rem; font-weight: 900; color: #1e293b; margin: 0 0 8px; }
    .info-desc { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin: 0 0 20px; }

    .info-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat { background: #f8fafc; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 8px; }
    .stat-icon { font-size: 1.2rem; }
    .stat-val { display: block; font-size: 0.9rem; font-weight: 800; color: #1e293b; }
    .stat-label { display: block; font-size: 0.65rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

    .amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
    .amenity { background: #f0fdfa; color: #0d9488; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; border: 1px solid #ccfbf1; }

    .price-summary { background: #f8fafc; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; }
    .price-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; padding: 4px 0; }
    .price-row.total { border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 12px; font-size: 1rem; font-weight: 900; color: #1e293b; }

    /* FORM PANEL */
    .form-panel { background: white; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; }
    .form-header { background: linear-gradient(135deg, #0f172a, #1e293b); padding: 28px 32px; }
    .form-header h3 { font-size: 1.3rem; font-weight: 900; color: white; margin: 0 0 6px; }
    .form-header p { color: #64748b; font-size: 0.85rem; margin: 0; }

    form { padding: 28px 32px; }
    .field { margin-bottom: 24px; }
    label { display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 8px; }
    .date-input { width: 100%; padding: 13px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; font-family: inherit; outline: none; transition: border-color 0.2s; color: #1e293b; &:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); } }

    .time-section { margin-bottom: 24px; }
    .time-label { display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 6px; }
    .time-hint { font-size: 0.78rem; color: #94a3b8; margin: 0 0 14px; }

    .date-hint { text-align: center; padding: 40px 24px; background: #f8fafc; border-radius: 16px; border: 2px dashed #e2e8f0; margin-bottom: 24px; }
    .hint-icon { font-size: 2rem; margin-bottom: 10px; }
    .date-hint p { color: #94a3b8; font-size: 0.88rem; margin: 0; }

    .submit-section { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 8px; }
    .submit-summary { }
    .summary-label { display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
    .summary-price { font-size: 1.8rem; font-weight: 900; color: #1e293b; }
    .btn-submit { background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; border: none; padding: 15px 32px; border-radius: 14px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px rgba(20,184,166,0.3); white-space: nowrap; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(20,184,166,0.4); } &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; } }
    .spinner-wrap { display: flex; align-items: center; gap: 8px; }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 12px 16px; border-radius: 10px; font-size: 0.85rem; margin-top: 16px; font-weight: 600; }

    /* LOADING */
    .loading-state { text-align: center; padding: 80px; }
    .spinner-lg { width: 48px; height: 48px; border: 3px solid #e2e8f0; border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
    .loading-state p { color: #94a3b8; font-size: 0.9rem; }

    @media (max-width: 900px) {
      .booking-layout { grid-template-columns: 1fr; }
      .info-panel { position: static; }
      form { padding: 24px; }
      .submit-section { flex-direction: column; align-items: stretch; }
      .btn-submit { width: 100%; }
    }
  `]
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private catalogueService = inject(CatalogueService);

  space = signal<Space | null>(null);
  isLoading = false;
  errorMessage = '';
  today = new Date().toISOString().split('T')[0];

  bookingForm = this.fb.group({
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  });

  durationHours = computed(() => {
    const start = Number(this.bookingForm.get('startTime')?.value);
    const end = Number(this.bookingForm.get('endTime')?.value);
    if (!start || !end || end <= start) return 0;
    return end - start;
  });

  totalPrice = computed(() => {
    const space = this.space();
    if (!space) return 0;
    return this.durationHours() * space.pricePerHour;
  });

  ngOnInit(): void {
    const spaceId = Number(this.route.snapshot.paramMap.get('spaceId'));
    if (spaceId) {
      this.catalogueService.getSpaceById(spaceId).subscribe(s => this.space.set(s));
    }
  }

  onTimeSelection(selection: { start: number; end: number } | null) {
    this.bookingForm.patchValue(
      selection
        ? { startTime: selection.start.toString(), endTime: selection.end.toString() }
        : { startTime: '', endTime: '' }
    );
  }

  onSubmit() {
    if (this.bookingForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const start = this.getDateTime('startDate', 'startTime')?.toISOString();
    const end = this.getDateTime('startDate', 'endTime')?.toISOString();
    if (start && end) {
      this.bookingService.createBooking({ spaceId: this.space()!.id, startDateTime: start, endDateTime: end }).subscribe({
        next: () => this.router.navigate(['/my-bookings']),
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'This time slot is already booked. Please choose another.';
        }
      });
    }
  }

  private getDateTime(dateField: string, hourField: string): Date | null {
    const date = this.bookingForm.get(dateField)?.value;
    const hour = this.bookingForm.get(hourField)?.value;
    if (!date || !hour) return null;
    return new Date(`${date}T${hour.padStart(2, '0')}:00:00`);
  }
}
