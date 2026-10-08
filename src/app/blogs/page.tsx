import '@/styles/archive.css';

import type { Metadata } from 'next';

import BlogPage from '@/components/page/BlogPage';
import { sharedOpenGraphMetadata } from '@/config';

export const metadata: Metadata = {
  alternates: { canonical: '/blogs' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/blogs',
    title: 'SON의 개발 블로그',
    description: '지금까지 작성한 글들을 확인할 수 있습니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};

export default function BlogsPage() {
  return <BlogPage />;
}
