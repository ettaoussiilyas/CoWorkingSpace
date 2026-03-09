import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/reviews';

  getReviewsBySpace(spaceId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API}/space/${spaceId}`);
  }

  submitReview(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.API, review);
  }

  reportReview(id: number): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/report`, {});
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
