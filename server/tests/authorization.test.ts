import { describe, expect, it, vi } from 'vitest';
import { requirePermissions, requireRoles } from '../src/middleware/authorization.js';
import { mockRequest, mockResponse, testUser } from './helpers.js';

describe('requireRoles', () => {
  it('rejects unauthenticated requests', () => {
    const res = mockResponse();
    const next = vi.fn();
    requireRoles('SCHOOL_ADMIN')(mockRequest(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a matching role', () => {
    const req = mockRequest();
    req.user = testUser({ roles: ['TEACHER'] });
    const next = vi.fn();

    requireRoles('TEACHER', 'SCHOOL_ADMIN')(req, mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('blocks a non-matching role', () => {
    const req = mockRequest();
    req.user = testUser({ roles: ['PARENT'] });
    const res = mockResponse();
    const next = vi.fn();

    requireRoles('SCHOOL_ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requirePermissions', () => {
  it('requires every listed permission', () => {
    const req = mockRequest();
    req.user = testUser({ permissions: ['student:read'] });
    const res = mockResponse();
    const next = vi.fn();

    requirePermissions('student:read', 'student:create')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: { permissions: ['student:create'] },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('passes when all permissions are held', () => {
    const req = mockRequest();
    req.user = testUser({ permissions: ['student:read', 'student:create'] });
    const next = vi.fn();

    requirePermissions('student:read', 'student:create')(req, mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
  });
});
