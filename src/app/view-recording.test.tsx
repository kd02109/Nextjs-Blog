import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { createViewVisitorHash, incrementView } = vi.hoisted(() => ({
  createViewVisitorHash: vi.fn(),
  incrementView: vi.fn(),
}));

vi.mock('@/components/DetailPage', () => ({
  default: ({ post }: { post: { title: string } }) => (
    <article aria-label="글 본문">{post.title}</article>
  ),
}));
vi.mock('@/server/supabase', () => ({ incrementView }));
vi.mock('@/server/view-visitor', () => ({ createViewVisitorHash }));
vi.mock('next/headers', () => ({ headers: () => new Headers() }));

import BlogPostPage from '@/app/blog/[category]/[slug]/page';
import ProjectPostPage from '@/app/projects/[slug]/[detail]/page';

describe('detail-page view recording', () => {
  const visitorHash = 'a'.repeat(64);

  beforeEach(() => {
    createViewVisitorHash.mockReset();
    createViewVisitorHash.mockReturnValue(visitorHash);
    incrementView.mockReset();
    incrementView.mockResolvedValue(1);
  });

  it('sends every valid article visit to the database-owned daily deduplication boundary', async () => {
    await BlogPostPage({
      params: Promise.resolve({
        category: 'react',
        slug: 'react-design-pattern',
      }),
    });

    expect(incrementView).toHaveBeenCalledExactlyOnceWith(
      'react-design-pattern',
      visitorHash,
    );
  });

  it('sends every valid project article visit to the database-owned daily deduplication boundary', async () => {
    await ProjectPostPage({
      params: Promise.resolve({ slug: 'mbtmi', detail: 'a-download' }),
    });

    expect(incrementView).toHaveBeenCalledExactlyOnceWith(
      'a-download',
      visitorHash,
    );
  });

  it('still renders a blog article when view recording fails', async () => {
    incrementView.mockRejectedValueOnce(new Error('metrics unavailable'));

    const page = await BlogPostPage({
      params: Promise.resolve({
        category: 'react',
        slug: 'react-hook-form',
      }),
    });

    expect(renderToStaticMarkup(page)).toContain('React Hook Form');
  });

  it('still renders a project note when view recording fails', async () => {
    incrementView.mockRejectedValueOnce(new Error('metrics unavailable'));

    const page = await ProjectPostPage({
      params: Promise.resolve({
        slug: 'nextjs-blog',
        detail: 'nextjs-blog-veiws',
      }),
    });

    expect(renderToStaticMarkup(page)).toContain(
      'Next js 블로그 조회수 기능 만들기 with Supabase',
    );
  });
});
