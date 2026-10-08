import type { ArticleSummary } from '@/components/ui/ArticleRow';

type SearchablePost = Pick<ArticleSummary, 'title' | 'description' | 'tag'>;

export const archiveTopics = [
  { key: 'all', label: '전체' },
  { key: 'react', label: 'React' },
  { key: 'nextJs', label: 'Next.js' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'typescript', label: 'TypeScript' },
] as const;

const isNextJs = (tag: string) => tag.toLowerCase() === 'nextjs';

export function normalizeArchiveTag(
  key: string | null | undefined,
  availableTags: readonly string[],
): string {
  const candidate = key?.trim();
  if (!candidate || candidate === 'all') return 'all';
  if (isNextJs(candidate) && availableTags.some(isNextJs)) return 'nextJs';

  return (
    availableTags.find(tag => tag === candidate) ??
    availableTags.find(tag => tag.toLowerCase() === candidate.toLowerCase()) ??
    'all'
  );
}

export function matchesArchiveTag(
  post: SearchablePost,
  topic: string,
): boolean {
  if (topic === 'all') return true;
  if (isNextJs(topic)) return post.tag.some(isNextJs);
  return post.tag.includes(topic);
}

export function filterArchivePosts<T extends SearchablePost>(
  posts: readonly T[],
  topic: string,
  query: string,
): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('ko');

  return posts.filter(post => {
    if (!matchesArchiveTag(post, topic)) return false;
    if (!normalizedQuery) return true;

    return [post.title, post.description, ...post.tag]
      .join(' ')
      .toLocaleLowerCase('ko')
      .includes(normalizedQuery);
  });
}
