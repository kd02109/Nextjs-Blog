import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Home from './page';

const renderHome = async () => renderToStaticMarkup(await Home());

describe('home writing discovery', () => {
  it('shows one hero heading and the real featured article', async () => {
    const html = await renderHome();

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('만들면서 배우고');
    const featured = html.match(
      /<article[^>]*aria-label="대표 글 React Hook Form"[\s\S]*?<\/article>/,
    )?.[0];
    expect(featured).toContain('href="/blogs/blog/react/react-hook-form"');
  });

  it('lists the four newest blog articles in the recent writing area', async () => {
    const html = await renderHome();
    const recentList = html.match(
      /<ol[^>]*aria-label="최근 글"[^>]*>[\s\S]*?<\/ol>/,
    )?.[0];

    expect(recentList).toBeDefined();
    expect(recentList!.match(/<li\b/g)).toHaveLength(4);
    for (const url of [
      '/blogs/blog/react/react-hook-form',
      '/blogs/blog/react/optimistic-updates',
      '/blogs/blog/react/storybook',
      '/blogs/blog/nextjs/auth-js',
    ]) {
      expect(recentList).toContain(`href="${url}"`);
    }
  });

  it('links real projects and topic archives', async () => {
    const html = await renderHome();

    expect(html).toContain('href="/projects/nextjs-blog"');
    expect(html).toContain('href="/projects/sharepetment"');
    expect(html).toContain('href="/tags?key=react"');
    expect(html).toContain('href="/tags?key=nextJs"');
    expect(html).toContain('href="/blogs"');
    expect(html).toContain('href="/projects"');
  });
});
