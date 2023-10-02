import type { Metadata } from 'next';
import TagPage from '@/components/page/TagPage';

export const metadata: Metadata = {
  openGraph: {
    title: 'SON의 개발 블로그 Tag',
    description: 'tag를 통해 주제별로 글을 확인할 수 있습니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};

const TagPages = () => {
  return (
    <>
      <TagPage />
    </>
  );
};

export default TagPages;
