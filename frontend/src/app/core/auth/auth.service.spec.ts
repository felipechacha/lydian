import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should send the login contract to the versioned API', () => {
    service.signIn('test@lydian.com', 'LydianTest123!').subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'test@lydian.com',
      password: 'LydianTest123!',
    });

    request.flush({ data: { message: 'Login successful' } });
  });

  it('should map the full name to the signup contract', () => {
    service.signUp('Lydian Test', 'test@lydian.com', 'LydianTest123!').subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/signup`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      fullName: 'Lydian Test',
      email: 'test@lydian.com',
      password: 'LydianTest123!',
    });

    request.flush({
      data: {
        id: 'user-id',
        email: 'test@lydian.com',
        fullName: 'Lydian Test',
      },
    });
  });

  it('should request a recovery email from the actual public endpoint', () => {
    service.resetPassword('musician@example.com').subscribe();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/forgot-password`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'musician@example.com' });
    request.flush({ data: { message: 'Generic recovery response' } });
  });

  it('should send email-bound proof and refresh token to the recovery session endpoint', () => {
    const payload = {
      recovery_token: 'a'.repeat(64),
      refresh_token: 'fixture-refresh',
      password: 'NewPassword123!',
    };
    service.completePasswordRecovery(payload).subscribe();
    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/auth/reset-password/session`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { message: 'Password updated' } });
  });

  it('should request logout through the cookie-based API', () => {
    service.signOut().subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/logout`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});

    request.flush({ data: { message: 'Logged out' } });
  });

  it('should share the current user request between page and header subscribers', () => {
    const receivedResponses: any[] = [];

    service.getCurrentUser().subscribe((response) => receivedResponses.push(response));
    service.getCurrentUser().subscribe((response) => receivedResponses.push(response));

    const requests = httpTestingController.match(`${environment.apiUrl}/me`);

    expect(requests).toHaveLength(1);
    requests[0].flush({ data: { display_name: 'Felipe Costa' } });
    expect(receivedResponses).toHaveLength(2);
  });
});

describe('AuthService during SSR', () => {
  it('should not request cookie-authenticated user data from the server renderer', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const service = TestBed.inject(AuthService);
    const httpTestingController = TestBed.inject(HttpTestingController);
    let completed = false;

    service.getCurrentUser().subscribe({ complete: () => (completed = true) });
    service.checkUserLogged().subscribe();

    expect(completed).toBe(true);
    httpTestingController.expectNone(`${environment.apiUrl}/me`);
    httpTestingController.verify();
  });
});
