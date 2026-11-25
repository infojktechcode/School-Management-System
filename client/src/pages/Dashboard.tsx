import { CalendarCheck, GraduationCap, RefreshCw, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard, StatCardSkeleton } from '@/components/dashboard/StatCard';
import { EnrollmentChart, FeeTrendChart } from '@/components/dashboard/Charts';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/hooks/useAuth';
import { useSchool } from '@/hooks/useSchool';
import { formatKes, formatNumber } from '@/lib/format';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard(): JSX.Element {
  const { user } = useAuth();
  const { school } = useSchool();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardStats();

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">
            {greeting()}, {user?.firstName ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is how {school?.name ?? 'your school'} is doing today.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          Refresh
        </Button>
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Could not load the dashboard.'}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !stats ? (
          Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Active students"
              value={formatNumber(stats.totalStudents)}
              hint={`${formatNumber(stats.pendingInvoices)} invoices open`}
              icon={Users}
              tone="primary"
            />
            <StatCard
              label="Staff on duty"
              value={formatNumber(stats.totalStaff)}
              hint={`${formatNumber(stats.totalTeachers)} teachers`}
              icon={GraduationCap}
              tone="teal"
            />
            <StatCard
              label="Fees collected"
              value={formatKes(stats.feeCollection.collected)}
              trend={{ value: stats.feeCollection.collectionRate, label: 'of invoiced' }}
              icon={Wallet}
              tone="amber"
            />
            <StatCard
              label="Attendance today"
              value={stats.attendance.total > 0 ? `${stats.attendance.rate}%` : '—'}
              hint={
                stats.attendance.total > 0
                  ? `${formatNumber(stats.attendance.present)} present · ${formatNumber(stats.attendance.absent)} away`
                  : 'No register marked yet'
              }
              icon={CalendarCheck}
              tone="rose"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnrollmentChart data={data?.enrollmentByClass ?? []} isLoading={isLoading} />
        <FeeTrendChart data={data?.feeTrend ?? []} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <RecentActivity items={data?.recentActivity ?? []} isLoading={isLoading} />
        <div className="space-y-4">
          <QuickActions />
          {stats ? (
            <div className="rounded-xl border bg-navy-900 p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-slate-400">Outstanding fees</p>
              <p className="mt-2 text-2xl font-semibold">{formatKes(stats.feeCollection.outstanding)}</p>
              <p className="mt-1 text-xs text-slate-400">
                {formatKes(stats.feeCollection.invoiced)} invoiced this year ·{' '}
                {stats.feeCollection.collectionRate}% collected
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
