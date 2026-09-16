import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Home from './page';

describe('home writing discovery', () => {
  it('shows popular and latest writing without carousel controls', async () => {
    const html = renderToStaticMarkup(await Home());

    expect(html).toContain('You may Like');
    expect(html).toContain('Latest Posts');
    expect(html).not.toContain('Go to next slide');
    expect(html).not.toContain('Go to previous slide');
  });

  it('shows the four newest posts across blog and project writing', async () => {
    const html = renderToStaticMarkup(await Home());

    expect(html).toContain('href="/projects/swifty/nextjs-with-cookie"');
    expect(html).toContain('href="/projects/nextjs-blog/nextjs-blog-veiws"');
    expect(html).toContain('href="/projects/nextjs-blog/next-js-blog-review"');
    expect(html).toContain('href="/blogs/blog/react/react-hook-form"');
  });
});
