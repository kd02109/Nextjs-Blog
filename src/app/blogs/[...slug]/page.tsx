import { getPostBySlug } from '@/lib/content';
import getPosts from '@/util/getPosts';
import DetailPage from '@/components/DetailPage';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCookieServer } from '@/util/cookie/cookieServer';
import { supabaseIncrement } from '@/util/supabase';

export const generateMetadata = ({ params }: { params: any }): Metadata => {
  const post = getPostBySlug(params.slug.join('/'));

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

const PostLayout = async ({ params }: { params: { slug: string[] } }) => {
  const str = params.slug.join('/');
  const post = getPostBySlug(str);
  if (!post) notFound();

  const slug = params.slug.at(-1);
  const isCookie = await getCookieServer(slug as string);

  if (!isCookie) {
    await supabaseIncrement(slug as string);
  }

  const allPostsSort = getPosts('blog');
  const postIndex = allPostsSort.findIndex(item => item.url === post.url);

  const postFooter = {
    prevPost: allPostsSort.at(postIndex - 1)
      ? allPostsSort.at(postIndex - 1)
      : undefined,

    nextPost: allPostsSort.at(postIndex + 1)
      ? allPostsSort.at(postIndex + 1)
      : undefined,
  };
  const tags = post.tag;
  return (
    <>
      <DetailPage postFooter={postFooter} post={post} tags={tags} />
    </>
  );
};

export default PostLayout;
