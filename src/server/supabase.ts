import 'server-only';

import { getViewMutationEnv } from '@/config/env';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

export async function incrementView(
  slug: string,
  visitorHash: string,
): Promise<number> {
  const environment = getViewMutationEnv();
  const supabase = createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  const { data, error } = await supabase.rpc('increment_view', {
    slug_text: slug,
    visitor_hash_text: visitorHash,
  });

  if (error || typeof data !== 'number') {
    throw new Error('Unable to increment view.');
  }

  return data;
}
