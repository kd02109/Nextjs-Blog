import generatedPosts from '../../.velite/posts.json';

import type { Post as GeneratedPost } from '../../.velite';

export type Post = Omit<GeneratedPost, 'code' | 'raw'> & {
  body: {
    raw: string;
    code: string;
  };
};

const posts: Post[] = (generatedPosts as GeneratedPost[])
  .map(({ code, raw, ...post }) => ({
    ...post,
    tag: post.tag.map(tag => tag.trim()),
    body: { raw, code },
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const clonePost = (post: Post): Post => ({
  ...post,
  tag: [...post.tag],
  body: { ...post.body },
});

export const getAllPosts = (): Post[] => posts.map(clonePost);

export const getPostBySlug = (slug: string): Post | undefined => {
  const post = posts.find(post => post.url === slug.trim());
  return post ? clonePost(post) : undefined;
};

export const getAllTags = (): Record<string, number> =>
  posts.reduce<Record<string, number>>(
    (tags, post) => {
      for (const tag of post.tag) {
        tags[tag] = (tags[tag] ?? 0) + 1;
      }
      return tags;
    },
    { all: posts.length },
  );
