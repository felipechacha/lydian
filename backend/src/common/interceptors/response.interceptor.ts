import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RAW_RESPONSE_KEY } from '../decorators/raw-response.decorator';

interface PaginatedResult<T> {
  data: T;
  meta: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  { data: T } | PaginatedResult<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ data: T } | PaginatedResult<T> | T> {
    const rawResponse = this.reflector.getAllAndOverride<boolean>(
      RAW_RESPONSE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (rawResponse) {
      return next.handle();
    }

    return next.handle().pipe(
      map((value) => {
        if (isPaginatedResult(value)) {
          return value;
        }
        return { data: value };
      }),
    );
  }
}

function isPaginatedResult<T>(value: T): value is T & PaginatedResult<unknown> {
  return Boolean(
    value && typeof value === 'object' && 'data' in value && 'meta' in value,
  );
}
