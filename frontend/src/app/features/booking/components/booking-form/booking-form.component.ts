import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
        <button routerLink="/centers" class="back-btn">
          ← {{ 'CATALOGUE.BACK_LINK' | translate }}
        </button>

        <div *ngIf="space()" class="booking-card">
          <!-- Left: Space Info -->
          <div class="booking-left">
            <img [src]="space()?.photos?.[0] || 'assets/images/spaces/space1.jpg'" [alt]="space()?.name" class="space-img" />
            <div class="space-details">
              <h2 [innerHTML]="'BOOKING.TITLE' | translate"></h2>
              <div class="detail-row">
                <span class="detail-label">{{ 'BOOKING.SPACE' | translate }}</span>
                <span class="detail-value">{{ space()?.name }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ 'BOOKING.CAPACITY' | translate }}</span>
                <span class="detail-value">{{ space()?.capacity }} {{ 'BOOKING.PEOPLE' | translate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ 'BOOKING.RATE' | translate }}</span>
                <span class="detail-value price">{{ space()?.pricePerHour | appCurrency }} / h</span>
              </div>
              <div class="amenities" *ngIf="space()?.amenities?.length">
                <span class="amenity-tag" *ngFor="let a of space()?.amenities">{{ a }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Form -->
          <div class="booking-right">
            <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
              <div class="field">
                <label>{{ 'BOOKING.DATE' | translate }}</label>
                <input type="date" formControlName="startDate" class="input" [min]="today" />
              </div>

              <ng-container *ngIf="bookingForm.get('startDate')?.value">
                <app-availability-picker
                  [spaceId]="space()!.id"
                  [date]="bookingForm.get('startDate')!.value!"
                  (selectionChange)="onTimeSelection($event)">
                </app-availability-picker>
              </ng-container>

              <div class="total-row">
                <div>
                  <span class="total-label">{{ 'BOOKING.TOTAL_PRICE' | translate }}</span>
                  <p class="total-price">{{ totalPrice() | appCurrency }}</p>
                </div>
                <button type="submit" [disabled]="bookingForm.invalid || isLoading" class="submit-btn">
                  <span *ngIf="!isLoading">{{ 'BOOKING.CONFIRM' | translate }}</span>
                  <span *ngIf="isLoading" class="spinner"></span>
                </button>
              </div>

              <div *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</div>
            </form>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="!space()" class="loading">
          <div class="spinner-lg"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .page { min-height: 100vh; background: #f8fafc; padding: 40px 0 80px; font-family: 'Inter', sans-serif; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
    .back-btn {
      display: inline-flex; align-items: center; gap: 6px;
      color: #14b8a6; font-weight: 600; font-size: 0.9rem;
      background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 24px;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .booking-card {
      display: grid; grid-template-columns: 1fr 1.5fr;
      background: white; border-radius: 24px; overflow: hidden;
      border: 1px solid #e2e8f0; box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    .booking-left {
      background: linear-gradient(160deg, #0f172a, #1e293b);
      display: flex; flex-direction: column;
    }
    .space-img { width: 100%; height: 200px; object-fit: cover; opacity: 0.7; }
    .space-details { padding: 28px; flex: 1; }
    h2 { font-size: 1.4rem; font-weight: 900; color: white; margin: 0 0 24px; ::ng-deep span { color: #14b8a6; } }
    .detail-row { margin-bottom: 16px; }
    .detail-label { display: block; font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .detail-value { font-size: 1rem; font-weight: 600; color: rgba(255,255,255,0.9); }
    .detail-value.price { font-size: 1.4rem; font-weight: 900; color: #14b8a6; }
    .amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 20px; }
    .amenity-tag { background: rgba(20,184,166,0.15); color: #5eead4; font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 100px; border: 1px solid rgba(20,184,166,0.2); }

    .booking-right { padding: 36px; }
    .field { margin-bottom: 24px; }
    label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 8px; }
    .input {
      width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px;
      font-size: 0.9rem; outline: none; transition: border-color 0.2s;
      &:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
    }
    .total-row {
      display: flex; justify-content: space-between; align-items: center;
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 20px 24px; margin-top: 24px;
    }
    .total-label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px; }
    .total-price { font-size: 2rem; font-weight: 900; color: #1e293b; margin: 0; }
    .submit-btn {
      background: #14b8a6; color: white; border: none; padding: 14px 28px;
      border-radius: 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer;
      transition: all 0.2s; display: flex; align-items: center; justify-content: center; min-width: 160px;
      &:hover:not(:disabled) { background: #0d9488; box-shadow: 0 8px 20px rgba(20,184,166,0.3); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .error-msg { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 12px 16px; border-radius: 10px; font-size: 0.85rem; margin-top: 16px; }
    .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    .loading { display: flex; justify-content: center; padding: 80px; }
    .spinner-lg { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .booking-card { grid-template-columns: 1fr; }
      .space-img { height: 160px; }
    }
  `]
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private catalogueService = inject(CatalogueService);
  private translate = inject(TranslateService);

  space = signal<Space | null>(null);
  isLoading = false;
  errorMessage = '';
  today = new Date().toISOString().split('T')[0];

  bookingForm = this.fb.group({
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  });

  totalPrice = computed(() => {
    const space = this.space();
    if (!space) return 0;
    const startHour = Number(this.bookingForm.get('startTime')?.value);
    const endHour = Number(this.bookingForm.get('endTime')?.value);
    if (!startHour || !endHour || endHour <= startHour) return 0;
    return (endHour - startHour) * space.pricePerHour;
  });

  ngOnInit(): void {
    const spaceId = Number(this.route.snapshot.paramMap.get('spaceId'));
    if (spaceId) {
      this.catalogueService.getSpaceById(spaceId).subscribe((s: Space) => this.space.set(s));
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const start = this.getDateTime('startDate', 'startTime')?.toISOString();
      const end = this.getDateTime('startDate', 'endTime')?.toISOString();
      if (start && end) {
        this.bookingService.createBooking({ spaceId: this.space()!.id, startDateTime: start, endDateTime: end }).subscribe({
          next: () => this.router.navigate(['/my-bookings']),
          error: (err: any) => {
            this.isLoading = false;
            this.errorMessage = err?.error?.message || this.translate.instant('ERRORS.BOOKING_CONFLICT');
          }
        });
      }
    }
  }

  onTimeSelection(selection: { start: number, end: number } | null) {
    this.bookingForm.patchValue(selection
      ? { startTime: selection.start.toString(), endTime: selection.end.toString() }
      : { startTime: '', endTime: '' }
    );
  }

  private getDateTime(dateField: string, hourField: string): Date | null {
    const date = this.bookingForm.get(dateField)?.value;
    const hour = this.bookingForm.get(hourField)?.value;
    if (!date || !hour) return null;
    return new Date(`${date}T${hour.padStart(2, '0')}:00:00`);
  }
}
