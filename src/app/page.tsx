import type { Metadata } from 'next';
import getPosts from '@/util/getPosts';
import Link from 'next/link';
import { sharedOpenGraphMetadata } from '@/config';
import PopularPosts from '@/components/home/PopularPosts';
import HomePostList, { type HomePost } from '@/components/home/HomePostList';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/',
    title: 'SON의 개발 블로그',
    description: '개발하면서 느낀점, 배운점을 기록합니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};

export default function Home() {
  const posts = getPosts();
  const postSummaries: HomePost[] = posts.map(
    ({ id, title, description, date, url, brand, tag }) => ({
      id,
      title,
      description,
      date,
      url,
      brand,
      tag,
    }),
  );
  const latestPosts = postSummaries.slice(0, 4);

  return (
    <section className="mx-auto max-w-4xl py-10 sm:py-14">
      <header className="max-w-2xl border-b border-slate-300 pb-8 dark:border-slate-700">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-yellow-500 dark:text-yellow-400">
          Frontend Developer
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          kd02109
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
          Wanting to help society and people through Next.js, React, and
          TypeScript.
        </p>
      </header>

      <div className="mt-12 space-y-14">
        <section aria-labelledby="popular-posts-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Most read
              </p>
              <h2 id="popular-posts-title" className="text-2xl font-bold">
                You may Like
              </h2>
            </div>
            <nav
              aria-label="글 모음"
              className="flex gap-3 text-sm underline decoration-slate-300 underline-offset-4">
              <Link
                href="/blogs"
                className="transition-colors hover:text-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                Blog
              </Link>
              <Link
                href="/projects"
                className="transition-colors hover:text-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                Projects
              </Link>
            </nav>
          </div>
          <PopularPosts posts={postSummaries} />
        </section>

        <section aria-labelledby="latest-posts-title">
          <div className="mb-5">
            <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Recently published
            </p>
            <h2 id="latest-posts-title" className="text-2xl font-bold">
              Latest Posts
            </h2>
          </div>
          <HomePostList posts={latestPosts} />
        </section>
      </div>
    </section>
  );
}
