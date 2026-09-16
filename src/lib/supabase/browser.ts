import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getPublicSupabaseEnv } from '@/config/env';
import type { Database } from '../../../database.types';

let supabase: SupabaseClient<Database> | undefined;

function getSupabase() {
  if (!supabase) {
    const environment = getPublicSupabaseEnv();
    supabase = createClient<Database>(
      environment.NEXT_PUBLIC_SUPABASE_URL,
      environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

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

export async function getAllViewCounts(): Promise<Record<string, number>> {
  const { data, error } = await getSupabase()
    .from('views')
    .select('slug, view_count');

  if (error) {
    throw new Error('Unable to load view counts.');
  }

  return (data ?? []).reduce<Record<string, number>>((counts, row) => {
    counts[row.slug] = row.view_count;
    return counts;
  }, {});
}
