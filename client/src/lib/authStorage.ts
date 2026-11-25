import type { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'sms.accessToken';
const REFRESH_TOKEN_KEY = 'sms.refreshToken';
const SCHOOL_KEY = 'sms.schoolId';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getSelectedSchoolId(): string | null {
  return localStorage.getItem(SCHOOL_KEY);
}

export function setSelectedSchoolId(schoolId: string | null): void {
  if (schoolId) localStorage.setItem(SCHOOL_KEY, schoolId);
  else localStorage.removeItem(SCHOOL_KEY);
}
