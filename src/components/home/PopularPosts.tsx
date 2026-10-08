'use client';

import HomePostList, { type HomePost } from './HomePostList';
import { getAllViewCounts } from '@/lib/supabase/browser';
import rankPostsByViews from '@/util/rankPostsByViews';
import { useEffect, useMemo, useState } from 'react';

export default function PopularPosts({ posts }: { posts: HomePost[] }) {
  const [viewCounts, setViewCounts] = useState<Record<string, number> | null>(
    null,
  );
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    getAllViewCounts()
      .then(setViewCounts)
      .catch(() => {
        setViewCounts(null);
        setLoadFailed(true);
      });
  }, []);

  const popularPosts = useMemo(
    () => rankPostsByViews(posts, viewCounts ?? {}, 4),
    [posts, viewCounts],
  );

  return (
    <>
      {loadFailed && (
        <p className="home-popular-status" role="status">
          조회수 정보를 불러오지 못해 최신 글 순서로 보여드립니다.
        </p>
      )}
      <HomePostList
        posts={popularPosts}
        ariaLabel="인기 글"
        viewCounts={viewCounts ?? undefined}
        ranked
      />
    </>
  );
}
