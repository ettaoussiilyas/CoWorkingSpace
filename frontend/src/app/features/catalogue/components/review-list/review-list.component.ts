import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReviewService } from '../../../../core/services/review.service';
import { Review } from '../../../../core/models/review.models';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="reviews">
      <h4 class="reviews-title">{{ 'REVIEW.TITLE' | translate }}</h4>

      <div *ngIf="loading()" class="reviews-loading">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading() && reviews().length === 0" class="reviews-empty">
        {{ 'REVIEW.EMPTY' | translate }}
      </div>

      <div class="review-list">
        <div *ngFor="let review of reviews()" class="review-card">
          <div class="review-top">
            <div>
              <p class="reviewer-name">{{ review.userName }}</p>
              <p class="review-date">{{ review.createdAt | date:'mediumDate' }}</p>
            </div>
            <div class="stars">
              <span *ngFor="let i of [1,2,3,4,5]" [class.filled]="i <= review.rating">★</span>
            </div>
          </div>
          <p class="review-comment">{{ review.comment }}</p>
          <div class="review-footer">
            <button *ngIf="!review.reported" (click)="reportReview(review.id)" class="report-btn">
              {{ 'REVIEW.REPORT' | translate }}
            </button>
            <span *ngIf="review.reported" class="reported-label">{{ 'REVIEW.UNDER_REVIEW' | translate }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews { margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
    .reviews-title { font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0 0 16px; }
    .reviews-loading { display: flex; justify-content: center; padding: 24px; }
    .spinner { width: 24px; height: 24px; border: 2px solid #e2e8f0; border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .reviews-empty { color: #94a3b8; font-size: 0.88rem; font-style: italic; padding: 8px 0; }
    .review-list { display: flex; flex-direction: column; gap: 12px; }
    .review-card { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; transition: border-color 0.2s; &:hover { border-color: #e2e8f0; } }
    .review-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .reviewer-name { font-weight: 700; font-size: 0.88rem; color: #1e293b; margin: 0 0 2px; }
    .review-date { font-size: 0.75rem; color: #94a3b8; margin: 0; }
    .stars { display: flex; gap: 2px; font-size: 0.9rem; color: #d1d5db; span.filled { color: #f59e0b; } }
    .review-comment { font-size: 0.88rem; color: #475569; line-height: 1.6; margin: 0 0 10px; }
    .review-footer { display: flex; justify-content: flex-end; }
    .report-btn { background: none; border: none; font-size: 0.75rem; color: #cbd5e1; cursor: pointer; &:hover { color: #ef4444; } }
    .reported-label { font-size: 0.75rem; color: #f87171; font-style: italic; }
  `]
})
export class ReviewListComponent implements OnInit {
  @Input() spaceId!: number;
  private reviewService = inject(ReviewService);
  private translate = inject(TranslateService);

  reviews = signal<Review[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    if (this.spaceId) {
      this.reviewService.getReviewsBySpace(this.spaceId).subscribe({
        next: (res) => { this.reviews.set(res); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  reportReview(id: number): void {
    if (confirm(this.translate.instant('REVIEW.REPORT_CONFIRM'))) {
      this.reviewService.reportReview(id).subscribe(() => {
        this.reviews.set(this.reviews().map(r => r.id === id ? { ...r, reported: true } : r));
      });
    }
  }
}
