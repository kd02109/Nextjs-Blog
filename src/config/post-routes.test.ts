import { describe, expect, it } from 'vitest';

import { getAllPosts } from '@/lib/content';

import {
  getBlogRouteParts,
  getLegacyDiscussionTerm,
  getPublicPostPath,
} from './post-routes';

describe('public post routes', () => {
  it('gives every published post one distinct public URL', () => {
    const posts = getAllPosts();
    const publicPaths = posts.map(getPublicPostPath);

    expect(new Set(publicPaths).size).toBe(posts.length);
    expect(publicPaths.every(path => path.startsWith('/'))).toBe(true);

    for (const post of posts) {
      if (post.brand.trim() === 'blog') {
        expect(getBlogRouteParts(post.url)).toEqual({
          category: post.url.split('/')[1],
          slug: post.url.split('/')[2],
        });
        expect(getPublicPostPath(post)).toMatch(/^\/blog\/[^/]+\/[^/]+$/);
        expect(getLegacyDiscussionTerm(post)).toBe(`blogs/${post.url}`);
      } else {
        expect(getPublicPostPath(post)).toBe(`/projects/${post.url}`);
        expect(getLegacyDiscussionTerm(post)).toBe(`projects/${post.url}`);
      }
    }
  });

  it('rejects internal blog URLs that cannot map to one redirect target', () => {
    for (const url of [
      'blog/react',
      'blog/react/post/extra',
      'other/react/post',
    ]) {
      expect(() => getBlogRouteParts(url)).toThrow('Invalid blog post URL');
    }
  });
});
