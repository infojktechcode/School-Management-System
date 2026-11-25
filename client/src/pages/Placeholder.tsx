import { Construction } from 'lucide-react';

export function Placeholder({ title }: { title: string }): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-dashed bg-card p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Construction className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-navy-900">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This workspace is wired into navigation and permissions. Its Phase 2 screens will land
        here.
      </p>
    </div>
  );
}
