import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { ApiRequestError } from '../http/api-request.error';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      httpTestingController.verify();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each(['login', 'signup', 'forgot-password', 'reset-password', 'reset-password/session'])(
    'should propagate public auth 401 from %s without refreshing or redirecting',
    (endpoint) => {
      let receivedError: unknown;
      const url = `${environment.apiUrl}/auth/${endpoint}`;
      httpClient.post(url, {}).subscribe({
        error: (error: unknown) => {
          receivedError = error;
        },
      });
      httpTestingController
        .expectOne(url)
        .flush(
          { message: 'Invalid recovery or credentials' },
          { status: 401, statusText: 'Unauthorized' },
        );
      httpTestingController.expectNone(`${environment.apiUrl}/auth/refresh`);
      expect(receivedError).toBeInstanceOf(ApiRequestError);
      expect(receivedError).toMatchObject({ statusCode: 401 });
    },
  );

  it('should include credentials in every API request', () => {
    httpClient.get('/v1/auth/me').subscribe();

    const request = httpTestingController.expectOne('/v1/auth/me');

    expect(request.request.withCredentials).toBe(true);
    request.flush({ data: { id: 'user-id' } });
  });

  it('should preserve the backend error message and request id', () => {
    let receivedError: unknown;

    httpClient.post('/v1/auth/refresh', {}).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    const request = httpTestingController.expectOne('/v1/auth/refresh');
    request.flush(
      {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
        requestId: 'request-id',
      },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(receivedError).toBeInstanceOf(ApiRequestError);
    expect(receivedError).toMatchObject({
      message: 'Invalid credentials',
      statusCode: 401,
      requestId: 'request-id',
    });
  });

  it('should normalize a transport error when ErrorEvent is unavailable during SSR', () => {
    vi.stubGlobal('ErrorEvent', undefined);
    let receivedError: unknown;

    httpClient.get('/v1/me').subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    const request = httpTestingController.expectOne('/v1/me');
    request.flush(new TypeError('fetch failed'), {
      status: 0,
      statusText: 'Unknown Error',
    });

    expect(receivedError).toBeInstanceOf(ApiRequestError);
    expect(receivedError).toMatchObject({
      message: 'fetch failed',
      statusCode: 0,
    });
  });

  it('should propagate the refresh error when a protected request has an expired session', () => {
    let receivedError: unknown;

    httpClient.get('/v1/practice-sessions/session-id').subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    const protectedRequest = httpTestingController.expectOne('/v1/practice-sessions/session-id');
    protectedRequest.flush(
      { statusCode: 401, message: 'Access token is missing', error: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    const refreshRequest = httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`);
    refreshRequest.flush(
      { statusCode: 401, message: 'Refresh token is missing', error: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(receivedError).toBeInstanceOf(ApiRequestError);
    expect(receivedError).toMatchObject({
      message: 'Refresh token is missing',
      statusCode: 401,
    });
  });
});
