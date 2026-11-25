import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

/** Browser-safe client: respects row level security. */
export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Service-role client. Bypasses RLS, so it must never be exposed to the
 * client bundle or returned from an API response.
 */
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
