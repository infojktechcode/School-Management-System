import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { sendError } from '../utils/apiResponse.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Resolves the active tenant for a request.
 *
 * - Regular users are pinned to their own school; a mismatched header or
 *   route parameter is a 403, not a silent override.
 * - SUPER_ADMIN may target any school via `x-school-id` or `:schoolId`.
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void | Response {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required');
  }

  const requested = (req.header('x-school-id') ?? req.params.schoolId ?? '').trim();
  if (requested && !UUID_PATTERN.test(requested)) {
    return sendError(res, 400, 'Invalid school id');
  }

  if (req.user.roles.includes('SUPER_ADMIN')) {
    if (!requested) {
      return sendError(res, 400, 'x-school-id header is required for super administrators');
    }
    req.schoolId = requested;
    return next();
  }

  if (!req.user.schoolId) {
    return sendError(res, 403, 'Your account is not attached to a school');
  }

  if (requested && requested !== req.user.schoolId) {
    return sendError(res, 403, 'You cannot access another school');
  }

  req.schoolId = req.user.schoolId;
  return next();
}

/** Guard for handlers that depend on `req.schoolId`. */
export function requireTenant(req: Request, res: Response, next: NextFunction): void | Response {
  if (!req.schoolId) {
    return sendError(res, 400, 'A school context is required');
  }
  return next();
}

export const tenant = tenantMiddleware as RequestHandler;
