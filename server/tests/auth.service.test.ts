import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    role: { findUnique: vi.fn() },
    school: { findFirst: vi.fn() },
  },
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      refreshSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
        updateUserById: vi.fn(),
        signOut: vi.fn(),
      },
    },
  },
}));

vi.mock('../src/config/prisma.js', () => ({ prisma: mocks.prisma }));
vi.mock('../src/config/supabase.js', () => ({
  supabase: mocks.supabase,
  supabaseAdmin: mocks.supabaseAdmin,
}));

import {
  changePassword,
  forgotPassword,
  login,
  register,
  toUserProfile,
} from '../src/modules/auth/auth.service.js';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const userRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  schoolId: '8f1c2a3e-4b5d-4e6f-8a9b-0c1d2e3f4a5b',
  campusId: null,
  supabaseUserId: 'auth-user-1',
  email: 'parent@school.ac.ke',
  firstName: 'Jane',
  middleName: null,
  lastName: 'Wanjiku',
  phone: null,
  avatarUrl: null,
  isActive: true,
  isEmailVerified: true,
  createdAt,
  updatedAt: createdAt,
  roles: [{ role: { name: 'PARENT' } }],
};

const session = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_at: 1_800_000_000,
};

const loginInput = { email: 'parent@school.ac.ke', password: 'Str0ng!pass' };

const registerInput = {
  firstName: 'Jane',
  lastName: 'Wanjiku',
  email: 'parent@school.ac.ke',
  password: 'Str0ng!pass',
  role: 'PARENT' as const,
  schoolId: userRecord.schoolId,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('toUserProfile', () => {
  it('maps roles and derives permissions from the RBAC matrix', () => {
    const profile = toUserProfile(userRecord as never);

    expect(profile).toMatchObject({
      id: userRecord.id,
      firstName: 'Jane',
      roles: ['PARENT'],
      createdAt: createdAt.toISOString(),
    });
    expect(profile.permissions).toContain('student:read');
    expect(profile.permissions).not.toContain('finance:manage');
  });
});

describe('login', () => {
  it('returns a profile and Supabase session tokens', async () => {
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'auth-user-1' }, session },
      error: null,
    });
    mocks.prisma.user.findFirst.mockResolvedValue(userRecord);
    mocks.prisma.user.update.mockResolvedValue(userRecord);

    const result = await login(loginInput);

    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.user.email).toBe('parent@school.ac.ke');
    expect(mocks.prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: userRecord.id } }),
    );
  });

  it('rejects invalid credentials without touching the database', async () => {
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(login(loginInput)).rejects.toMatchObject({ statusCode: 401 });
    expect(mocks.prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('rejects accounts that are not provisioned locally', async () => {
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'auth-user-1' }, session },
      error: null,
    });
    mocks.prisma.user.findFirst.mockResolvedValue(null);

    await expect(login(loginInput)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('rejects disabled accounts', async () => {
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'auth-user-1' }, session },
      error: null,
    });
    mocks.prisma.user.findFirst.mockResolvedValue({ ...userRecord, isActive: false });

    await expect(login(loginInput)).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('register', () => {
  it('blocks self-registration into staff roles', async () => {
    await expect(
      register({ ...registerInput, role: 'SCHOOL_ADMIN' as never }),
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(mocks.supabaseAdmin.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it('requires a school', async () => {
    await expect(
      register({ ...registerInput, schoolId: undefined }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('creates a Supabase user, local profile, role assignment and session', async () => {
    mocks.prisma.school.findFirst.mockResolvedValue({ id: userRecord.schoolId });
    mocks.prisma.user.findFirst.mockResolvedValue(null);
    mocks.supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'auth-user-1' } },
      error: null,
    });
    mocks.prisma.role.findUnique.mockResolvedValue({ id: 'role-1' });
    mocks.prisma.user.create.mockResolvedValue(userRecord);
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'auth-user-1' }, session },
      error: null,
    });

    const result = await register(registerInput);

    expect(result.tokens.accessToken).toBe('access-token');
    expect(mocks.prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          roles: { create: { roleId: 'role-1' } },
          supabaseUserId: 'auth-user-1',
        }),
      }),
    );
  });

  it('deletes the Supabase user when local provisioning fails', async () => {
    mocks.prisma.school.findFirst.mockResolvedValue({ id: userRecord.schoolId });
    mocks.prisma.user.findFirst.mockResolvedValue(null);
    mocks.supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'auth-user-1' } },
      error: null,
    });
    mocks.prisma.role.findUnique.mockResolvedValue({ id: 'role-1' });
    mocks.prisma.user.create.mockRejectedValue(new Error('duplicate'));
    mocks.supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({ error: null });

    await expect(register(registerInput)).rejects.toThrow('duplicate');
    expect(mocks.supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('auth-user-1');
  });
});

describe('forgotPassword', () => {
  it('sends the reset email with the frontend redirect', async () => {
    mocks.supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    await forgotPassword({ email: 'Parent@School.ac.ke' });

    expect(mocks.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'parent@school.ac.ke',
      expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') }),
    );
  });
});

describe('changePassword', () => {
  it('rejects an incorrect current password', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      email: userRecord.email,
      supabaseUserId: userRecord.supabaseUserId,
    });
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    });

    await expect(
      changePassword(userRecord.id, 'wrong-password', 'N3w!password'),
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(mocks.supabaseAdmin.auth.admin.updateUserById).not.toHaveBeenCalled();
  });

  it('updates the Supabase password after verifying the old one', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      email: userRecord.email,
      supabaseUserId: userRecord.supabaseUserId,
    });
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'auth-user-1' }, session },
      error: null,
    });
    mocks.supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });

    await changePassword(userRecord.id, 'Str0ng!pass', 'N3w!password');

    expect(mocks.supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith(
      'auth-user-1',
      { password: 'N3w!password' },
    );
  });
});
