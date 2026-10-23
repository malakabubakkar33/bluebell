import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
  supabaseSecretKey &&
  !supabaseUrl.includes('your-project-url') &&
  !supabaseSecretKey.includes('your-secret-key') &&
  !supabaseSecretKey.includes('your-service-role-key')
);

export function getSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
