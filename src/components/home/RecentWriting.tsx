'use client';

import { useState } from 'react';

import HomePostList, { type HomePost } from './HomePostList';

const filters = [
  { label: '전체', key: 'all' },
  { label: 'React', key: 'react' },
  { label: 'Next.js', key: 'nextJs' },
] as const;

type FilterKey = (typeof filters)[number]['key'];

export default function RecentWriting({ posts }: { posts: HomePost[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const visiblePosts =
    activeFilter === 'all'
      ? posts
      : posts.filter(post => post.tag.includes(activeFilter));

  return (
    <>
      <div className="home-filters" role="group" aria-label="글 주제 필터">
        {filters.map(filter => (
          <button
            key={filter.key}
            type="button"
            aria-pressed={activeFilter === filter.key}
            onClick={() => setActiveFilter(filter.key)}>
            {filter.label}
          </button>
        ))}
      </div>
      <HomePostList posts={visiblePosts} ariaLabel="최근 글" />
      <p className="home-article-count" aria-live="polite">
        {visiblePosts.length}개의 기록
      </p>
    </>
  );
}
