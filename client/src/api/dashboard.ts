import { api, unwrap } from '@/lib/axios';
import type { DashboardPayload } from '@/types/dashboard';

export async function fetchDashboard(): Promise<DashboardPayload> {
  return unwrap<DashboardPayload>(await api.get('/dashboard'));
}
