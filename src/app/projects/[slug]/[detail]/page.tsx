import { getPostBySlug } from '@/lib/content';
import DetailPage from '@/components/DetailPage';
import { ProjectName } from '@/types/projectType';
import { getCookieServer } from '@/util/cookie/cookieServer';
import { incrementView } from '@/server/supabase';
import { createViewVisitorHash } from '@/server/view-visitor';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

type Props = {
  params: Promise<{
    detail: string;
    slug: string;
  }>;
};

export const generateMetadata = async ({ params }: Props) => {
  const { detail, slug } = await params;
  const post = getPostBySlug(slug.trim() + '/' + detail.trim());

  if (!post) notFound();

  return {
    title: post.title,
    description: post.description,
    openGraph: {
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

  const isCookie = await getCookieServer(slug);
  if (!isCookie) {
    try {
      const visitorHash = createViewVisitorHash(await headers());
      await incrementView(slug, visitorHash);
    } catch {
      // View metrics must not prevent the project post from rendering.
    }
  }
  const projectTag = projectSlug.trim() as ProjectName;
  const tags = post.tag;

  return (
    <>
      <DetailPage post={post} tags={tags} projectFooter={projectTag} />
    </>
  );
}
