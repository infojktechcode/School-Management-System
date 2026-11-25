import { formatDistanceToNow } from 'date-fns';
import { Bell, CreditCard, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatKes } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/types/dashboard';

const ICONS: Record<ActivityItem['type'], typeof Bell> = {
  payment: CreditCard,
  student: UserPlus,
  announcement: Bell,
};

const TONES: Record<ActivityItem['type'], string> = {
  payment: 'bg-emerald-50 text-emerald-600',
  student: 'bg-primary/10 text-primary',
  announcement: 'bg-amber-50 text-amber-600',
};

export function RecentActivity({
  items,
  isLoading,
}: {
  items: ActivityItem[];
  isLoading: boolean;
}): JSX.Element {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Payments, admissions and announcements.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nothing has happened yet.</p>
        ) : (
          items.map((item) => {
            const Icon = ICONS[item.type];
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-lg px-1 py-2 hover:bg-muted/50">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TONES[item.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    {item.amount ? (
                      <span className="shrink-0 text-sm font-semibold text-emerald-600">
                        {formatKes(item.amount)}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
