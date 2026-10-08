import CodeBlock from '@/components/CodeBlock';
import type { Post } from '@/lib/content';
import { evaluateMdx } from '@/lib/mdx-evaluator';
import Image from 'next/image';
import { createElement, type ComponentProps } from 'react';

type Props = { post: Post };

const mdxComponents = {
  img: ({ src, alt = '', width, height, ...props }: ComponentProps<'img'>) => {
    if (!src || typeof src !== 'string') return null;
    const numericWidth = Number(width) || 1200;
    const numericHeight = Number(height) || 675;

    return (
      <Image
        src={src}
        alt={alt}
        width={numericWidth}
        height={numericHeight}
        sizes="(max-width: 760px) calc(100vw - 36px), 790px"
        {...props}
      />
    );
  },
  h1: ({ children, ...props }: ComponentProps<'h1'>) => (
    <h2 {...props}>{children}</h2>
  ),
  pre: CodeBlock,
  table: ({ children, ...props }: ComponentProps<'table'>) => (
    <div
      className="reading-table"
      role="region"
      aria-label="가로로 스크롤 가능한 표"
      tabIndex={0}>
      <table {...props}>{children}</table>
    </div>
  ),
};

export default function ReadingBody({ post }: Props) {
  const content = createElement(
    evaluateMdx<typeof mdxComponents>(post.body.code),
    { components: mdxComponents },
  );

  return (
    <article className="reading-body prose" aria-label="글 본문">
      {content}
    </article>
  );
}
