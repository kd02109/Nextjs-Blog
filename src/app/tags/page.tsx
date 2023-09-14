'use client';

import PostCard from '@/components/PostCard';
import { useSearchParams } from 'next/navigation';
import getPosts from '@/util/getPosts';
import TagBox from '@/components/TagBox';
import Link from 'next/link';

const TagPages = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get('key') || 'all';
  const title = search.charAt(0).toUpperCase() + search.slice(1);

  let posts = getPosts(undefined, search);

  return (
    <>
      <div className="py-4">
        <h1 className="mb-3 text-3xl font-bold">Tags</h1>
        <TagBox />
      </div>
      <div className="py-4">
        <h1 className="mb-3 text-3xl font-bold">
          {`${title} (${posts.length})`}
        </h1>
        <div className="grid grid-rows-2 grid-cols-2 gap-3 max-sm:grid-rows-1 max-sm:grid-cols-1">
          {posts.map(post => (
            <Link
              key={post.id}
              href={
                post.brand.trim() === 'project'
                  ? `projects/${post.url}`
                  : `blogs/${post.url}`
              }>
              <PostCard {...post} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default TagPages;
