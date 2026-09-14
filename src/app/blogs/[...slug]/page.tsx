import { getPostBySlug } from '@/lib/content';
import getPosts from '@/util/getPosts';
import DetailPage from '@/components/DetailPage';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { incrementView } from '@/server/supabase';
import { createViewVisitorHash } from '@/server/view-visitor';
import { headers } from 'next/headers';
import { sharedOpenGraphMetadata } from '@/config';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts('blog').map(post => ({ slug: post.url.split('/') }));
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const post = getPostBySlug(slug.join('/'));

  if (!post) notFound();

  const canonicalPath = `/blogs/${post.url}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      ...sharedOpenGraphMetadata,
      url: canonicalPath,
      title: post.title,
      images: 'https://source.unsplash.com/random/300×300',
      description: post.description,
    },
  };
};

const PostLayout = async ({ params }: Props) => {
  const { slug: slugParts } = await params;
  const str = slugParts.join('/');
  const post = getPostBySlug(str);
  if (!post) notFound();

  const slug = slugParts.at(-1);
  if (!slug) notFound();

  try {
    const visitorHash = createViewVisitorHash(await headers());
    await incrementView(slug, visitorHash);
  } catch {
    // View metrics must not prevent the post from rendering.
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
