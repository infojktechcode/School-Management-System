import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RequirePermission } from '@/routes/guards';
import { AuthContext, type AuthContextValue } from '@/providers/AuthProvider';
import { testUser } from '../fixtures';

function renderGuarded(permission: 'student:read' | 'finance:manage', user = testUser()) {
  const value: AuthContextValue = {
    user,
    isLoading: false,
    isAuthenticated: true,
    login: async () => user,
    logout: async () => undefined,
    refreshProfile: async () => undefined,
  };

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <RequirePermission permission={permission}>
          <div>Protected content</div>
        </RequirePermission>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('RequirePermission', () => {
  it('renders children when the permission is held', () => {
    renderGuarded('student:read');
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('shows an access denied panel without the permission', () => {
    renderGuarded('finance:manage');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.getByText('finance:manage')).toBeInTheDocument();
  });

  it('lets super admins through every route', () => {
    renderGuarded('finance:manage', testUser({ roles: ['SUPER_ADMIN'], permissions: [] }));
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
