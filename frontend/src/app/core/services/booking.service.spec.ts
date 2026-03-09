import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { environment } from '../../../environments/environment';
import { BookingRequest, BookingResponse, BookingStatus } from '../models/booking.models';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  const mockBookingResponse: BookingResponse = {
    id: 1,
    spaceName: 'Meeting Room A',
    centerName: 'Downtown Center',
    startDateTime: '2024-03-20T10:00:00',
    endDateTime: '2024-03-20T12:00:00',
    totalPrice: 100,
    status: BookingStatus.PENDING,
    hasReview: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });

    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createBooking', () => {
    it('should create a new booking', (done) => {
      const request: BookingRequest = {
        spaceId: 1,
        startDateTime: '2024-03-20T10:00:00',
        endDateTime: '2024-03-20T12:00:00'
      };

      service.createBooking(request).subscribe(response => {
        expect(response).toEqual(mockBookingResponse);
        expect(response.id).toBe(1);
        expect(response.spaceName).toBe('Meeting Room A');
        expect(response.totalPrice).toBe(100);
        expect(response.status).toBe(BookingStatus.PENDING);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockBookingResponse);
    });

    it('should handle booking conflict errors', (done) => {
      const request: BookingRequest = {
        spaceId: 1,
        startDateTime: '2024-03-20T10:00:00',
        endDateTime: '2024-03-20T12:00:00'
      };

      service.createBooking(request).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(409);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      req.flush(
        { message: 'booking.conflict.existing_booking' },
        { status: 409, statusText: 'Conflict' }
      );
    });

    it('should handle maintenance conflict errors', (done) => {
      const request: BookingRequest = {
        spaceId: 1,
        startDateTime: '2024-03-20T10:00:00',
        endDateTime: '2024-03-20T12:00:00'
      };

      service.createBooking(request).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(409);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      req.flush(
        { message: 'booking.conflict.maintenance' },
        { status: 409, statusText: 'Conflict' }
      );
    });

    it('should handle unauthorized errors', (done) => {
      const request: BookingRequest = {
        spaceId: 1,
        startDateTime: '2024-03-20T10:00:00',
        endDateTime: '2024-03-20T12:00:00'
      };

      service.createBooking(request).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('getMyBookings', () => {
    it('should retrieve user bookings', (done) => {
      const mockBookings: BookingResponse[] = [
        mockBookingResponse,
        {
          id: 2,
          spaceName: 'Conference Room B',
          centerName: 'Uptown Center',
          startDateTime: '2024-03-21T14:00:00',
          endDateTime: '2024-03-21T16:00:00',
          totalPrice: 150,
          status: BookingStatus.CONFIRMED,
          hasReview: true
        }
      ];

      service.getMyBookings().subscribe(bookings => {
        expect(bookings).toEqual(mockBookings);
        expect(bookings.length).toBe(2);
        expect(bookings[0].id).toBe(1);
        expect(bookings[1].id).toBe(2);
        expect(bookings[1].hasReview).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/my`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBookings);
    });

    it('should return empty array when no bookings exist', (done) => {
      service.getMyBookings().subscribe(bookings => {
        expect(bookings).toEqual([]);
        expect(bookings.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/my`);
      req.flush([]);
    });

    it('should handle unauthorized errors', (done) => {
      service.getMyBookings().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/my`);
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('should handle server errors', (done) => {
      service.getMyBookings().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/my`);
      req.flush(
        { message: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });
});
