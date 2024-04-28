import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Database } from 'database.types';

export const supabase: SupabaseClient<Database> = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const supabaseIncrement = async (slug: string) => {
  const obj = await supabase.rpc('increment_view', { slug_text: slug });
};

export const supabaseViewCount = async (slug: string) => {
  const { data: views, error: viewsError } = await supabase
    .from('views')
    .select(`view_count`)
    .match({ slug: slug })
    .single();

  if (viewsError && viewsError.details.includes(`0 rows`)) {
    const { data, error } = await supabase
      .from('views')
      .upsert({ slug: slug as string, view_count: 0 }, { onConflict: 'slug' })
      .select('view_count')
      .single();
    if (data?.view_count) return data.view_count;
  }
  if (!views) {
    return 0;
  }
  return views.view_count;
};
