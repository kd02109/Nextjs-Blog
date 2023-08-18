import { compareDesc } from 'date-fns';
import { allPosts } from 'contentlayer/generated';
import PostCard from '@/components/PostCard';
export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date)),
  );

  return (
    <div className="max-w-xl py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">Next.js Example</h1>

      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  );
}
