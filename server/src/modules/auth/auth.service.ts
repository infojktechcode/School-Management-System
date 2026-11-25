import type { UserProfile, UserRoleType } from '@school-mgmt/shared';
import { ROLE_PERMISSIONS } from '@school-mgmt/shared';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { supabase, supabaseAdmin } from '../../config/supabase.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPermissionsForRoles } from '../../middleware/auth.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './dto/auth.dto.js';

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  tokenType: 'Bearer';
}

export interface AuthResult {
  user: UserProfile;
  tokens: AuthTokens;
}

/** Self-registration is limited to non-staff roles to prevent privilege escalation. */
const PUBLIC_REGISTRATION_ROLES: UserRoleType[] = ['PARENT', 'STUDENT'];

export function toUserProfile(user: UserWithRoles): UserProfile {
  const roles = user.roles.map((assignment) => assignment.role.name as UserRoleType);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    middleName: user.middleName ?? undefined,
    lastName: user.lastName,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    schoolId: user.schoolId ?? '',
    roles,
    permissions: getPermissionsForRoles(roles),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function sessionTokens(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number | null;
}): AuthTokens {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? undefined,
    tokenType: 'Bearer',
  };
}

async function loadUserBySupabaseId(supabaseUserId: string): Promise<UserWithRoles | null> {
  return prisma.user.findFirst({
    where: { supabaseUserId },
    include: { roles: { include: { role: true } } },
  });
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (error || !data.user || !data.session) {
    throw new AppError(401, 'Invalid email or password');
  }

  let user = await loadUserBySupabaseId(data.user.id);
  if (!user) {
    user = await prisma.user.findFirst({
      where: { email: input.email.trim().toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
  }

  if (!user) {
    throw new AppError(403, 'This account is not provisioned for the school portal');
  }

  if (!user.isActive) {
    throw new AppError(403, 'This account has been disabled');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      supabaseUserId: data.user.id,
      lastLoginAt: new Date(),
    },
  });

  return {
    user: toUserProfile({ ...user, supabaseUserId: data.user.id }),
    tokens: sessionTokens(data.session),
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const roleName = (input.role ?? 'PARENT') as UserRoleType;

  if (!PUBLIC_REGISTRATION_ROLES.includes(roleName)) {
    throw new AppError(403, 'Public registration is limited to parent and student accounts');
  }

  if (!input.schoolId) {
    throw new AppError(400, 'A school must be selected during registration');
  }

  const school = await prisma.school.findFirst({
    where: { id: input.schoolId, isActive: true, deletedAt: null },
  });
  if (!school) {
    throw new AppError(404, 'School not found');
  }

  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      firstName: input.firstName,
      lastName: input.lastName,
      schoolId: input.schoolId,
    },
  });

  if (error || !data.user) {
    throw new AppError(400, error?.message ?? 'Could not create the account');
  }

  try {
    const role = await prisma.role.findUnique({ where: { name: roleName } });

    const user = await prisma.user.create({
      data: {
        schoolId: input.schoolId,
        campusId: input.campusId,
        supabaseUserId: data.user.id,
        email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        isEmailVerified: true,
        roles: role ? { create: { roleId: role.id } } : undefined,
      },
      include: { roles: { include: { role: true } } },
    });

    const signIn = await supabase.auth.signInWithPassword({ email, password: input.password });
    if (signIn.error || !signIn.data.session) {
      return {
        user: toUserProfile(user),
        tokens: { accessToken: '', refreshToken: '', tokenType: 'Bearer' },
      };
    }

    return {
      user: toUserProfile(user),
      tokens: sessionTokens(signIn.data.session),
    };
  } catch (error) {
    // Never leave an orphaned Supabase auth user behind.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
    throw error;
  }
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    throw new AppError(401, 'Your session has expired. Please sign in again.');
  }
  return sessionTokens(data.session);
}

export async function logout(accessToken: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) {
    // Local JWTs are stateless; an already-expired Supabase session is fine.
    const { data } = await supabaseAdmin.auth.getUser(accessToken);
    if (data.user) {
      throw new AppError(502, 'Could not end the session');
    }
  }
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  // Always resolve successfully so the endpoint cannot be used to enumerate emails.
  await supabase.auth.resetPasswordForEmail(input.email.trim().toLowerCase(), {
    redirectTo: `${config.frontendUrl}/reset-password`,
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const { data, error } = await supabaseAdmin.auth.getUser(input.token);
  if (error || !data.user) {
    throw new AppError(400, 'This reset link is invalid or has expired');
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
    password: input.password,
  });
  if (updateError) {
    throw new AppError(400, updateError.message);
  }
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return toUserProfile(user);
}

export interface UpdateProfileInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    },
    include: { roles: { include: { role: true } } },
  });
  return toUserProfile(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.supabaseUserId) {
    throw new AppError(404, 'User not found');
  }

  const signIn = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signIn.error) {
    throw new AppError(401, 'Current password is incorrect');
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseUserId, {
    password: newPassword,
  });
  if (error) {
    throw new AppError(400, error.message);
  }
}

export { ROLE_PERMISSIONS };
