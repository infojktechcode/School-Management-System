import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from '@/lib/axios';

export interface PublicSchool {
  id: string;
  name: string;
  code: string;
}

export function usePublicSchools(): { schools: PublicSchool[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['public-schools'],
    queryFn: async () => unwrap<PublicSchool[]>(await api.get('/schools/public')),
    staleTime: 10 * 60_000,
  });

  return { schools: query.data ?? [], isLoading: query.isLoading };
}
