import { getPostBySlug } from '@/lib/content';
import DetailPage from '@/components/DetailPage';
import { ProjectName } from '@/types/projectType';
import { getCookieServer } from '@/util/cookie/cookieServer';
import { supabaseIncrement } from '@/util/supabase';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    detail: string;
    slug: string;
  };
};

export const generateMetadata = ({ params }: Props) => {
  const post = getPostBySlug(params.slug.trim() + '/' + params.detail.trim());

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

export default async function ProjectDetailPage({ params }: Props) {
  const slug = params.detail.trim();
  const str = params.slug.trim() + '/' + slug;
  const post = getPostBySlug(str);
  if (!post) notFound();

  const isCookie = await getCookieServer(slug);
  if (!isCookie) {
    await supabaseIncrement(slug);
  }
  const projectTag = params.slug.trim() as ProjectName;
  const tags = post.tag;

  return (
    <>
      <DetailPage post={post} tags={tags} projectFooter={projectTag} />
    </>
  );
}
