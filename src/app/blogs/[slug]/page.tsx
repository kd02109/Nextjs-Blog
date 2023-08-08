import { format, parseISO } from 'date-fns';
import { Post, allPosts } from 'contentlayer/generated';
import { getMDXComponent } from 'next-contentlayer/hooks';

export const generateStaticParams = async () =>
  allPosts.map(post => ({ slug: post._raw.flattenedPath }));

export const generateMetadata = ({ params }: { params: any }) => {
  const post = allPosts.find(post => post._raw.flattenedPath === params.slug);
  return { title: post?.title };
};

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find(post => post._raw.flattenedPath === params.slug);

  const Content = getMDXComponent((post as Post).body.code);

  return (
    <article className="py-8 mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1>{post?.title}</h1>
        <time dateTime={post?.date} className="mb-1 text-xs text-gray-600">
          {format(parseISO((post as Post).date), 'LLLL d, yyyy')}
        </time>
      </div>
      <div className="prose">
        <Content />
      </div>
    </article>
  );
};

export default PostLayout;
