import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { getPostBySlug } from '@/lib/content';
import { findH } from '@/util/findH';

vi.mock('server-only', () => ({}));

const loadComponent = async <T,>(
  loader: () => Promise<{ default: T }>,
  name: string,
): Promise<T> => {
  const loaded = await loader().catch(() => null);
  expect(
    loaded,
    `${name} should be available as a shared component`,
  ).not.toBeNull();
  return loaded!.default;
};

const blogPost = () => getPostBySlug('blog/react/react-hook-form')!;
const projectPost = () => getPostBySlug('nextjs-blog/nextjs-blog-veiws')!;

describe('shared article header', () => {
  it('renders one title, a real publication date, and the blog breadcrumb', async () => {
    const ArticleHeader = await loadComponent(
      () => import('./ArticleHeader'),
      'ArticleHeader',
    );
    const html = renderToStaticMarkup(<ArticleHeader post={blogPost()} />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('React Hook Form');
    expect(html).toContain('dateTime="2024-04-18T00:00:00.000Z"');
    expect(html).toContain('href="/blog"');
  });
});

describe('server-rendered MDX body', () => {
  it('renders real blog and project prose with their Velite heading IDs', async () => {
    const ReadingBody = await loadComponent(
      () => import('./ReadingBody'),
      'ReadingBody',
    );
    const blog = renderToStaticMarkup(<ReadingBody post={blogPost()} />);
    const project = renderToStaticMarkup(<ReadingBody post={projectPost()} />);

    expect(blog).toContain('React Hook Form은 Form의 구성요소를');
    expect(blog).toContain('id="react-hook-form"');
    expect(project).toContain('지금까지 블로그를 운영해서 아쉬운 점이');
    expect(project).toContain('id="블로그-조회수-기록하기"');
  });

  it('does not add a second page h1 when the source MDX contains a level-one heading', async () => {
    const ArticleHeader = await loadComponent(
      () => import('./ArticleHeader'),
      'ArticleHeader',
    );
    const ReadingBody = await loadComponent(
      () => import('./ReadingBody'),
      'ReadingBody',
    );
    const post = getPostBySlug('blog/js/array-like-object')!;
    const html = renderToStaticMarkup(
      <>
        <ArticleHeader post={post} />
        <ReadingBody post={post} />
      </>,
    );

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('id="참조"');
  });
});

describe('reading navigation', () => {
  it('exposes actual MDX headings as keyboard-accessible fragment links', async () => {
    const TableOfContents = await loadComponent(
      () => import('./TableOfContents'),
      'TableOfContents',
    );
    const html = renderToStaticMarkup(
      <TableOfContents toc={findH(blogPost().body.raw)} />,
    );

    expect(html).toContain('href="#react-hook-form"');
    expect(html).toContain('href="#useform"');
  });

  it('links to real blog and project records and the parent project', async () => {
    const RelatedContent = await loadComponent(
      () => import('./RelatedContent'),
      'RelatedContent',
    );
    const html = renderToStaticMarkup(
      <RelatedContent
        backHref="/projects/nextjs-blog"
        posts={[
          {
            title: 'Optimistic Updates',
            href: '/blog/react/optimistic-updates',
            label: '다음 글',
          },
          {
            title: 'Next js 블로그 개발 회고',
            href: '/projects/nextjs-blog/next-js-blog-review',
            label: '관련 기록',
          },
        ]}
      />,
    );

    expect(html).toContain('href="/blog/react/optimistic-updates"');
    expect(html).toContain('href="/projects/nextjs-blog/next-js-blog-review"');
    expect(html).toContain('href="/projects/nextjs-blog"');
  });
});
