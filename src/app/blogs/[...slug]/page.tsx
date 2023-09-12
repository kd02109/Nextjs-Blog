import { format, parseISO } from 'date-fns';
import { Post, allPosts } from 'contentlayer/generated';
import { getMDXComponent } from 'next-contentlayer/hooks';
import Tag from '@/components/Tag';
import { toc } from '@/util/toc';
import BlogMenu from '@/components/BlogMenu';
import getPosts from '@/util/getPosts';
import PostFooter from '@/components/PostFooter';
import CodeBlock from '@/components/CodeBlock';
import BlogComment from '@/components/BlogComment';

export const generateMetadata = ({ params }: { params: any }) => {
  const post = allPosts.find(post => {
    const str = params.slug.join('/').trim();
    return `${post._raw.flattenedPath.trim()}` === str;
  });

  return { title: post?.title };
};

const mdxComponents = {
  pre: CodeBlock,
};

const PostLayout = ({ params }: { params: { slug: string[] } }) => {
  const str = params.slug.join('/');

  const allPostsSort = getPosts('blog');
  let postIndex = Infinity;
  const post = allPostsSort.find((post, index) => {
    if (post._raw.flattenedPath === str) {
      postIndex = index;
      return true;
    }
  });

  const postFooter = {
    prevPost: allPostsSort.at(postIndex - 1)
      ? allPostsSort.at(postIndex - 1)
      : undefined,

    nextPost: allPostsSort.at(postIndex + 1)
      ? allPostsSort.at(postIndex + 1)
      : undefined,
  };
  const tags = post?.tag;
  const Content = getMDXComponent((post as Post).body.code);
  const slugMap = toc(post?.body.raw as string);
  return (
    <>
      <article className="py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl max-sm:text-3xl mb-2">{post?.title}</h1>
          <div className="flex gap-2 justify-center m-1">
            {tags?.map(item => <Tag key={item} tag={item} />)}
          </div>
          {/* <Link href={`/blogs/${str}#${rawMap[0].slug}`}>Go</Link> */}
          <time
            dateTime={post?.date}
            className="mb-1 text-xs text-gray-600 dark:text-gray-300">
            {format(parseISO((post as Post).date), 'LLLL d, yyyy')}
          </time>
        </div>
        <div className="flex justify-between">
          <section className="prose lg:prose-xl md:prose-lg sm:prose-base prose-slate dark:prose-invert  w-full max-w-3xl">
            <Content components={mdxComponents} />
          </section>
          <div className="sticky top-[50px] max-md:hidden min-w-[240px] max-w-[260px] self-start lg:block">
            <BlogMenu toc={slugMap} />
          </div>
        </div>
        <PostFooter {...postFooter} />
      </article>
      <BlogComment />
    </>
  );
};

export default PostLayout;
