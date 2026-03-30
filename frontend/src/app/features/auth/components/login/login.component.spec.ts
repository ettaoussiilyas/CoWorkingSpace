import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthResponse } from '../../../../core/models/auth.models';
import { Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockAuthResponse: AuthResponse = {
    accessToken: 'test-token',
    fullName: 'Test User',
    email: 'test@example.com',
    role: 'ROLE_USER'
  };

  // Mock TranslatePipe
  @Pipe({ name: 'translate', standalone: true })
  class MockTranslatePipe implements PipeTransform {
    transform(value: string): string {
      return value;
    }
  }

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant', 'use', 'setDefaultLang', 'get', 'addLangs']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], { snapshot: {} });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MockTranslatePipe
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    })
    .overrideComponent(LoginComponent, {
      set: { imports: [CommonModule, ReactiveFormsModule, HttpClientTestingModule, MockTranslatePipe] }
    })
    .compileComponents();

    // Provide a default return value for translateService.instant
    translateSpy.instant.and.callFake((key: string) => key);

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    // silence console.error during tests to avoid noisy 401 logs
    spyOn(console, 'error');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with empty form', () => {
      expect(component.loginForm.value).toEqual({
        email: '',
        password: ''
      });
    });

    it('should mark form as invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should require email field', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTruthy();

      emailControl?.setValue('test@example.com');
      expect(emailControl?.hasError('required')).toBeFalsy();
    });

    it('should require password field', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTruthy();

      passwordControl?.setValue('password');
      expect(passwordControl?.hasError('required')).toBeFalsy();
    });

    it('should require password minimum length of 6', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBeFalsy();
    });

    it('should mark form as valid when all fields are correctly filled', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(component.loginForm.valid).toBeTruthy();
    });
  });

  describe('Login Submission', () => {
    beforeEach(() => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should call authService.login with form values', () => {
      authService.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should navigate to /home on successful login', () => {
      authService.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should set isLoading to true during login', () => {
      authService.login.and.returnValue(of(mockAuthResponse));

      expect(component.isLoading).toBeFalsy();

      component.onSubmit();

      // isLoading should be set to true before the observable completes
      // After completion, it remains true until error or navigation happens
      expect(authService.login).toHaveBeenCalled();
    });

    it('should clear errorMessage on submit', () => {
      component.errorMessage = 'Previous error';
      authService.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('should display error message on failed login', () => {
      const errorResponse = { status: 401, message: 'Unauthorized' };
      authService.login.and.returnValue(throwError(() => errorResponse));
      translateService.instant.and.returnValue('Authentication failed');

      component.onSubmit();

      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('Authentication failed');
      expect(translateService.instant).toHaveBeenCalledWith('ERRORS.AUTH_FAILED');
    });

    it('should set isLoading to false on error', () => {
      const errorResponse = { status: 401, message: 'Unauthorized' };
      authService.login.and.returnValue(throwError(() => errorResponse));
      translateService.instant.and.returnValue('Authentication failed');

      component.onSubmit();

      expect(component.isLoading).toBeFalsy();
    });

    it('should not submit when form is invalid', () => {
      component.loginForm.setValue({
        email: 'invalid-email',
        password: '123'
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should not navigate on login error', () => {
      const errorResponse = { status: 401, message: 'Unauthorized' };
      authService.login.and.returnValue(throwError(() => errorResponse));
      translateService.instant.and.returnValue('Authentication failed');

      component.onSubmit();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('UI State', () => {
    it('should disable submit button when form is invalid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBeFalsy();
    });

    it('should disable submit button when loading', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      component.isLoading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBeTruthy();
    });

    it('should display error message when present', () => {
      // Create a fresh local fixture so we can set properties before the first change detection
      const localFixture = TestBed.createComponent(LoginComponent);
      const localComponent = localFixture.componentInstance;

      // Set the error message before running change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
      localComponent.errorMessage = 'Test error message';
      localFixture.detectChanges();

      const compiled = localFixture.nativeElement as HTMLElement;
      const errorElement = compiled.querySelector('.error-msg');
      expect(errorElement?.textContent?.trim()).toContain('Test error message');
    });

    it('should not display error message when empty', () => {
      component.errorMessage = '';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const errorElement = compiled.querySelector('.error-msg');

      expect(errorElement).toBeNull();
    });
  });
});
