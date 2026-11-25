import { describe, expect, it } from 'vitest';
import {
  errorResponse,
  sendCreated,
  sendError,
  sendPaginated,
  sendSuccess,
  successResponse,
} from '../src/utils/apiResponse.js';
import { mockResponse } from './helpers.js';

describe('successResponse', () => {
  it('wraps data in the standard envelope', () => {
    expect(successResponse({ id: 1 }, 'Fetched', { page: 1 })).toEqual({
      success: true,
      message: 'Fetched',
      data: { id: 1 },
      meta: { page: 1 },
    });
  });
});

describe('errorResponse', () => {
  it('includes field errors', () => {
    expect(errorResponse('Validation failed', { email: ['Invalid'] })).toEqual({
      success: false,
      message: 'Validation failed',
      error: 'Validation failed',
      errors: { email: ['Invalid'] },
    });
  });
});

describe('sendSuccess', () => {
  it('defaults to HTTP 200', () => {
    const res = mockResponse();
    sendSuccess(res, { ok: true });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'OK',
      data: { ok: true },
      meta: undefined,
    });
  });

  it('supports 201 responses', () => {
    const res = mockResponse();
    sendCreated(res, { id: 'abc' });

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('sendError', () => {
  it('sends the requested status and message', () => {
    const res = mockResponse();
    sendError(res, 403, 'Forbidden');

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Forbidden' }),
    );
  });
});

describe('sendPaginated', () => {
  it('passes pagination meta through', () => {
    const res = mockResponse();
    sendPaginated(res, [], {
      page: 2,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: true,
    });

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ page: 2, hasPrev: true }),
      }),
    );
  });
});
