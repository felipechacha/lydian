import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { OriginGuard } from './origin.guard';

describe('OriginGuard', () => {
  const configService = {
    get: jest.fn().mockReturnValue('https://localhost:4200'),
  } as unknown as ConfigService;
  const guard = new OriginGuard(configService);

  function context({
    method = 'POST',
    origin,
    protocol = 'https',
    host = 'localhost:3000',
  }: {
    method?: string;
    origin?: string;
    protocol?: string;
    host?: string;
  }) {
    const request = {
      method,
      protocol,
      headers: { origin },
      get: (name: string) => (name === 'host' ? host : undefined),
    } as Request;

    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => jest.clearAllMocks());

  it('allows safe methods regardless of origin', () => {
    expect(
      guard.canActivate(
        context({ method: 'GET', origin: 'https://untrusted.example' }),
      ),
    ).toBe(true);
  });

  it('allows non-browser mutations without an Origin header', () => {
    expect(guard.canActivate(context({ origin: undefined }))).toBe(true);
  });

  it('allows the configured frontend origin', () => {
    expect(
      guard.canActivate(context({ origin: 'https://localhost:4200' })),
    ).toBe(true);
  });

  it('allows mutations from the API own origin used by Swagger', () => {
    expect(
      guard.canActivate(context({ origin: 'https://localhost:3000' })),
    ).toBe(true);
  });

  it('rejects a different protocol on the same host', () => {
    expect(() =>
      guard.canActivate(context({ origin: 'http://localhost:3000' })),
    ).toThrow(ForbiddenException);
  });

  it('rejects untrusted origins', () => {
    expect(() =>
      guard.canActivate(context({ origin: 'https://untrusted.example' })),
    ).toThrow('Request origin is not allowed');
  });
});
