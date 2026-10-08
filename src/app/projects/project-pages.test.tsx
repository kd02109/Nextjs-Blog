import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import ProjectsPage from './page';
import ProjectDetailPage from './[slug]/page';

vi.mock('next/navigation', async importOriginal => {
  const navigation = await importOriginal<typeof import('next/navigation')>();
  return {
    ...navigation,
    useRouter: () => ({ push: () => undefined }),
  };
});

const renderProject = async (slug: string) =>
  renderToStaticMarkup(
    await ProjectDetailPage({ params: Promise.resolve({ slug }) }),
  );

describe('project directory', () => {
  it('has one page heading for five project cards', () => {
    const html = renderToStaticMarkup(<ProjectsPage />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<article\b/g)).toHaveLength(5);
  });

  it('keeps all five real detail URLs and descriptive project image alternatives', () => {
    const html = renderToStaticMarkup(<ProjectsPage />);

    for (const [slug, imageAlt] of [
      ['solo-project', 'Solo Project Making Shoppig app'],
      ['sharepetment', 'SharePetment'],
      ['nextjs-blog', 'NextJS Blog'],
      ['mbtmi', 'Mbti Test Project'],
      ['swifty', 'Swifty'],
    ]) {
      expect(html).toContain(`href="/projects/${slug}"`);
      expect(html).toContain(`alt="${imageAlt}"`);
    }
  });
});

describe('project detail', () => {
  it('links the seven NextJS Blog chapters newest first', async () => {
    const html = await renderProject('nextjs-blog');
    const chapterHrefs = [
      ...html.matchAll(/href="(\/projects\/nextjs-blog\/[^\"]+)"/g),
    ].map(match => match[1]);

    expect(chapterHrefs).toEqual([
      '/projects/nextjs-blog/nextjs-blog-veiws',
      '/projects/nextjs-blog/next-js-blog-review',
      '/projects/nextjs-blog/seo',
      '/projects/nextjs-blog/google-analytics',
      '/projects/nextjs-blog/darkmode',
      '/projects/nextjs-blog/nextjs-mdx',
      '/projects/nextjs-blog/nextjs-markdown',
    ]);
  });

  it('shows the project image and technology names with an accessible page title', async () => {
    const html = await renderProject('nextjs-blog');

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('alt="NextJS Blog"');
    expect(
      ['Next.js', 'TypeScript', 'MDX'].map(name => html.includes(`>${name}<`)),
    ).toEqual([true, true, true]);
  });

  it('keeps the live and source destinations as safe external links', async () => {
    const html = await renderProject('nextjs-blog');

    expect(html).toContain('href="https://sonblog.vercel.app/"');
    expect(html).toContain('href="https://github.com/kd02109/Nextjs-Blog"');
    const externalLinks =
      html.match(
        /<a\b[^>]*href="https:\/\/(?:sonblog\.vercel\.app\/|github\.com\/kd02109\/Nextjs-Blog)"[^>]*>/g,
      ) ?? [];
    expect(externalLinks).toHaveLength(2);
    for (const link of externalLinks) {
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noopener noreferrer"');
    }
  });

  it('reports an unknown project slug as a 404', async () => {
    await expect(
      ProjectDetailPage({ params: Promise.resolve({ slug: 'not-a-project' }) }),
    ).rejects.toMatchObject({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' });
  });
});
