import { describe, expect, it } from 'vitest';

import { getAllPosts, getAllTags, getPostBySlug } from './content';

describe('content facade', () => {
  it('exposes all 73 generated MDX documents', () => {
    expect(getAllPosts()).toHaveLength(73);
  });

  it.each([
    {
      slug: 'blog/js/URLSearchParams',
      frontmatter: {
        title: 'URL & URLSearchParams',
        date: '2023-04-02T00:00:00.000Z',
        id: 'urlsearchparams',
        tag: ['javascript', 'Web Api'],
        brand: 'blog',
        description: 'URL객체와 URLSearchParams에 대해 정리합니다.',
      },
    },
    {
      slug: 'blog/nextjs/auth-js',
      frontmatter: {
        title: 'Auth.js',
        date: '2024-01-31T00:00:00.000Z',
        id: 'auth-js',
        tag: ['nextJs', 'Auth.js'],
        brand: 'blog',
        description:
          'Auth.js(Next Auth)를 활용해서 Next.js에서 간편하게 소셜 로그인을 연동하는 방법에 대해서 정리합니다.',
      },
    },
    {
      slug: 'mbtmi/a-download',
      frontmatter: {
        title: 'a.download는 모두 지원이 되는 거 아니었나요?',
        date: '2023-12-03T00:00:00.000Z',
        id: 'a-download',
        tag: ['project', 'nextJs', 'mbtmi', 'javascript'],
        brand: 'project',
        description:
          'a.download 기능이 safari에서 제대로 지원하지 않는 점에 대해서 정리해보았습니다.',
      },
    },
  ])('preserves $slug URL and frontmatter', ({ slug, frontmatter }) => {
    const post = getPostBySlug(slug);

    expect(post).toMatchObject({ url: slug, ...frontmatter });
    expect(post?.body.raw.length).toBeGreaterThan(0);
    expect(post?.body.code.length).toBeGreaterThan(0);
  });

  it('returns posts in the existing descending date order', () => {
    const posts = getAllPosts();

    expect(posts.slice(0, 10).map(({ url, date }) => [url, date])).toEqual([
      ['swifty/nextjs-with-cookie', '2024-06-08T00:00:00.000Z'],
      ['nextjs-blog/nextjs-blog-veiws', '2024-05-14T00:00:00.000Z'],
      ['nextjs-blog/next-js-blog-review', '2024-05-07T00:00:00.000Z'],
      ['blog/react/react-hook-form', '2024-04-18T00:00:00.000Z'],
      ['blog/react/optimistic-updates', '2024-04-08T00:00:00.000Z'],
      ['blog/react/storybook', '2024-03-27T00:00:00.000Z'],
      ['blog/nextjs/auth-js', '2024-01-31T00:00:00.000Z'],
      ['blog/nextjs/server-action', '2024-01-22T00:00:00.000Z'],
      ['blog/react/react-type-detail', '2024-01-17T00:00:00.000Z'],
      ['blog/react/msw', '2024-01-11T00:00:00.000Z'],
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

  it('preserves the existing normalized tag aggregation', () => {
    expect(getAllTags()).toEqual({
      all: 73,
      ajax: 1,
      'Auth.js': 1,
      AWS: 1,
      babel: 1,
      clipboard: 1,
      closure: 1,
      cookie: 2,
      cors: 1,
      'desgin-pettern': 1,
      ESlint: 1,
      fastapi: 1,
      gunicorn: 1,
      http: 1,
      image: 1,
      javascript: 16,
      JWT: 1,
      kakao: 1,
      localStorage: 1,
      login: 4,
      mbtmi: 12,
      msw: 1,
      nextjs: 1,
      nextJs: 27,
      nextJS: 1,
      OAuth: 1,
      project: 32,
      proxy: 1,
      pwa: 1,
      react: 22,
      'react-hook-form': 1,
      'react-query': 2,
      session: 1,
      shareAPI: 1,
      sharepetment: 9,
      'shopping-app': 3,
      storybook: 1,
      swifty: 1,
      typescript: 4,
      vite: 1,
      'Web Api': 1,
      webpack: 1,
    });
  });

  it('returns undefined for an unknown slug', () => {
    expect(getPostBySlug('blog/not-a-real-post')).toBeUndefined();
  });

  it('does not let callers reorder the backing post collection', () => {
    const exposedPosts = getAllPosts();
    const originalFirstUrl = exposedPosts[0].url;

    exposedPosts.reverse();
    const firstUrlAfterMutation = getAllPosts()[0].url;

    // Restore the old implementation's shared array so this RED test cannot
    // contaminate the rest of the suite.
    if (firstUrlAfterMutation !== originalFirstUrl) exposedPosts.reverse();

    expect(firstUrlAfterMutation).toBe(originalFirstUrl);
  });

  it('does not let callers mutate posts retained by the facade', () => {
    const slug = 'blog/js/URLSearchParams';
    const exposedPost = getAllPosts().find(post => post.url === slug);
    expect(exposedPost).toBeDefined();

    const original = {
      title: exposedPost!.title,
      tags: [...exposedPost!.tag],
      raw: exposedPost!.body.raw,
    };

    exposedPost!.title = 'mutated title';
    exposedPost!.tag.splice(0, exposedPost!.tag.length, 'mutated tag');
    exposedPost!.body.raw = 'mutated body';

    const reread = getPostBySlug(slug);
    const observed = {
      title: reread?.title,
      tags: reread?.tag,
      raw: reread?.body.raw,
    };

    // Restore shared nested state when running against the vulnerable facade.
    exposedPost!.title = original.title;
    exposedPost!.tag.splice(0, exposedPost!.tag.length, ...original.tags);
    exposedPost!.body.raw = original.raw;

    expect(observed).toEqual(original);
  });
});
