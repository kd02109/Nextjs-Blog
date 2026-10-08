'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import ArticleRow, {
  getArticleHref,
  type ArticleSummary,
} from '@/components/ui/ArticleRow';

import ArchiveControls from './ArchiveControls';
import { filterArchivePosts, normalizeArchiveTag } from './archive';

type ArchiveViewProps = {
  posts: ArticleSummary[];
  initialTag?: string;
  scope: 'blog' | 'all';
  featured?: boolean;
};

export default function ArchiveView({
  posts,
  initialTag = 'all',
  scope,
  featured = false,
}: ArchiveViewProps) {
  const [topic, setTopic] = useState(initialTag);
  const [query, setQuery] = useState('');
  const availableTags = useMemo(
    () => [...new Set(posts.flatMap(post => post.tag))],
    [posts],
  );
  const filteredPosts = useMemo(
    () => filterArchivePosts(posts, topic, query),
    [posts, topic, query],
  );
  const featuredPost =
    featured && topic === 'all' && query.trim() === '' ? posts[0] : undefined;
  const listedPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  useEffect(() => {
    if (scope !== 'all') return;

    const syncFromUrl = () => {
      const urlKey = new URLSearchParams(window.location.search).get('key');
      setTopic(normalizeArchiveTag(urlKey, availableTags));
    };

    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [availableTags, scope]);

  const handleTopicChange = (nextTopic: string) => {
    setTopic(nextTopic);
    if (scope !== 'all') return;

    const url = new URL(window.location.href);
    if (nextTopic === 'all') url.searchParams.delete('key');
    else url.searchParams.set('key', nextTopic);
    window.history.pushState(
      null,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  };

  return (
    <>
      <ArchiveControls
        topic={topic}
        query={query}
        scope={scope}
        onTopicChange={handleTopicChange}
        onQueryChange={setQuery}
      />
      <div className="archive-meta">
        <span aria-live="polite">{filteredPosts.length}개의 기록</span>
        <span>NEWEST FIRST ↓</span>
      </div>
      {featuredPost && (
        <article
          className="archive-feature"
          aria-label={`대표 글 ${featuredPost.title}`}>
          <div className="archive-feature-copy">
            <span>EDITOR&apos;S PICK / {featuredPost.tag[0] ?? 'WRITING'}</span>
            <h3>{featuredPost.title}</h3>
            <p>{featuredPost.description}</p>
            <Link href={getArticleHref(featuredPost)}>대표 글 읽기 ↗</Link>
          </div>
          <div className="archive-feature-art" aria-hidden="true">
            <span>
              {featuredPost.title
                .split(/\s+/)
                .slice(0, 3)
                .map(word => word.charAt(0).toUpperCase())
                .join('')}
              .
            </span>
          </div>
        </article>
      )}
      <ol
        className="ui-article-list"
        aria-label={scope === 'blog' ? '글 목록' : '주제별 기록'}>
        {listedPosts.map(post => (
          <ArticleRow key={post.id} post={post} />
        ))}
      </ol>
      {filteredPosts.length === 0 && (
        <div className="archive-empty" role="status">
          <strong>검색 결과가 없습니다.</strong>
          <p>다른 주제를 고르거나 검색어를 바꿔 보세요.</p>
        </div>
      )}
      <div className="archive-bottom">
        <p>글과 프로젝트 기록은 최신 발행일 순서로 정렬됩니다.</p>
        <Link href={scope === 'blog' ? '/tags' : '/blog'}>
          {scope === 'blog' ? '주제별 모아보기' : '블로그 글만 보기'} ↗
        </Link>
      </div>
    </>
  );
}
