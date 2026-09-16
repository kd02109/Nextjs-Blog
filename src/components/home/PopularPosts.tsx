'use client';

import HomePostList, { type HomePost } from './HomePostList';
import { getAllViewCounts } from '@/lib/supabase/browser';
import rankPostsByViews from '@/util/rankPostsByViews';
import { useEffect, useMemo, useState } from 'react';

export default function PopularPosts({ posts }: { posts: HomePost[] }) {
  const [viewCounts, setViewCounts] = useState<Record<string, number> | null>(
    null,
  );

  useEffect(() => {
    getAllViewCounts()
      .then(setViewCounts)
      .catch(() => setViewCounts(null));
  }, []);

  const popularPosts = useMemo(
    () => rankPostsByViews(posts, viewCounts ?? {}, 4),
    [posts, viewCounts],
  );

  return (
    <HomePostList
      posts={popularPosts}
      viewCounts={viewCounts ?? undefined}
      ranked
    />
  );
}
