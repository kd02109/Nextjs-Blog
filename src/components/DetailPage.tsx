import BlogComment from '@/components/BlogComment';
import BlogMenu from '@/components/BlogMenu';
import CodeBlock from '@/components/CodeBlock';
import DetailProjectPageList from '@/components/DetailProjectPageList';
import PostFooter from '@/components/PostFooter';
import Tag from '@/components/Tag';
import { ProjectName } from '@/types/projectType';
import { findH } from '@/util/findH';
import type { Post } from '@/lib/content';
import { evaluateMdx } from '@/lib/mdx-evaluator';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { createElement, type ComponentProps } from 'react';

type Prop = {
  post: Post;
  tags: string[];
  postFooter?: {
    prevPost: Post | undefined;
    nextPost: Post | undefined;
  };
  projectFooter?: ProjectName;
};

const mdxComponents = {
  img: ({ src, alt, ...props }: { src: string; alt: string }) => {
    return (
      <Image
        layout="responsive"
        alt={alt}
        src={src}
        width={100}
        height={100}
        {...props}
      />
    );
  },
  pre: CodeBlock,
  table: ({ children, ...props }: ComponentProps<'table'>) => (
    <div className="my-8 max-w-full overflow-x-auto">
      <table {...props} className="my-0 w-full min-w-[640px]">
        {children}
      </table>
    </div>
  ),
};

export default function DetailPage({
  post,
  tags,
  postFooter,
  projectFooter,
}: Prop) {
  const content = createElement(
    evaluateMdx<typeof mdxComponents>(post.body.code),
    { components: mdxComponents },
  );
  const slugMap = findH(post.body.raw);
  return (
    <>
      <article className="mt-16 min-w-0 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl max-sm:text-3xl mb-2">{post.title}</h1>
          <nav className="my-3">
            <ul className="flex justify-center gap-2 py-2 max-md:flex-wrap">
              {tags.map(item => (
                <li key={item} className="max-md:my-2">
                  <Tag tag={item} />
                </li>
              ))}
            </ul>
          </nav>
          <time
            dateTime={post.date}
            className="mb-1 text-xs text-gray-600 dark:text-gray-300">
            {format(parseISO(post.date), 'LLLL d, yyyy')}
          </time>
        </div>
        <div className="flex min-w-0 justify-between gap-8">
          <section className="prose prose-slate min-w-0 w-full max-w-3xl flex-1 sm:prose-base md:prose-lg lg:prose-xl dark:prose-invert">
            {content}
          </section>
          <div className="sticky top-[135px] hidden min-w-[240px] max-w-[260px] shrink-0 self-start lg:block">
            <BlogMenu toc={slugMap} />
          </div>
        </div>
        {postFooter && <PostFooter {...postFooter} />}
        {projectFooter && (
          <DetailProjectPageList
            title={projectFooter}
            param={post.url}
            date={post.date}
          />
        )}
      </article>
      <BlogComment />
    </>
  );
}
