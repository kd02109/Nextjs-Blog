import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Article from './Article';

describe('post date rendering', () => {
  it('formats a real carousel article date after the date-fns major upgrade', () => {
    const html = renderToStaticMarkup(
      <Article
        body={{ code: '', raw: '' }}
        brand="blog"
        date="2024-06-08T00:00:00.000Z"
        description="A compatibility fixture"
        id="date-formatting"
        index={0}
        sourcePath="blog/date-formatting.mdx"
        tag={['test']}
        title="Date formatting"
        url="blog/date-formatting"
      />,
    );

    expect(html).toContain('June 8, 2024');
  });
});
