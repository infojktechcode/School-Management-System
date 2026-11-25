import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: number; label: string };
  icon: LucideIcon;
  tone?: 'primary' | 'teal' | 'amber' | 'rose';
}

const TONES: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  teal: 'bg-teal-500/10 text-teal-600',
  amber: 'bg-amber-500/10 text-amber-600',
  rose: 'bg-rose-500/10 text-rose-600',
};

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  tone = 'primary',
}: StatCardProps): JSX.Element {
  const positive = (trend?.value ?? 0) >= 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-navy-900">{value}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {trend ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  positive ? 'stat-trend-up' : 'stat-trend-down',
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            ) : null}
            {trend ? <span className="text-muted-foreground">{trend.label}</span> : null}
            {hint ? <span className="text-muted-foreground">{hint}</span> : null}
          </div>
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton(): JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="w-full space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </CardContent>
    </Card>
  );
}
