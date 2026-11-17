import type { Request } from 'express';
import type { AuthenticatedUser } from './authenticated-user.type';

export type AuthenticatedRequest = Omit<Request, 'cookies'> & {
  cookies: Record<string, string | undefined>;
  user?: AuthenticatedUser;
  requestId?: string;
};
