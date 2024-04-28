'use client';

import Tag from '@/components/Tag';
import { supabase } from '@/util/supabase';
import { Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PostCard(post: Post) {
  const [view, setView] = useState<number | null>(null);

  useEffect(() => {
    const ids = post.url.split('/');
    supabase
      .from('views')
      .select('view_count')
      .eq('slug', ids[ids.length - 1])
      .then(data => {
        const count = data.data;
        if (Array.isArray(count) && count.length > 0)
          setView(count[0].view_count ? count[0].view_count : 0);
        else setView(0);
      });
  }, [post.url]);
  return (
    <div className="mb-4 p-2 dark:bg-slate-50 dark:text-black border-solded border-2 border-indigo-100 rounded-lg">
      <Link
        href={
          post.brand.trim() === 'project'
            ? `projects/${post.url}`
            : `blogs/${post.url}`
        }>
        <h2 className="text-xl font-bold m-1 hover:text-yellow-400 dark:hover:text-yellow-400">
          {post.title}
        </h2>
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <time dateTime={post.date} className="mb-2 p-1 text-xs text-gray-600">
            {format(parseISO(post.date), 'LLLL d, yyyy')}
          </time>
          &#44;
          <span className="mb-2 p-1 text-xs text-gray-600">
            VIEW : {view ?? view}
          </span>
        </div>

        <div className="flex gap-2 max-md:flex-wrap">
          {post.tag?.map(item => <Tag key={item} tag={item} />)}
        </div>
      </div>
    </div>
  );
}
