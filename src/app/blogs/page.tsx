import BlogPage from '@/components/page/BlogPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  openGraph: {
    title: 'SON의 개발 블로그',
    description: '지금까지 작성한 글들을 확인할 수 있습니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};

const BlogPages = () => {
  return (
    <>
      <BlogPage />
    </>
  );
};

export default BlogPages;
