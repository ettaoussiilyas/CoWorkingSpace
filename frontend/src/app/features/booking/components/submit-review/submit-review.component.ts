import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReviewService } from '../../../../core/services/review.service';

@Component({
  selector: 'app-submit-review',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="review-box">
      <div class="review-header">
        <h4>{{ 'REVIEW.SHARE_EXPERIENCE' | translate }}</h4>
        <button (click)="cancel.emit()" class="close-btn">✕</button>
      </div>

      <div class="stars-row">
        <button *ngFor="let star of [1,2,3,4,5]" (click)="rating.set(star)" class="star-btn"
          [class.active]="star <= rating()">★</button>
      </div>

      <textarea [(ngModel)]="comment"
        [placeholder]="'REVIEW.COMMENT_PLACEHOLDER' | translate"
        class="review-textarea"></textarea>

      <div class="review-actions">
        <button (click)="cancel.emit()" class="btn-cancel">{{ 'REVIEW.CANCEL' | translate }}</button>
        <button (click)="submit()" [disabled]="rating() === 0 || loading()" class="btn-submit">
          {{ loading() ? ('REVIEW.SUBMITTING' | translate) : ('REVIEW.POST' | translate) }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .review-box { background: #f0fdfa; padding: 24px; border-radius: 16px; border: 1px solid #ccfbf1; margin-top: 16px; }
    .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
      h4 { font-weight: 700; color: #134e4a; margin: 0; font-size: 0.95rem; }
    }
    .close-btn { background: none; border: none; color: #5eead4; cursor: pointer; font-size: 1rem; &:hover { color: #0d9488; } }
    .stars-row { display: flex; gap: 6px; margin-bottom: 16px; }
    .star-btn { background: none; border: none; font-size: 1.6rem; cursor: pointer; color: #d1d5db; transition: all 0.15s; &.active { color: #f59e0b; } &:hover { transform: scale(1.2); } }
    .review-textarea { width: 100%; padding: 12px; border: 1.5px solid #ccfbf1; border-radius: 10px; font-size: 0.88rem; min-height: 90px; outline: none; resize: vertical; font-family: inherit; margin-bottom: 16px; &:focus { border-color: #14b8a6; } }
    .review-actions { display: flex; justify-content: flex-end; gap: 10px; }
    .btn-cancel { background: none; border: none; color: #0d9488; font-weight: 600; font-size: 0.88rem; cursor: pointer; padding: 8px 16px; border-radius: 8px; &:hover { background: #ccfbf1; } }
    .btn-submit { background: #14b8a6; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; &:hover:not(:disabled) { background: #0d9488; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  `]
})
export class SubmitReviewComponent {
  @Input() bookingId!: number;
  @Output() submitted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private reviewService = inject(ReviewService);
  private translate = inject(TranslateService);

  rating = signal(0);
  comment = '';
  loading = signal(false);

  submit() {
    if (this.rating() === 0) return;
    this.loading.set(true);
    this.reviewService.submitReview({ bookingId: this.bookingId, rating: this.rating(), comment: this.comment }).subscribe({
      next: () => { this.loading.set(false); this.submitted.emit(); },
      error: (err) => {
        this.loading.set(false);
        alert(err.error?.message || this.translate.instant('ERRORS.SERVER_ERROR'));
      }
    });
  }
}
