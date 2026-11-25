import { useMemo } from 'react';
import type { Permission, UserRoleType } from '@school-mgmt/shared';
import { useAuth } from './useAuth';

export interface PermissionHelpers {
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  hasRole: (...roles: UserRoleType[]) => boolean;
  isSuperAdmin: boolean;
  roles: UserRoleType[];
  permissions: string[];
}

export function usePermissions(): PermissionHelpers {
  const { user } = useAuth();

  return useMemo<PermissionHelpers>(() => {
    const permissions = user?.permissions ?? [];
    const roles = user?.roles ?? [];

    return {
      can: (permission) => permissions.includes(permission),
      canAny: (required) => required.some((permission) => permissions.includes(permission)),
      hasRole: (...required) => required.some((role) => roles.includes(role)),
      isSuperAdmin: roles.includes('SUPER_ADMIN'),
      roles,
      permissions,
    };
  }, [user]);
}
