import { allPosts } from 'contentlayer/generated';
import DetailPage from '@/components/DetailPage';
import { ProjectName } from '@/types/projectType';

type Props = {
  params: {
    detail: string;
    slug: string;
  };
};

export const generateMetadata = ({ params }: Props) => {
  const post = allPosts.find(post => {
    const str = params.slug.trim() + '/' + params.detail.trim();
    return `${post.url}` === str;
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

export default function ProjectDetailPage({ params }: Props) {
  console.log(params);
  const str = params.slug.trim() + '/' + params.detail.trim();
  const projectTag = params.slug.trim() as ProjectName;
  const post = allPosts.find(post => {
    return `${post.url}` === str;
  });
  const tags = post?.tag.map(item => item.trim());

  return (
    <>
      <DetailPage post={post} tags={tags} projectFooter={projectTag} />
    </>
  );
}
