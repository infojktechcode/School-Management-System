import type { UserProfile } from '@school-mgmt/shared';

export function testUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@school.ac.ke',
    firstName: 'Grace',
    lastName: 'Kimani',
    schoolId: '8f1c2a3e-4b5d-4e6f-8a9b-0c1d2e3f4a5b',
    roles: ['SCHOOL_ADMIN'],
    permissions: ['student:read', 'student:create', 'finance:read'],
    isActive: true,
    isEmailVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
