import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '@/lib/axios';
import { getSelectedSchoolId, setSelectedSchoolId } from '@/lib/authStorage';
import { useAuth } from './useAuth';

export interface SchoolOption {
  id: string;
  name: string;
  code: string;
}

export interface SchoolContextValue {
  schoolId: string | null;
  school: SchoolOption | null;
  schools: SchoolOption[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  selectSchool: (schoolId: string) => void;
}

export function useSchool(): SchoolContextValue {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const [schoolId, setSchoolId] = useState<string | null>(
    () => getSelectedSchoolId() ?? user?.schoolId ?? null,
  );

  useEffect(() => {
    if (user?.schoolId) {
      setSchoolId(user.schoolId);
    }
  }, [user?.schoolId]);

  const schoolsQuery = useQuery({
    queryKey: ['public-schools'],
    queryFn: async () => unwrap<SchoolOption[]>(await api.get('/schools/public')),
    enabled: isSuperAdmin,
  });

  const schools = schoolsQuery.data ?? [];

  useEffect(() => {
    if (isSuperAdmin && !schoolId && schools.length > 0) {
      const first = schools[0]!;
      setSelectedSchoolId(first.id);
      setSchoolId(first.id);
    }
  }, [isSuperAdmin, schoolId, schools]);

  const currentQuery = useQuery({
    queryKey: ['current-school', schoolId],
    queryFn: async () => unwrap<SchoolOption>(await api.get('/schools/current')),
    enabled: Boolean(schoolId),
  });

  const selectSchool = useCallback(
    (nextSchoolId: string) => {
      setSelectedSchoolId(nextSchoolId);
      setSchoolId(nextSchoolId);
      void queryClient.invalidateQueries();
    },
    [queryClient],
  );

  return useMemo(
    () => ({
      schoolId,
      school: currentQuery.data ?? schools.find((option) => option.id === schoolId) ?? null,
      schools,
      isSuperAdmin,
      isLoading: schoolsQuery.isLoading || currentQuery.isLoading,
      selectSchool,
    }),
    [
      schoolId,
      currentQuery.data,
      schools,
      isSuperAdmin,
      schoolsQuery.isLoading,
      currentQuery.isLoading,
      selectSchool,
    ],
  );
}
