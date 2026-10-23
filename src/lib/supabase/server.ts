import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-url') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export async function createSupabaseServerClient() {
  if (!isServerSupabaseConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
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
    }
  );
}

// Backward compatible getter for existing API handlers
export async function getSupabaseServerClient() {
  return createSupabaseServerClient();
}
