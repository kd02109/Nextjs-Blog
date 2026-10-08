import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import BlogPage from '@/components/page/BlogPage';
import TagPage from '@/components/page/TagPage';

describe('writing and topic pages', () => {
  it('shows the real blog records as links with a result count', () => {
    const html = renderToStaticMarkup(<BlogPage />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('41개의 기록');
    expect(html).toContain('href="/blogs/blog/react/react-hook-form"');
  });

  it('renders one heading and all matching blog and project links for a legacy topic URL', () => {
    const html = renderToStaticMarkup(<TagPage initialTag="react" />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('22개의 기록');
    expect(html).toContain('href="/blogs/blog/react/react-hook-form"');
    expect(html).toContain('href="/projects/mbtmi/error-component"');
  });

  it('keeps links from article tags with more specific legacy keys', () => {
    const html = renderToStaticMarkup(<TagPage initialTag="react-hook-form" />);

    expect(html).toContain('1개의 기록');
    expect(html).toContain('href="/blogs/blog/react/react-hook-form"');
  });
});
