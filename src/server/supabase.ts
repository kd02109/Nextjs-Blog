import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

export async function incrementView(
  slug: string,
  visitorHash: string,
): Promise<number> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
