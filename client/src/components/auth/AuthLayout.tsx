import type { ReactNode } from 'react';
import { GraduationCap, ShieldCheck, Wallet, Users } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Users, title: 'Every learner accounted for', body: 'Admissions, class lists and attendance in one place.' },
  { icon: Wallet, title: 'Fee collection you can trust', body: 'Invoices, M-Pesa reconciliation and balances live.' },
  { icon: ShieldCheck, title: 'Role-based by design', body: 'Teachers, bursars and parents each see only their work.' },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}): JSX.Element {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-10 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 25%, #14b8a6 0, transparent 45%), radial-gradient(circle at 80% 10%, #1d4ed8 0, transparent 40%), radial-gradient(circle at 60% 90%, #0f766e 0, transparent 45%)',
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <GraduationCap className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">School Management System</p>
              <p className="text-xs text-slate-400">Built for Kenyan schools</p>
            </div>
          </div>

          <h1 className="mt-16 max-w-md text-4xl font-semibold leading-tight">
            One calm place to run the whole school day.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            From the first bell to the last fee receipt — admissions, academics, attendance,
            examinations and finance stay in step.
          </p>
        </div>

        <ul className="relative mt-12 space-y-5">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="flex gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <item.icon className="h-4 w-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-400">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="relative text-xs text-slate-500">
          Nairobi · KES · Africa/Nairobi · DD/MM/YYYY
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900">
              <GraduationCap className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">School Management</p>
              <p className="text-xs text-muted-foreground">Built for Kenyan schools</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-navy-900">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </section>
    </div>
  );
}
