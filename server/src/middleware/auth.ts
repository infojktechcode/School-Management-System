import jwt from 'jsonwebtoken';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ROLE_PERMISSIONS, type UserRoleType } from '@school-mgmt/shared';
import { config } from '../config/index.js';
import { prisma } from '../config/prisma.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedUser } from '../types/express.js';

export interface AccessTokenPayload {
  sub: string;
  email?: string;
  schoolId?: string;
  campusId?: string;
  roles: UserRoleType[];
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export type TokenVerifier = (token: string) => Promise<AuthenticatedUser | null>;

const TOKEN_ISSUER = 'school-management-system';

export function signAccessToken(
  payload: AccessTokenPayload,
  expiresIn: string = config.jwt.expiresIn,
): string {
  return jwt.sign({ ...payload, iss: TOKEN_ISSUER }, config.jwt.secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(
  userId: string,
  expiresIn: string = config.jwt.refreshExpiresIn,
): string {
  return jwt.sign({ sub: userId, type: 'refresh', iss: TOKEN_ISSUER }, config.jwt.refreshSecret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyLocalAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.secret, {
    issuer: TOKEN_ISSUER,
  }) as AccessTokenPayload;
}

export function verifyLocalRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: TOKEN_ISSUER,
  }) as RefreshTokenPayload;
}

/**
 * Production verifier: validates the Supabase session, then loads the local
 * app user with roles. Permissions are derived from the shared RBAC matrix so
 * the server never trusts client-supplied permissions.
 */
export async function verifySupabaseToken(token: string): Promise<AuthenticatedUser | null> {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const user = await prisma.user.findUnique({
    where: { supabaseUserId: data.user.id },
    include: { roles: { include: { role: true } } },
  });

  if (!user || !user.isActive) return null;

  const roles = user.roles.map((assignment) => assignment.role.name as UserRoleType);
  const permissions = [...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []))];

  return {
    id: user.id,
    supabaseUserId: data.user.id,
    email: user.email,
    schoolId: user.schoolId ?? undefined,
    campusId: user.campusId ?? undefined,
    roles,
    permissions,
  };
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

/**
 * Authentication middleware factory. Tests inject a verifier so middleware
 * behaviour can be proven without network or database access.
 */
export function createAuthMiddleware(
  verifier: TokenVerifier = verifySupabaseToken,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req);
    if (!token) {
      return sendError(res, 401, 'Authentication required');
    }

    try {
      const user = await verifier(token);
      if (!user) {
        return sendError(res, 401, 'Invalid or expired token');
      }

      req.user = user;
      return next();
    } catch (error) {
      logger.debug('Token verification failed', { error });
      return sendError(res, 401, 'Invalid or expired token');
    }
  };
}

export const authenticate: RequestHandler = createAuthMiddleware();

export function getPermissionsForRoles(roles: UserRoleType[]): string[] {
  return [...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []))];
}
