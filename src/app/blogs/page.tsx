'use client';

import PostCard from '@/components/PostCard';
import { content } from '@/util/content';
import { useSearchParams } from 'next/navigation';
import getPosts from '@/util/getPosts';
import TagBox from '@/components/TagBox';

const BlogPages = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get('key') || 'all';
  const title = search.charAt(0).toUpperCase() + search.slice(1);

  const posts = getPosts(search);

  return (
    <>
      <div className="py-4">
        <h1 className="mb-3 text-3xl font-bold">Blog</h1>
        <p>{content.blog}</p>
      </div>
      <div className="py-4">
        <h1 className="mb-3 text-3xl font-bold">Tags</h1>
        <TagBox />
      </div>
      <div className="py-4">
        <h1 className="mb-3 text-3xl font-bold">
          {`${title} (${posts.length})`}
        </h1>
        <div className="grid grid-rows-2 grid-cols-2 gap-3 max-sm:grid-rows-1 max-sm:grid-cols-1">
          {posts.map((post, idx) => (
            <PostCard key={idx} {...post} />
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogPages;
