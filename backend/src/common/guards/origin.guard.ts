import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  private isSameOrigin(request: Request, origin: string): boolean {
    const host = request.get('host');
    if (!host) return false;

    try {
      const requestOrigin = new URL(`${request.protocol}://${host}`).origin;
      return new URL(origin).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;

    const origin = request.headers.origin;
    if (!origin) return true;

    if (this.isSameOrigin(request, origin)) return true;

    const allowedOrigins = this.configService
      .get<string>('CORS_ORIGIN', 'https://localhost:4200')
      .split(',')
      .map((value) => value.trim());

    if (!allowedOrigins.includes(origin)) {
      throw new ForbiddenException('Request origin is not allowed');
    }
    return true;
  }
}
