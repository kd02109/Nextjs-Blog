import { describe, expect, it } from 'vitest';

import getPosts from './getPosts';
import rankPostsByViews from './rankPostsByViews';

describe('getPosts date-fns integration', () => {
  it('ranks posts by views and uses recency to break ties', () => {
    const posts = getPosts();
    const newest = posts[0];
    const secondNewest = posts[1];
    const thirdNewest = posts[2];
    const slug = (url: string) => url.split('/').at(-1)!;

    const ranked = rankPostsByViews(
      [thirdNewest, newest, secondNewest],
      {
        [slug(newest.url)]: 12,
        [slug(secondNewest.url)]: 30,
        [slug(thirdNewest.url)]: 12,
      },
      3,
    );

    expect(ranked.map(post => post.url)).toEqual([
      secondNewest.url,
      newest.url,
      thirdNewest.url,
    ]);
  });

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
