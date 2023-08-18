import { format, parseISO } from 'date-fns';
import { Post, allPosts } from 'contentlayer/generated';
import { getMDXComponent } from 'next-contentlayer/hooks';
import Tag from '@/components/Tag';

export const generateMetadata = ({ params }: { params: any }) => {
  const post = allPosts.find(post => {
    const str = params.slug.join('/');

    return post._raw.flattenedPath === str;
  });

  return { title: post?.title };
};

const PostLayout = ({ params }: { params: { slug: string[] } }) => {
  const str = params.slug.join('/');

  const post = allPosts.find(post => post._raw.flattenedPath === str);
  const tags = post?.tag;
  const Content = getMDXComponent((post as Post).body.code);

  return (
    <article className="py-8 max-2lg">
      <div className="mb-8 text-center">
        <h1 className="text-5xl max-sm:text-3xl">{post?.title}</h1>
        <div className="flex gap-2 justify-center m-1">
          {tags?.map(item => <Tag key={item} tag={item} />)}
        </div>
        <time
          dateTime={post?.date}
          className="mb-1 text-xs text-gray-600 dark:text-gray-300">
          {format(parseISO((post as Post).date), 'LLLL d, yyyy')}
        </time>
      </div>
      <section className="prose lg:prose-xl md:prose-lg sm:prose-base prose-slate dark:prose-invert">
        <Content />
      </section>
    </article>
  );
};

export default PostLayout;
