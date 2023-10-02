import type { Metadata } from 'next';
import getPosts from '@/util/getPosts';
import CardCarousel from '@/components/CardCarosuel';
import getCaruselPosts from '@/util/getCaruselPosts';
import Link from 'next/link';

export const metadata: Metadata = {
  openGraph: {
    title: 'SON의 개발 블로그',
    description: '개발하면서 느낀점, 배운점을 기록합니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};

export default function Home() {
  const posts = getPosts();
  const carosuelPosts = getCaruselPosts(posts);
  return (
    <section className="max-w-xl py-8 mx-auto">
      <div>
        <h3 className="font-bold text-3xl">kd02109</h3>
        <p className="my-4">Frontend Developer</p>
        <p className="text-sm opacity-80">
          Wanting to help to society and people through Next.js, Ract,
          Typescript
        </p>
        <p>
          <Link href={'#'}></Link>
        </p>
      </div>
      <CardCarousel posts={carosuelPosts} />
    </section>
  );
}
