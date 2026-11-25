import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Permission, UserRoleType } from '@school-mgmt/shared';
import { sendError } from '../utils/apiResponse.js';

/** Requires the authenticated user to hold at least one of the given roles. */
export function requireRoles(...roles: UserRoleType[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (roles.length > 0 && !roles.some((role) => req.user!.roles.includes(role))) {
      return sendError(res, 403, 'You do not have permission to perform this action');
    }

    return next();
  };
}

/** Requires every listed permission (AND semantics). */
export function requirePermissions(...permissions: Permission[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    const missing = permissions.filter(
      (permission) => !req.user!.permissions.includes(permission),
    );

    if (missing.length > 0) {
      return sendError(res, 403, 'You do not have permission to perform this action', {
        permissions: missing,
      });
    }

    return next();
  };
}

export function requireAllRoles(...roles: UserRoleType[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    const missing = roles.filter((role) => !req.user!.roles.includes(role));
    if (missing.length > 0) {
      return sendError(res, 403, 'You do not have permission to perform this action');
    }

    return next();
  };
}

/** Only super admins may bypass tenant scoping. */
export const requireSuperAdmin: RequestHandler = requireRoles('SUPER_ADMIN');
