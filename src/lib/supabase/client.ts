import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://duujhipnbythezqtmdbk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_eyt1FI5cXiT0oF-DKPQ_Qw_-DbWkiif';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-url') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

