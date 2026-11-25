import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Permission } from '@school-mgmt/shared';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { FullPageLoader } from '@/components/FullPageLoader';

export function RequireAuth({ children }: { children: ReactNode }): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader label="Checking your session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}): JSX.Element {
  const { can, isSuperAdmin } = usePermissions();

  if (isSuperAdmin || can(permission)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-navy-900">Access denied</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your role does not include the <code className="rounded bg-muted px-1">{permission}</code>{' '}
        permission. Contact a school administrator if you believe this is a mistake.
      </p>
    </div>
  );
}
