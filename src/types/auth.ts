import type { Request } from 'express';

export type UserRole = 'admin' | 'user';

export interface JwtPayload {
  sub: string;
  username: string;
  role?: UserRole;
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
  role: UserRole;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
