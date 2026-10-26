import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function getAdminSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    '';

  const isConfigured = Boolean(
    url &&
    secretKey &&
    !url.includes('your-project-url') &&
    !secretKey.includes('your-secret-key') &&
    !secretKey.includes('your-service-role-key')
  );

  return { url, secretKey, isConfigured };
}

export const isSupabaseAdminConfigured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
);

export function getSupabaseAdminClient() {
  const { url, secretKey, isConfigured } = getAdminSupabaseConfig();
  if (!isConfigured || !url || !secretKey) {
    return null;
  }

  return createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
