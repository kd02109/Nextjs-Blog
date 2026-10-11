import { getPostBySlug } from '@/lib/content';
import getPosts from '@/util/getPosts';
import DetailPage from '@/components/DetailPage';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { incrementView } from '@/server/supabase';
import { createViewVisitorHash } from '@/server/view-visitor';
import { headers } from 'next/headers';
import { sharedOpenGraphMetadata } from '@/config';
import { getBlogRouteParts, getPublicPostPath } from '@/config/post-routes';

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts('blog').map(post => getBlogRouteParts(post.url));
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { category, slug } = await params;
  const post = getPostBySlug(`blog/${category}/${slug}`);

  if (!post || post.brand.trim() !== 'blog') notFound();

  const canonicalPath = getPublicPostPath(post);

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
  const { category, slug } = await params;
  const post = getPostBySlug(`blog/${category}/${slug}`);
  if (!post || post.brand.trim() !== 'blog') notFound();

  try {
    const visitorHash = createViewVisitorHash(await headers());
    await incrementView(slug, visitorHash);
  } catch {
    // View metrics must not prevent the post from rendering.
  }

  const allPostsSort = getPosts('blog');
  const postIndex = allPostsSort.findIndex(item => item.url === post.url);

  const postFooter = {
    prevPost: postIndex > 0 ? allPostsSort[postIndex - 1] : undefined,
    nextPost: allPostsSort[postIndex + 1],
  };
  const tags = post.tag;
  return (
    <>
      <DetailPage postFooter={postFooter} post={post} tags={tags} />
    </>
  );
};

export default PostLayout;
