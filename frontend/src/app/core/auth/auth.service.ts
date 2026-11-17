import { UserProfileDataResponse } from '../../features/profile/models/profile.models';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthMessageResponse,
  LoginRequest,
  SignupRequest,
  SignupResponse,
} from './auth.models';
import { Router } from '@angular/router';

/**
 * DOCUMENTAÇÃO DOS ENDPOINTS (NestJS / Supabase)
 *
 * Base URL Local: https://localhost:3000
 * (Lembre-se de usar withCredentials: true em todas as chamadas)
 *
 * 1. Signup (Criar Conta)
 *    Rota: POST /v1/auth/signup | Acesso: Público
 *    Payload: { email, password, fullName }
 *
 * 2. Login
 *    Rota: POST /v1/auth/login | Acesso: Público
 *    Payload: { email, password }
 *    Resposta: Cookies access_token e refresh_token setados via HttpOnly.
 *
 * 3. Logout
 *    Rota: POST /v1/auth/logout | Acesso: Privado
 *    Resposta: Cookies removidos.
 *
 * 4. Refresh Token
 *    Rota: POST /v1/auth/refresh | Acesso: Público (Exige refresh_token no cookie)
 *    Resposta: Novo access_token setado no cookie.
 *
 * 5. Me (Perfil Básico)
 *    Rota: GET /v1/auth/me | Acesso: Privado
 *    Resposta: { id, email, role }
 *
 * 6. Health Check
 *    Rota: GET /v1/health | Acesso: Público
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _authApiUrl = `${environment.apiUrl}/auth`;

  private refreshRequest$?: Observable<void>;
  private _currentUserRequest$?: Observable<UserProfileDataResponse>;

  public signUp(
    fullName: string,
    email: string,
    password: string,
  ): Observable<ApiResponse<SignupResponse>> {
    const payload: SignupRequest = { fullName, email, password };

    return this._httpClient.post<ApiResponse<SignupResponse>>(
      `${this._authApiUrl}/signup`,
      payload,
    );
  }

  public signIn(email: string, password: string): Observable<ApiResponse<AuthMessageResponse>> {
    const payload: LoginRequest = { email, password };

    return this._httpClient
      .post<ApiResponse<AuthMessageResponse>>(`${this._authApiUrl}/login`, payload)
      .pipe(tap(() => this._clearCurrentUserCache()));
  }

  public getCurrentUser(): Observable<UserProfileDataResponse> {
    // A sessão é mantida em cookies HttpOnly do navegador. Sem encaminhamento explícito
    // desses cookies, uma chamada SSR não representa a sessão do usuário e ainda pode
    // falhar com certificados HTTPS locais. O browser refaz a consulta após a hidratação.
    if (!this._isBrowser) {
      return EMPTY;
    }

    if (!this._currentUserRequest$) {
      const url = `${environment.apiUrl}/me`;

      this._currentUserRequest$ = this._httpClient.get<UserProfileDataResponse>(url).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError((error: unknown) => {
          this._clearCurrentUserCache();
          return throwError(() => error);
        }),
      );
    }

    return this._currentUserRequest$;
  }

  public checkUserLogged(): Observable<UserProfileDataResponse> {
    if (!this._isBrowser) {
      return EMPTY;
    }

    const url = `${environment.apiUrl}/me`;
    return this._httpClient.get<UserProfileDataResponse>(url);
  }

  /**
   * Solicita a recuperação de senha
   */
  public resetPassword(email: string): Observable<ApiResponse<AuthMessageResponse>> {
    return this._httpClient.post<ApiResponse<AuthMessageResponse>>(
      `${this._authApiUrl}/forgot-password`,
      { email },
    );
  }

  public completePasswordRecovery(
    payload:
      | { password: string; token_hash: string }
      | { password: string; recovery_token: string; refresh_token: string },
  ): Observable<ApiResponse<AuthMessageResponse>> {
    const endpoint = 'token_hash' in payload ? 'reset-password' : 'reset-password/session';
    return this._httpClient
      .post<ApiResponse<AuthMessageResponse>>(`${this._authApiUrl}/${endpoint}`, payload)
      .pipe(tap(() => this._clearCurrentUserCache()));
  }

  /**
   * Realiza o logout do usuário
   */
  public signOut(): Observable<ApiResponse<AuthMessageResponse>> {
    return this._httpClient
      .post<ApiResponse<AuthMessageResponse>>(`${this._authApiUrl}/logout`, {})
      .pipe(tap(() => this._clearCurrentUserCache()));
  }

  refreshToken(): Observable<void> {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this._httpClient.post<void>(`${this._authApiUrl}/refresh`, {}).pipe(
        shareReplay(1),
        finalize(() => {
          this.refreshRequest$ = undefined;
        }),
        catchError((error: unknown) => {
          this._clearCurrentUserCache();
          this._router.navigate(['/login'], { queryParams: { sessionExpired: true } });
          return throwError(() => error);
        }),
      );
    }

    return this.refreshRequest$;
  }

  private _clearCurrentUserCache(): void {
    this._currentUserRequest$ = undefined;
  }
}
