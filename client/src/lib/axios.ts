import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getSelectedSchoolId,
  setTokens,
} from './authStorage';
import type { AuthTokens } from '@/types/auth';

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const schoolId = getSelectedSchoolId();
  if (schoolId) {
    config.headers['x-school-id'] = schoolId;
  }

  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<{ data: { tokens: AuthTokens } }>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
    );
    const tokens = response.data.data.tokens;
    setTokens(tokens);
    return tokens.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry && getRefreshToken()) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken();
      const token = await refreshPromise;
      refreshPromise = null;

      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }

    if (error.response?.status === 401) {
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject(error);
  },
);

export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string; errors?: Record<string, string[]> };
    if (payload?.errors) {
      const first = Object.values(payload.errors)[0]?.[0];
      if (first) return first;
    }
    return payload?.message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
