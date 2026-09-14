import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../database.types';

let supabase: SupabaseClient<Database> | undefined;

function getSupabase() {
  supabase ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return supabase;
}

export async function getViewCount(slug: string): Promise<number> {
  const { data, error } = await getSupabase()
    .from('views')
    .select('view_count')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error('Unable to load view count.');
  }

  return data?.view_count ?? 0;
}
