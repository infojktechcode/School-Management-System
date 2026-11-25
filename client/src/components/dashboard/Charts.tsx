import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatKes, formatNumber } from '@/lib/format';
import type { EnrollmentPoint, FeeTrendPoint } from '@/types/dashboard';

const BAR_COLORS = ['#1d4ed8', '#0d9488', '#15306b', '#0f766e', '#60a5fa', '#14b8a6'];

export function EnrollmentChart({
  data,
  isLoading,
}: {
  data: EnrollmentPoint[];
  isLoading: boolean;
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment by class</CardTitle>
        <CardDescription>Active learners per class level this term.</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <EmptyChart label="No enrolled students yet" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="classLevel" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), 'Students']}
                contentStyle={{ borderRadius: 10, borderColor: '#e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="students" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((entry, index) => (
                  <Cell key={entry.classLevel} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function FeeTrendChart({
  data,
  isLoading,
}: {
  data: FeeTrendPoint[];
  isLoading: boolean;
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee collection trend</CardTitle>
        <CardDescription>Invoiced versus collected over the last six months.</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <EmptyChart label="No fee activity yet" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="invoicedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatKes(value), name]}
                contentStyle={{ borderRadius: 10, borderColor: '#e2e8f0', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="invoiced"
                name="Invoiced"
                stroke="#1d4ed8"
                strokeWidth={2}
                fill="url(#invoicedFill)"
              />
              <Area
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke="#0d9488"
                strokeWidth={2}
                fill="url(#collectedFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChart({ label }: { label: string }): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      {label}
    </div>
  );
}
