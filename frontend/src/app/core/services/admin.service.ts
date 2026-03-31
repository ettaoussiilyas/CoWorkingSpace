import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Center, Space } from '../models/catalogue.models';

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

export interface CenterRequest {
  name: string;
  city: string;
  address: string;
  description: string;
  phone: string;
  email: string;
  openingHours: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/spaces`;
  private centersUrl = `${environment.apiUrl}/centers`;

  createSpace(request: SpaceRequest): Observable<Space> {
    return this.http.post<Space>(this.apiUrl, request);
  }

  updateSpace(id: number, request: SpaceRequest): Observable<Space> {
    return this.http.put<Space>(`${this.apiUrl}/${id}`, request);
  }

  deleteSpace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-image`, formData)
      .pipe(map(res => res.url));
  }

  createCenter(request: CenterRequest, image: File): Observable<Center> {
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(request)], { type: 'application/json' });
    formData.append('center', blob);
    formData.append('image', image);
    return this.http.post<Center>(this.centersUrl, formData);
  }
}
