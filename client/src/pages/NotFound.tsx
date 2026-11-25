import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Compass className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you are looking for may have moved, or the link may be out of date.
      </p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
