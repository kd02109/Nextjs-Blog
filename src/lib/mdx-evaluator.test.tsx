import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getPostBySlug } from './content';

type EvaluateMdx = (
  code: string,
) => React.ComponentType<{ components?: Record<string, React.ComponentType> }>;

const loadEvaluator = async (): Promise<EvaluateMdx | undefined> => {
  const moduleUrl = new URL('./mdx-evaluator.ts', import.meta.url).href;

  try {
    const evaluator = (await import(/* @vite-ignore */ moduleUrl)) as {
      evaluateMdx?: EvaluateMdx;
    };
    return evaluator.evaluateMdx;
  } catch {
    return undefined;
  }
};

describe('Velite MDX evaluator', () => {
  it('is available as a focused module', async () => {
    expect(await loadEvaluator()).toBeTypeOf('function');
  });

  it.each([
    {
      slug: 'blog/js/URLSearchParams',
      expectedText: 'URLSearchParams는 URL의 쿼리 문자열 매개변수',
    },
    {
      slug: 'blog/nextjs/auth-js',
      expectedText: 'Auth.js, Next Auth는 같은 라이브러리',
    },
    {
      slug: 'mbtmi/a-download',
      expectedText: '실제 웹을 배포하고 난 후 이미지 다운로드 기능',
    },
  ])('renders the $slug golden document', async ({ slug, expectedText }) => {
    const evaluateMdx = await loadEvaluator();
    expect(evaluateMdx).toBeTypeOf('function');

    const post = getPostBySlug(slug);
    expect(post).toBeDefined();

    const Content = evaluateMdx!(post!.body.code);
    const html = renderToStaticMarkup(createElement(Content));

    expect(html).toContain(expectedText);
  });
});
