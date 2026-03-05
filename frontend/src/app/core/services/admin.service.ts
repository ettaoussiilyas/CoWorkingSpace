import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Space } from '../models/catalogue.models';

export interface SpaceRequest {
  name: string;
  type: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay?: number;
  centerId: number;
  photos: string[];
  amenities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/spaces`;

  createSpace(request: SpaceRequest): Observable<Space> {
    return this.http.post<Space>(this.apiUrl, request);
  }

  updateSpace(id: number, request: SpaceRequest): Observable<Space> {
    return this.http.put<Space>(`${this.apiUrl}/${id}`, request);
  }

  deleteSpace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
