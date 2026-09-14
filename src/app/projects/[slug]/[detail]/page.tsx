import { getAllPosts, getPostBySlug } from '@/lib/content';
import DetailPage from '@/components/DetailPage';
import { ProjectName } from '@/types/projectType';
import { incrementView } from '@/server/supabase';
import { createViewVisitorHash } from '@/server/view-visitor';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { sharedOpenGraphMetadata } from '@/config';

type Props = {
  params: Promise<{
    detail: string;
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts()
    .filter(post => post.brand.trim() === 'project')
    .map(post => {
      const [slug, detail] = post.url.split('/');
      return { slug, detail };
    });
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { detail, slug } = await params;
  const post = getPostBySlug(slug.trim() + '/' + detail.trim());

  if (!post) notFound();

  const canonicalPath = `/projects/${post.url}`;

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

export default async function ProjectDetailPage({ params }: Props) {
  const { detail, slug: projectSlug } = await params;
  const slug = detail.trim();
  const str = projectSlug.trim() + '/' + slug;
  const post = getPostBySlug(str);
  if (!post) notFound();

  try {
    const visitorHash = createViewVisitorHash(await headers());
    await incrementView(slug, visitorHash);
  } catch {
    // View metrics must not prevent the project post from rendering.
  }
  const projectTag = projectSlug.trim() as ProjectName;
  const tags = post.tag;

  return (
    <>
      <DetailPage post={post} tags={tags} projectFooter={projectTag} />
    </>
  );
}
