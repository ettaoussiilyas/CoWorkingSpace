import { Component, OnInit, inject, signal } from '@angular/core';
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
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div class="max-w-5xl mx-auto">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h1 class="text-4xl font-black text-gray-900 font-tight" [innerHTML]="'BOOKINGS.TITLE' | translate"></h1>
            <p class="mt-4 text-gray-600">{{ 'BOOKINGS.SUBTITLE' | translate }}</p>
          </div>
          <button routerLink="/centers" 
            class="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-100">
            {{ 'BOOKINGS.NEW_BOOKING' | translate }}
          </button>
        </div>

        <div class="space-y-6">
          <div *ngFor="let booking of bookings()" 
               class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center group">
            <div class="mb-4 md:mb-0">
              <div class="flex items-center gap-3 mb-2">
                <span [ngClass]="getStatusClass(booking.status)" 
                      class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border">
                  {{ 'STATUS.' + booking.status | translate }}
                </span>
                <span class="text-xs text-gray-400 font-bold uppercase tracking-widest">REF #{{ booking.id }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-1">{{ booking.spaceName }}</h3>
              <p class="text-gray-500 font-medium">{{ booking.centerName }}</p>
            </div>

            <div class="flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center">
              <div class="space-y-1">
                <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">{{ 'BOOKINGS.PERIOD' | translate }}</p>
                <p class="font-bold text-gray-700">{{ 'BOOKINGS.FROM' | translate }} {{ booking.startDateTime | date:'dd/MM HH:mm' }}</p>
                <p class="font-bold text-gray-700">{{ 'BOOKINGS.TO' | translate }} {{ booking.endDateTime | date:'dd/MM HH:mm' }}</p>
              </div>
              
              <div class="text-left md:text-right">
                <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{{ 'BOOKINGS.TOTAL' | translate }}</p>
                <p class="text-3xl font-black text-primary">{{ booking.totalPrice | appCurrency }}</p>
              </div>

              <!-- Action Button for Review -->
              <div *ngIf="(booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') && !booking.hasReview">
                <button 
                  (click)="selectedBookingId.set(booking.id)" 
                  class="px-6 py-2 bg-teal-50 text-teal-600 font-bold rounded-lg hover:bg-teal-100 transition-all text-sm border border-teal-100">
                  Leave a Review
                </button>
              </div>
            </div>

            <!-- Review Form -->
            <div *ngIf="selectedBookingId() === booking.id" class="w-full mt-6">
              <app-submit-review 
                [bookingId]="booking.id" 
                (submitted)="onReviewSubmitted()" 
                (cancel)="selectedBookingId.set(null)">
              </app-submit-review>
            </div>
          </div>

          <div *ngIf="bookings().length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div class="mb-6 opacity-20">
              <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p class="text-gray-500 font-bold text-xl mb-4">{{ 'BOOKINGS.EMPTY' | translate }}</p>
            <button routerLink="/centers" class="text-primary font-bold hover:underline">{{ 'BOOKINGS.BROWSE' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    span { color: #14b8a6; }
    .status-pending { background: #fffbeb; color: #f59e0b; border-color: #fef3c7; }
    .status-confirmed { background: #f0fdf4; color: #10b981; border-color: #dcfce7; }
    .status-cancelled { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }
    .status-completed { background: #f8fafc; color: #64748b; border-color: #f1f5f9; }
  `]
})
export class UserBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private seo = inject(SeoService);
  bookings = signal<BookingResponse[]>([]);
  selectedBookingId = signal<number | null>(null);

  ngOnInit(): void {
    this.seo.setMeta('My Bookings', 'Manage your co-working space reservations and share your feedback.');
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getMyBookings().subscribe(data => this.bookings.set(data));
  }

  onReviewSubmitted(): void {
    this.selectedBookingId.set(null);
    this.loadBookings(); // Refresh to hide button
  }

  getStatusClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING: return 'status-pending';
      case BookingStatus.CONFIRMED: return 'status-confirmed';
      case BookingStatus.CANCELLED: return 'status-cancelled'
      case BookingStatus.COMPLETED: return 'status-completed'
      default: return '';
    }
  }
}
