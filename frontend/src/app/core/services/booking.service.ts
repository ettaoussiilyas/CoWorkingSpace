import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingRequest, BookingResponse } from '../models/booking.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/bookings`, request);
  }

  getMyBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/bookings/my`);
  }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/bookings/all`);
  }

  updateBookingStatus(id: number, status: string): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.apiUrl}/bookings/${id}/status`, { status });
  }

  cancelBooking(id: number): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.apiUrl}/bookings/${id}/status`, { status: 'CANCELLED' });
  }
}
