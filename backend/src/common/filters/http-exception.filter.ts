import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request & { requestId?: string }>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = extractMessage(exceptionResponse, status);
    const error =
      exception instanceof HttpException
        ? exception.name.replace('Exception', '')
        : 'Internal Server Error';

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} requestId=${request.requestId ?? '-'} error=${exception instanceof Error ? exception.name : 'UnknownError'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      requestId: request.requestId,
    });
  }
}

function extractMessage(
  response: string | object | undefined,
  status: number,
): string | string[] {
  if (typeof response === 'string') return response;
  if (response && 'message' in response) {
    const message = (response as { message?: unknown }).message;
    if (typeof message === 'string' || Array.isArray(message)) return message;
  }
  return status >= 500 ? 'Internal server error' : 'Request failed';
}
