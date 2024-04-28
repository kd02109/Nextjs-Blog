'use client';

import { supabaseViewCount } from '@/util/supabase';
import { useEffect, useState } from 'react';

export default function useSupabaseCount(slug: string) {
  const [view, setView] = useState<number | null>(null);

  useEffect(() => {
    supabaseViewCount(slug).then(data => setView(data));
  }, [slug]);
  return view;
}
