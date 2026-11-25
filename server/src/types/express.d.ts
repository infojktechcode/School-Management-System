import type { UserRoleType } from '@school-mgmt/shared';

export interface AuthenticatedUser {
  id: string;
  supabaseUserId?: string;
  email?: string;
  schoolId?: string;
  campusId?: string;
  roles: UserRoleType[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      schoolId?: string;
      requestId?: string;
    }
  }
}

export {};
