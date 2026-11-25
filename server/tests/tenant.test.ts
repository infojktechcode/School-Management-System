import { describe, expect, it, vi } from 'vitest';
import { tenantMiddleware } from '../src/middleware/tenant.js';
import { mockRequest, mockResponse, OTHER_SCHOOL_ID, SCHOOL_ID, testUser } from './helpers.js';

describe('tenantMiddleware', () => {
  it('rejects unauthenticated requests', () => {
    const res = mockResponse();
    tenantMiddleware(mockRequest(), res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('pins a regular user to their own school', () => {
    const req = mockRequest();
    req.user = testUser({ schoolId: SCHOOL_ID });
    const next = vi.fn();

    tenantMiddleware(req, mockResponse(), next);

    expect(req.schoolId).toBe(SCHOOL_ID);
    expect(next).toHaveBeenCalledOnce();
  });

  it('rejects a mismatched x-school-id', () => {
    const req = mockRequest({
      headers: { 'x-school-id': OTHER_SCHOOL_ID },
    });
    req.user = testUser({ schoolId: SCHOOL_ID });
    const res = mockResponse();

    tenantMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rejects a mismatched route schoolId parameter', () => {
    const req = mockRequest({ params: { schoolId: OTHER_SCHOOL_ID } });
    req.user = testUser({ schoolId: SCHOOL_ID });
    const res = mockResponse();

    tenantMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('requires a school context for super admins', () => {
    const req = mockRequest();
    req.user = testUser({ roles: ['SUPER_ADMIN'], schoolId: undefined });
    const res = mockResponse();

    tenantMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('lets super admins target any school explicitly', () => {
    const req = mockRequest({ headers: { 'x-school-id': OTHER_SCHOOL_ID } });
    req.user = testUser({ roles: ['SUPER_ADMIN'], schoolId: undefined });
    const next = vi.fn();

    tenantMiddleware(req, mockResponse(), next);

    expect(req.schoolId).toBe(OTHER_SCHOOL_ID);
    expect(next).toHaveBeenCalledOnce();
  });

  it('rejects malformed school ids', () => {
    const req = mockRequest({ headers: { 'x-school-id': 'not-a-uuid' } });
    req.user = testUser();
    const res = mockResponse();

    tenantMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects users with no school', () => {
    const req = mockRequest();
    req.user = testUser({ schoolId: undefined });
    const res = mockResponse();

    tenantMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
