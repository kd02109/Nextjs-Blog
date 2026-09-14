'use client';

import { getViewCount } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';

export default function useSupabaseCount(slug: string) {
  const [view, setView] = useState<number | null>(null);

  useEffect(() => {
    getViewCount(slug)
      .then(data => setView(data))
      .catch(() => setView(0));
  }, [slug]);
  return view;
}
