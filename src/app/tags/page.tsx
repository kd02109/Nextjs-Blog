import '@/styles/archive.css';

import type { Metadata } from 'next';

import TagPage from '@/components/page/TagPage';
import { sharedOpenGraphMetadata } from '@/config';

export const metadata: Metadata = {
  alternates: { canonical: '/tags' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/tags',
    title: 'SON의 개발 블로그 Tag',
    description: 'tag를 통해 주제별로 글을 확인할 수 있습니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};

type Props = {
  searchParams: Promise<{ key?: string | string[] }>;
};

export default async function TagsPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const selectedTag = Array.isArray(key) ? key[0] : key;
  return <TagPage initialTag={selectedTag} />;
}
