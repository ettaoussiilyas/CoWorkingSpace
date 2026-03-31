import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { DashboardStatsResponse } from '../models/dashboard.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = `${environment.apiUrl}/stats`;

  getStats(): Observable<DashboardStatsResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<DashboardStatsResponse>(`${this.API}/dashboard`, { headers })
      .pipe(
        catchError(error => {
          console.error('Dashboard API Error:', error);
          return throwError(() => error);
        })
      );
  }
}
