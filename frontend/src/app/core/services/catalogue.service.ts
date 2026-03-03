import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Center, Space } from '../models/catalogue.models';

@Injectable({
  providedIn: 'root'
})
export class CatalogueService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCenters(): Observable<Center[]> {
    return this.http.get<Center[]>(`${this.apiUrl}/centers`);
  }

  getCenterById(id: number): Observable<Center> {
    return this.http.get<Center>(`${this.apiUrl}/centers/${id}`);
  }

  getSpacesByCenter(centerId: number): Observable<Space[]> {
    return this.http.get<Space[]>(`${this.apiUrl}/spaces/center/${centerId}`);
  }

  getSpaceById(id: number): Observable<Space> {
    return this.http.get<Space>(`${this.apiUrl}/spaces/${id}`);
  }
}
