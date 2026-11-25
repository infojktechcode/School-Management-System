import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '@/api/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30_000,
    refetchInterval: 2 * 60_000,
  });
}
