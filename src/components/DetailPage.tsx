import BlogComment from '@/components/BlogComment';
import BlogMenu from '@/components/BlogMenu';
import CodeBlock from '@/components/CodeBlock';
import PostFooter from '@/components/PostFooter';
import Tag from '@/components/Tag';
import { toc } from '@/util/toc';
import { Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import { getMDXComponent, useMDXComponent } from 'next-contentlayer/hooks';
import Image from 'next/image';

type Prop = {
  post: Post | undefined;
  tags: string[] | undefined;
  postFooter?: {
    prevPost: Post | undefined;
    nextPost: Post | undefined;
  };
};

const mdxComponents = {
  img: ({ src, alt, ...props }: { src: string; alt: string }) => {
    return (
      <Image layout="responsive" alt={alt} src={src} width={100} height={100} />
    );
  },
  pre: CodeBlock,
};

export default function DetailPage({ post, tags, postFooter }: Prop) {
  const Content = useMDXComponent((post as Post).body.code);
  const slugMap = toc(post?.body.raw as string);
  return (
    <>
      <article className="py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl max-sm:text-3xl mb-2">{post?.title}</h1>
          <nav className="my-3">
            <ul className="flex justify-center gap-2 py-2">
              {tags?.map(item => (
                <li key={item}>
                  <Tag tag={item} />
                </li>
              ))}
            </ul>
          </nav>
          <time
            dateTime={post?.date}
            className="mb-1 text-xs text-gray-600 dark:text-gray-300">
            {format(parseISO((post as Post).date), 'LLLL d, yyyy')}
          </time>
        </div>
        <div className="flex justify-between">
          <section className="prose lg:prose-xl md:prose-lg sm:prose-base prose-slate dark:prose-invert  w-full max-w-3xl">
            {/*  @ts-ignore */}
            <Content components={mdxComponents} />
          </section>
          <div className="sticky top-[135px] max-md:hidden min-w-[240px] max-w-[260px] self-start lg:block">
            <BlogMenu toc={slugMap} />
          </div>
        </div>
        {postFooter && <PostFooter {...postFooter} />}
      </article>
      <BlogComment />
    </>
  );
}
