import { allPosts } from 'contentlayer/generated';
import getPosts from '@/util/getPosts';
import DetailPage from '@/components/DetailPage';
import { Metadata } from 'next';

export const generateMetadata = ({ params }: { params: any }): Metadata => {
  const post = allPosts.find(post => {
    const str = params.slug.join('/').trim();
    return `${post._raw.flattenedPath.trim()}` === str;
  });

  return {
    title: post?.title,
    description: post?.description,
    openGraph: {
      title: post?.title,
      images: 'https://source.unsplash.com/random/300×300',
      description: post?.description,
    },
  };
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
  console.log(str, post?.title);
  const postFooter = {
    prevPost: allPostsSort.at(postIndex - 1)
      ? allPostsSort.at(postIndex - 1)
      : undefined,

    nextPost: allPostsSort.at(postIndex + 1)
      ? allPostsSort.at(postIndex + 1)
      : undefined,
  };
  const tags = post?.tag;
  return (
    <>
      <DetailPage postFooter={postFooter} post={post} tags={tags} />
    </>
  );
};

export default PostLayout;
