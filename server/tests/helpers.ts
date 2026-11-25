import type { Request, Response } from 'express';
import { vi } from 'vitest';
import type { AuthenticatedUser } from '../src/types/express.js';

export const SCHOOL_ID = '8f1c2a3e-4b5d-4e6f-8a9b-0c1d2e3f4a5b';
export const OTHER_SCHOOL_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

export function mockResponse(): Response {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
    headersSent: false,
  };

  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json.mockImplementation((body: unknown) => {
    res.body = body;
    return res;
  });

  return res as unknown as Response;
}

export function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    params: {},
    body: {},
    query: {},
    header(name: string) {
      return (this.headers as Record<string, string | undefined>)[name.toLowerCase()];
    },
    ...overrides,
  } as unknown as Request;
}

export function testUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@school.ac.ke',
    schoolId: SCHOOL_ID,
    roles: ['SCHOOL_ADMIN'],
    permissions: ['student:read', 'student:create'],
    ...overrides,
  };
}
