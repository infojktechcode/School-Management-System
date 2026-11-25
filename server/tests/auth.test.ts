import { describe, expect, it, vi } from 'vitest';
import {
  createAuthMiddleware,
  signAccessToken,
  signRefreshToken,
  verifyLocalAccessToken,
  verifyLocalRefreshToken,
} from '../src/middleware/auth.js';
import { mockRequest, mockResponse, SCHOOL_ID, testUser } from './helpers.js';

const payload = {
  sub: '11111111-1111-4111-8111-111111111111',
  email: 'admin@school.ac.ke',
  schoolId: SCHOOL_ID,
  roles: ['SCHOOL_ADMIN' as const],
};

describe('access tokens', () => {
  it('round-trips a signed payload', () => {
    const token = signAccessToken(payload);
    expect(verifyLocalAccessToken(token)).toMatchObject(payload);
  });

  it('rejects an expired token', () => {
    const token = signAccessToken(payload, '-1s');
    expect(() => verifyLocalAccessToken(token)).toThrow();
  });

  it('rejects a token signed with the wrong secret', () => {
    const token = signAccessToken(payload);
    expect(() => verifyLocalRefreshToken(token)).toThrow();
  });
});

describe('refresh tokens', () => {
  it('round-trips the user id and type', () => {
    const token = signRefreshToken(payload.sub);
    expect(verifyLocalRefreshToken(token)).toMatchObject({ sub: payload.sub, type: 'refresh' });
  });
});

describe('createAuthMiddleware', () => {
  it('rejects requests without a bearer token', async () => {
    const res = mockResponse();
    const next = vi.fn();

    await createAuthMiddleware(async () => testUser())(mockRequest(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer bad-token' } });
    const res = mockResponse();

    await createAuthMiddleware(async () => null)(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('attaches the verified user', async () => {
    const user = testUser();
    const req = mockRequest({ headers: { authorization: 'Bearer good-token' } });
    const next = vi.fn();

    await createAuthMiddleware(async () => user)(req, mockResponse(), next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledOnce();
  });

  it('turns verifier exceptions into 401', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer boom' } });
    const res = mockResponse();

    await createAuthMiddleware(async () => {
      throw new Error('boom');
    })(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
