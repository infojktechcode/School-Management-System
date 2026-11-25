import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, Receipt, UserPlus, Users, Wallet } from 'lucide-react';
import type { Permission } from '@school-mgmt/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';

const ACTIONS: Array<{
  label: string;
  description: string;
  href: string;
  icon: typeof Users;
  permission?: Permission;
}> = [
  { label: 'Add a student', description: 'Admit and enrol a learner', href: '/students', icon: UserPlus, permission: 'student:create' },
  { label: 'Mark attendance', description: "Today's class registers", href: '/attendance', icon: CalendarCheck, permission: 'attendance:record' },
  { label: 'Record a payment', description: 'Capture fees received', href: '/finance', icon: Wallet, permission: 'finance:manage' },
  { label: 'Create an invoice', description: 'Bill a term of fees', href: '/finance', icon: Receipt, permission: 'finance:manage' },
  { label: 'Enter marks', description: 'Record exam results', href: '/examinations', icon: BookOpen, permission: 'marks:entry' },
];

export function QuickActions(): JSX.Element {
  const { can, isSuperAdmin } = usePermissions();
  const actions = ACTIONS.filter((action) => !action.permission || isSuperAdmin || can(action.permission));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Shortcuts based on your role.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {actions.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground sm:col-span-2">
            Your role does not have any day-to-day actions yet.
          </p>
        ) : (
          actions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              to={action.href}
              className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <action.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="truncate text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
