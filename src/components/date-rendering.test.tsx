import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomePostList from './home/HomePostList';

describe('post date rendering', () => {
  it('formats a real home article date after the date-fns major upgrade', () => {
    const html = renderToStaticMarkup(
      <HomePostList
        posts={[
          {
            brand: 'blog',
            date: '2024-06-08T00:00:00.000Z',
            description: 'A compatibility fixture',
            id: 'date-formatting',
            tag: ['test'],
            title: 'Date formatting',
            url: 'blog/date-formatting',
          },
        ]}
      />,
    );

    expect(html).toContain('2024.06.08');
  });

  it('does not present unavailable view data as zero views', () => {
    const html = renderToStaticMarkup(
      <HomePostList
        ranked
        posts={[
          {
            brand: 'blog',
            date: '2024-06-08T00:00:00.000Z',
            description: 'A compatibility fixture',
            id: 'date-formatting',
            tag: ['test'],
            title: 'Date formatting',
            url: 'blog/date-formatting',
          },
        ]}
      />,
    );

    expect(html).not.toContain('0 views');
  });
});
