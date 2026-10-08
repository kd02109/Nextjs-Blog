import { describe, expect, it } from 'vitest';

import { getAllTags } from '@/lib/content';
import getPosts from '@/util/getPosts';

const loadArchive = async () => {
  const archive = await import('./archive').catch(() => null);
  expect(archive, 'the shared archive module should exist').not.toBeNull();
  return archive!;
};

describe('shared writing archive', () => {
  it('keeps the blog archive at 41 articles and the topic archive at all 73 records', () => {
    expect(getPosts('blog')).toHaveLength(41);
    expect(getPosts()).toHaveLength(73);
  });

  it('matches every tag on a record, including a secondary tag', async () => {
    const { filterArchivePosts } = await loadArchive();
    const results = filterArchivePosts(getPosts(), 'typescript', 'React');

    expect(results.map(post => post.url)).toEqual([
      'blog/react/react-type-detail',
    ]);
  });

  it('intersects the selected topic with a case-insensitive description search', async () => {
    const { filterArchivePosts } = await loadArchive();
    const results = filterArchivePosts(getPosts('blog'), 'react', ' 원리 ');

    expect(results.map(post => post.url)).toEqual([
      'blog/react/optimistic-updates',
      'blog/js/o-auth',
    ]);
    expect(results).toHaveLength(2);
  });

  it('returns no results when a topic and search have no intersection', async () => {
    const { filterArchivePosts } = await loadArchive();
    expect(
      filterArchivePosts(getPosts('blog'), 'react', '해당 글은 없습니다'),
    ).toHaveLength(0);
  });

  it('keeps legacy tags and falls back only for absent URL keys', async () => {
    const { normalizeArchiveTag } = await loadArchive();
    const availableTags = Object.keys(getAllTags());

    expect(normalizeArchiveTag('react-hook-form', availableTags)).toBe(
      'react-hook-form',
    );
    expect(normalizeArchiveTag('not-a-real-tag', availableTags)).toBe('all');
  });

  it('treats both stored Next.js spellings as one topic', async () => {
    const { filterArchivePosts, normalizeArchiveTag } = await loadArchive();
    const availableTags = Object.keys(getAllTags());
    const key = normalizeArchiveTag('nextjs', availableTags);

    expect(key).toBe('nextJs');
    expect(filterArchivePosts(getPosts(), key, '')).toHaveLength(29);
  });
});
