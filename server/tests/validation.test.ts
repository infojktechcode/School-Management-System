import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateBody, validateQuery } from '../src/middleware/validation.js';
import { mockRequest, mockResponse } from './helpers.js';

const schema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(2),
});

describe('validateBody', () => {
  it('replaces the body with parsed data', () => {
    const req = mockRequest({ body: { email: '  a@b.co ', name: ' Jane ' } });
    const next = vi.fn();

    validateBody(schema)(req, mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ email: 'a@b.co', name: 'Jane' });
  });

  it('returns 400 with field errors', () => {
    const req = mockRequest({ body: { email: 'nope', name: 'J' } });
    const res = mockResponse();
    const next = vi.fn();

    validateBody(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: expect.objectContaining({
          email: expect.any(Array),
          name: expect.any(Array),
        }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe('validateQuery', () => {
  it('coerces and defaults query values', () => {
    const req = mockRequest({ query: { page: '2', limit: '50' } as never });
    const next = vi.fn();

    validateQuery(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().max(100).default(20),
      }),
    )(req, mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.query).toEqual({ page: 2, limit: 50 });
  });
});
