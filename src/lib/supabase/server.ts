import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://duujhipnbythezqtmdbk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_eyt1FI5cXiT0oF-DKPQ_Qw_-DbWkiif';

export function getSupabaseServerConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes('your-project-url') &&
    !key.includes('your-anon-key')
  );

  return { url, key, isConfigured };
}

export function getSupabaseServerDiagnostic() {
  const { url, key, isConfigured } = getSupabaseServerConfig();
  return {
    isConfigured,
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    usingDefaultUrl: !process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL,
    usingDefaultKey: !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_PUBLISHABLE_KEY,
    missingEnvVars: [
      !process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_PUBLISHABLE_KEY ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean) as string[],
  };
}

export const isServerSupabaseConfigured = true;

export async function createSupabaseServerClient() {
  const { url, key, isConfigured } = getSupabaseServerConfig();
  if (!isConfigured || !url || !key) {
    console.error('[Supabase Server] Client initialization failed. Diagnostic:', getSupabaseServerDiagnostic());
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can happen in Server Components, handled by middleware
        }
      },
    },
  });
}

// Backward compatible getter for existing API handlers
export async function getSupabaseServerClient() {
  return createSupabaseServerClient();
}
