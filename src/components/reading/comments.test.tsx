import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { giscusProps, themeState } = vi.hoisted(() => ({
  giscusProps: vi.fn(),
  themeState: {
    theme: 'light' as string,
    resolvedTheme: 'light' as string | undefined,
  },
}));

vi.mock('@giscus/react', () => ({
  default: (props: Record<string, string>) => {
    giscusProps(props);
    return <div data-giscus-probe="true" />;
  },
}));
vi.mock('next-themes', () => ({ useTheme: () => themeState }));
vi.mock('server-only', () => ({}));

import BlogComment from '@/components/BlogComment';
import DetailPage from '@/components/DetailPage';
import { getPostBySlug } from '@/lib/content';

beforeEach(() => {
  themeState.theme = 'light';
  themeState.resolvedTheme = 'light';
  giscusProps.mockReset();
});

describe('Giscus configuration', () => {
  it.each([
    'blogs/blog/react/react-hook-form',
    'projects/nextjs-blog/nextjs-blog-veiws',
  ])('keeps the existing GitHub discussion for %s', discussionTerm => {
    renderToStaticMarkup(<BlogComment discussionTerm={discussionTerm} />);

    expect(giscusProps).toHaveBeenCalledTimes(1);
    expect(giscusProps).toHaveBeenCalledWith(
      expect.objectContaining({
        repo: 'kd02109/Nextjs-Blog',
        repoId: 'R_kgDOKD_Xgg',
        category: 'General',
        categoryId: 'DIC_kwDOKD_Xgs4CY7-G',
        mapping: 'specific',
        term: discussionTerm,
        strict: '0',
        reactionsEnabled: '1',
        emitMetadata: '0',
        inputPosition: 'top',
        lang: 'ko',
      }),
    );
  });

  it.each([
    { theme: 'light', resolvedTheme: 'light', expected: 'noborder_light' },
    { theme: 'dark', resolvedTheme: 'dark', expected: 'noborder_dark' },
    { theme: 'system', resolvedTheme: 'light', expected: 'noborder_light' },
    { theme: 'system', resolvedTheme: 'dark', expected: 'noborder_dark' },
    { theme: 'system', resolvedTheme: undefined, expected: 'noborder_light' },
  ])(
    'uses $theme resolved as $resolvedTheme for Giscus',
    ({ theme, resolvedTheme, expected }) => {
      themeState.theme = theme;
      themeState.resolvedTheme = resolvedTheme;

      renderToStaticMarkup(
        <BlogComment discussionTerm="blogs/blog/react/react-hook-form" />,
      );

      expect(giscusProps).toHaveBeenCalledWith(
        expect.objectContaining({ theme: expected }),
      );
    },
  );
});

describe('shared article conversation', () => {
  it.each([
    [
      'blog',
      'blog/react/react-hook-form',
      undefined,
      'blogs/blog/react/react-hook-form',
    ],
    [
      'project',
      'nextjs-blog/nextjs-blog-veiws',
      'nextjs-blog',
      'projects/nextjs-blog/nextjs-blog-veiws',
    ],
  ])(
    'shows the same labelled Giscus area for a %s article',
    (_kind, slug, projectFooter, discussionTerm) => {
      const post = getPostBySlug(slug)!;
      const html = renderToStaticMarkup(
        <DetailPage
          post={post}
          tags={post.tag}
          projectFooter={projectFooter as 'nextjs-blog' | undefined}
        />,
      );
      const section = html.match(
        /<section\b[^>]*id="comments"[^>]*>[\s\S]*?<\/section>/,
      )?.[0];

      expect(section).toBeDefined();
      expect(section).toContain('aria-labelledby="comments-title"');
      expect(section).toMatch(/<h2\b[^>]*id="comments-title"[^>]*>/);
      expect(section).toContain('읽은 뒤에');
      expect(section).toContain('남기는 메모.');
      expect(section).toMatch(/class="[^"]*\breading-comments-embed\b[^"]*"/);
      expect(section).toContain('data-giscus-probe="true"');
      expect(section).not.toMatch(/<form\b/);
      expect(html).toContain('href="#comments"');
      expect(giscusProps).toHaveBeenCalledTimes(1);
      expect(giscusProps).toHaveBeenCalledWith(
        expect.objectContaining({ mapping: 'specific', term: discussionTerm }),
      );
    },
  );
});
