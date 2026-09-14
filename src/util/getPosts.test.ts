import { describe, expect, it } from 'vitest';

import getPosts from './getPosts';

describe('getPosts date-fns integration', () => {
  it('keeps the real blog call site in descending publication order', () => {
    const posts = getPosts('blog');

    expect(posts).toHaveLength(41);
    expect(posts.slice(0, 3).map(post => post.url)).toEqual([
      'blog/react/react-hook-form',
      'blog/react/optimistic-updates',
      'blog/react/storybook',
    ]);
    expect(
      posts.every(
        (post, index) =>
          index === 0 ||
          new Date(posts[index - 1].date).getTime() >=
            new Date(post.date).getTime(),
      ),
    ).toBe(true);
  });
});
