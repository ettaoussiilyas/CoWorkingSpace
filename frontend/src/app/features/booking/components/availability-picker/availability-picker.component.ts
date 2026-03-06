import { Component, Input, Output, EventEmitter, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailabilityService } from '../../../../core/services/availability.service';
import { Availability } from '../../../../core/models/catalogue.models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-availability-picker',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-gray-900">{{ 'BOOKING.SELECT_TIME' | translate }}</h3>
        <div class="flex gap-4 text-xs font-bold uppercase tracking-wider">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-teal-500 rounded-full"></span>
            <span class="text-gray-500">{{ 'BOOKING.AVAILABLE' | translate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-red-400 rounded-full"></span>
            <span class="text-gray-500">{{ 'BOOKING.BUSY' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Time Grid -->
      <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
        <button 
          *ngFor="let hour of hours"
          (click)="toggleHour(hour)"
          [disabled]="isBusy(hour)"
          [class.bg-teal-500]="isSelected(hour)"
          [class.text-white]="isSelected(hour)"
          [class.bg-red-100]="isBusy(hour)"
          [class.text-red-400]="isBusy(hour)"
          [class.cursor-not-allowed]="isBusy(hour)"
          [class.hover:bg-teal-50]="!isBusy(hour) && !isSelected(hour)"
          class="py-3 px-2 rounded-xl border border-gray-100 font-bold transition-all text-sm relative group"
        >
          {{ hour }}:00
          <span *ngIf="isBusy(hour)" class="absolute -top-1 -right-1 flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </button>
      </div>

      <div class="mt-8 p-4 bg-teal-50 rounded-xl border border-teal-100 flex items-center gap-4">
        <div class="p-3 bg-white rounded-lg shadow-sm">
          <i class="fas fa-clock text-teal-500"></i>
        </div>
        <div>
          <p class="text-xs font-bold text-teal-600 uppercase tracking-widest">{{ 'BOOKING.SELECTED_DURATION' | translate }}</p>
          <p class="text-lg font-black text-gray-900">
            <ng-container *ngIf="selection().start">{{ selection().start }}:00</ng-container>
            <ng-container *ngIf="selection().end"> - {{ selection().end }}:00</ng-container>
            <ng-container *ngIf="!selection().start">--:--</ng-container>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AvailabilityPickerComponent {
  private availabilityService = inject(AvailabilityService);

  @Input() spaceId!: number;
  @Input() date!: string; // YYYY-MM-DD
  @Output() selectionChange = new EventEmitter<{ start: number, end: number } | null>();

  hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM
  busySlots = signal<Availability[]>([]);
  selection = signal<{ start: number | null, end: number | null }>({ start: null, end: null });

  constructor() {
    effect(() => {
      if (this.spaceId && this.date) {
        this.loadAvailability();
      }
    }, { allowSignalWrites: true });
  }

  loadAvailability() {
    this.availabilityService.getAvailability(this.spaceId, this.date).subscribe(busy => {
      this.busySlots.set(busy);
    });
  }

  isBusy(hour: number): boolean {
    const checkTime = new Date(`${this.date}T${hour.toString().padStart(2, '0')}:00:00`);
    return this.busySlots().some(b => {
      const start = new Date(b.start);
      const end = new Date(b.end);
      return checkTime >= start && checkTime < end;
    });
  }

  isSelected(hour: number): boolean {
    const { start, end } = this.selection();
    if (start === null) return false;
    if (end === null) return hour === start;
    return hour >= start && hour < end;
  }

  toggleHour(hour: number) {
    let { start, end } = this.selection();

    if (start === null || (start !== null && end !== null)) {
      this.selection.set({ start: hour, end: null });
    } else {
      if (hour <= start) {
        this.selection.set({ start: hour, end: null });
      } else {
        // Check if any busy slots between start and hour
        const hasBusyBetween = Array.from({ length: hour - start }, (_, i) => start! + i)
          .some(h => this.isBusy(h));
        
        if (hasBusyBetween) {
          this.selection.set({ start: hour, end: null });
        } else {
          this.selection.set({ start, end: hour + 1 });
        }
      }
    }

    const current = this.selection();
    if (current.start !== null && current.end !== null) {
      this.selectionChange.emit({ start: current.start, end: current.end });
    } else {
      this.selectionChange.emit(null);
    }
  }
}
