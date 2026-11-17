import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { ApiErrorResponse } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { ApiRequestError } from '../http/api-request.error';

/**
 * Interceptor de Autenticação e Erros.
 * Gerencia o ciclo de vida do JWT e tratamento global de respostas.
 */
export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  nextHandler: HttpHandlerFn,
) => {
  const _authService = inject(AuthService);
  const authenticatedRequest = request.clone({
    withCredentials: true,
  });

  return nextHandler(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicAuthRequest(request)) {
        return _authService.refreshToken().pipe(
          switchMap(() => nextHandler(authenticatedRequest)),
          catchError((retryError: unknown) => {
            if (!(retryError instanceof HttpErrorResponse)) {
              return throwError(() => retryError);
            }
            const retryApiError = getApiError(retryError);
            return throwError(
              () =>
                new ApiRequestError(
                  retryApiError.message,
                  retryError.status,
                  retryApiError.requestId,
                ),
            );
          }),
        );
      }

      const apiError = getApiError(error);
      return throwError(
        () => new ApiRequestError(apiError.message, error.status, apiError.requestId),
      );
    }),
  );
};

function isPublicAuthRequest(request: HttpRequest<unknown>): boolean {
  return /\/auth\/(?:refresh|login|signup|forgot-password|reset-password(?:\/session)?)(?:[?#]|$)/.test(
    request.url,
  );
}

function getApiError(error: HttpErrorResponse): {
  message: string;
  requestId?: string;
} {
  // Do not rely on browser-only globals such as ErrorEvent here. This interceptor also
  // runs during Angular SSR, where transport failures are commonly exposed as TypeError.
  const response = error.error as Partial<ApiErrorResponse> | null;
  const backendMessage = response?.message;

  if (Array.isArray(backendMessage)) {
    return {
      message: backendMessage.join(' '),
      requestId: response?.requestId,
    };
  }

  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return { message: backendMessage, requestId: response?.requestId };
  }

  const messageByStatus: Record<number, string> = {
    0: 'Não foi possível conectar à API. Verifique se o servidor HTTPS está ativo.',
    400: 'Revise os dados informados e tente novamente.',
    401: 'E-mail ou senha inválidos.',
    403: 'Você não tem permissão para realizar esta operação.',
    404: 'O recurso solicitado não foi encontrado.',
    429: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    500: 'O servidor encontrou um erro. Tente novamente mais tarde.',
  };

  return {
    message: messageByStatus[error.status] ?? 'Ocorreu um erro inesperado.',
  };
}
