import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://duujhipnbythezqtmdbk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_eyt1FI5cXiT0oF-DKPQ_Qw_-DbWkiif';

export function getAdminSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url &&
    secretKey &&
    !url.includes('your-project-url') &&
    !secretKey.includes('your-secret-key') &&
    !secretKey.includes('your-service-role-key')
  );

  return { url, secretKey, isConfigured };
}

export const isSupabaseAdminConfigured = true;

let cachedAdminClient: any = null;

export function getSupabaseAdminClient() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const { url, secretKey } = getAdminSupabaseConfig();
  const effectiveKey = secretKey || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !effectiveKey) {
    return null;
  }

  try {
    cachedAdminClient = createClient<Database>(url, effectiveKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedAdminClient;
  } catch (err) {
    console.error('[Supabase Admin] Client initialization failed:', err);
    return null;
  }
}
