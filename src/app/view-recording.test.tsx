import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createViewVisitorHash, incrementView } = vi.hoisted(() => ({
  createViewVisitorHash: vi.fn(),
  incrementView: vi.fn(),
}));

vi.mock('@/components/DetailPage', () => ({ default: () => null }));
vi.mock('@/server/supabase', () => ({ incrementView }));
vi.mock('@/server/view-visitor', () => ({ createViewVisitorHash }));
vi.mock('next/headers', () => ({ headers: () => new Headers() }));

import BlogPostPage from '@/app/blogs/[...slug]/page';
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
        slug: ['blog', 'react', 'react-design-pattern'],
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
});
