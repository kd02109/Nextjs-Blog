import BlogComment from '@/components/BlogComment';
import BlogMenu from '@/components/BlogMenu';
import CodeBlock from '@/components/CodeBlock';
import DetailProjectPageList from '@/components/DetailProjectPageList';
import PostFooter from '@/components/PostFooter';
import Tag from '@/components/Tag';
import WritingList from '@/components/layout/WritingList';
import { ProjectName } from '@/types/projectType';
import { findH } from '@/util/findH';
import { Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import { useMDXComponent } from 'next-contentlayer/hooks';
import Image from 'next/image';

type Prop = {
  post: Post | undefined;
  tags: string[] | undefined;
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
};

export default function DetailPage({
  post,
  tags,
  postFooter,
  projectFooter,
}: Prop) {
  const Content = useMDXComponent((post as Post).body.code);
  const slugMap = findH(post?.body.raw as string);
  return (
    <>
      <article className="py-8 mt-16">
        <div className="mb-8 text-center">
          <h1 className="text-5xl max-sm:text-3xl mb-2">{post?.title}</h1>
          <nav className="my-3">
            <ul className="flex justify-center gap-2 py-2 max-md:flex-wrap">
              {tags?.map(item => (
                <li key={item} className="max-md:my-2">
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
        {projectFooter && (
          <DetailProjectPageList
            title={projectFooter}
            param={post?.url}
            date={post?.date}
          />
        )}
      </article>
      <BlogComment />
    </>
  );
}
