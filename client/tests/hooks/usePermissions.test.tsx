import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { AuthContext, type AuthContextValue } from '@/providers/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { testUser } from '../fixtures';

function wrapper(value: AuthContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
}

function contextFor(user: AuthContextValue['user']): AuthContextValue {
  return {
    user,
    isLoading: false,
    isAuthenticated: Boolean(user),
    login: async () => testUser(),
    logout: async () => undefined,
    refreshProfile: async () => undefined,
  };
}

describe('usePermissions', () => {
  it('checks permissions and roles from the profile', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(contextFor(testUser())),
    });

    expect(result.current.can('student:read')).toBe(true);
    expect(result.current.can('finance:manage')).toBe(false);
    expect(result.current.canAny(['finance:manage', 'finance:read'])).toBe(true);
    expect(result.current.hasRole('SCHOOL_ADMIN')).toBe(true);
    expect(result.current.hasRole('BURSAR')).toBe(false);
    expect(result.current.isSuperAdmin).toBe(false);
  });

  it('flags super admins', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(
        contextFor(
          testUser({ roles: ['SUPER_ADMIN'], permissions: [] }),
        ),
      ),
    });

    expect(result.current.isSuperAdmin).toBe(true);
  });

  it('returns empty permissions when signed out', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(contextFor(null)),
    });

    expect(result.current.can('student:read')).toBe(false);
    expect(result.current.roles).toEqual([]);
  });
});
