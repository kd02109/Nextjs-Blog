import { allPosts } from 'contentlayer/generated';
import DetailPage from '@/components/DetailPage';

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

  return { title: post?.title, description: post?.description };
};

export default function ProjectDetailPage({ params }: Props) {
  const str = params.slug.trim() + '/' + params.detail.trim();
  const post = allPosts.find(post => {
    return `${post.url}` === str;
  });
  const tags = post?.tag.map(item => item.trim());

  return <DetailPage post={post} tags={tags} />;
}
