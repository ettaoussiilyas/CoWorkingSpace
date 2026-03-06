import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Availability } from '../models/catalogue.models';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/availability`;

  getAvailability(spaceId: number, date: string): Observable<Availability[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Availability[]>(`${this.apiUrl}/${spaceId}`, { params });
  }
}
