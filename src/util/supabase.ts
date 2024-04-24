import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Database } from 'database.types';

export const supabase: SupabaseClient<Database> = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
