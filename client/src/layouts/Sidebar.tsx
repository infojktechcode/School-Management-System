import { NavLink } from 'react-router-dom';
import { GraduationCap, X } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { useSchool } from '@/hooks/useSchool';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps): JSX.Element {
  const { user } = useAuth();
  const { can, isSuperAdmin } = usePermissions();
  const { school } = useSchool();

  const items = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    if (isSuperAdmin) return true;
    return can(item.permission);
  });

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-navy-900/60 backdrop-blur-sm lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy-900 text-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <GraduationCap className="h-6 w-6 text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{school?.name ?? 'School Portal'}</p>
              <p className="text-xs text-slate-400">{school?.code ?? 'School Management'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Main menu
          </p>
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'sidebar-link-active')
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.roles[0]?.replaceAll('_', ' ')}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
