import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Observable, finalize } from 'rxjs';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

type RequestWithContext = Request & {
  requestId?: string;
  user?: AuthenticatedUser;
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithContext>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    request.requestId =
      request.headers['x-request-id']?.toString() ?? randomUUID();
    response.setHeader('x-request-id', request.requestId);

    return next.handle().pipe(
      finalize(() => {
        this.logger.log(
          `${request.method} ${request.originalUrl} status=${response.statusCode} durationMs=${Date.now() - startedAt} requestId=${request.requestId} userId=${request.user?.id ?? '-'}`,
        );
      }),
    );
  }
}
