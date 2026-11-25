import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('fails loudly outside the provider', () => {
    // React logs the expected render error; keep the test output readable.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);

    consoleError.mockRestore();
  });
});
