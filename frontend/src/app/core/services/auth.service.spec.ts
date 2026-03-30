import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let localStorageSpy: jasmine.Spy;

  const mockAuthResponse: AuthResponse = {
    accessToken: 'test-token',
    fullName: 'Test User',
    email: 'test@example.com',
    role: 'ROLE_USER'
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a new user and store authentication data', (done) => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      service.register(userData).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('accessToken')).toBe('test-token');
        expect(localStorage.getItem('user')).toBeTruthy();

        const storedUser = JSON.parse(localStorage.getItem('user')!);
        expect(storedUser.fullName).toBe('Test User');
        expect(storedUser.email).toBe('test@example.com');
        expect(storedUser.role).toBe('ROLE_USER');

        expect(service.currentUser()).toBeTruthy();
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockAuthResponse);
    });

    it('should handle registration errors', (done) => {
      const userData = {
        fullName: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      service.register(userData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(localStorage.getItem('accessToken')).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user and store authentication data', (done) => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('accessToken')).toBe('test-token');
        expect(service.currentUser()).toBeTruthy();
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it('should handle login errors', (done) => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(localStorage.getItem('accessToken')).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear authentication data and navigate to home', () => {
      // Set up authenticated state
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'ROLE_USER'
      }));

      // Perform logout
      service.logout();

      // Verify cleanup
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('getToken', () => {
    it('should return token when stored', () => {
      localStorage.setItem('accessToken', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('currentUser signal', () => {

    it('should be null when no user in localStorage', () => {
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAuthenticated computed signal', () => {
    it('should return true when user is logged in', (done) => {
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });

    it('should return false when user is logged out', () => {
      expect(service.isAuthenticated()).toBe(false);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
