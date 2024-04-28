'use client';

import Tag from '@/components/Tag';
import postView from '@/util/postView';
import { supabaseIncrement, supabaseViewCount } from '@/util/supabase';
import { Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PostCard(post: Post) {
  const [view, setView] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const ids = post.url.split('/');
    supabaseViewCount(ids[ids.length - 1]).then(data => setView(data));
  }, [post.url]);

  const onClick = async () => {
    const slug = post.url.split('/');
    await supabaseIncrement(slug[slug.length - 1]);
    const brand = post.brand.trim();
    console.log(brand);
    if (brand === 'project') router.push(`projects/${post.url}`);
    else router.push(`blogs/${post.url}`);
  };

  return (
    <div className="mb-4 p-2 dark:bg-slate-50 dark:text-black border-solded border-2 border-indigo-100 rounded-lg">
      <button onClick={onClick}>
        <h2 className="text-xl font-bold m-1 hover:text-yellow-400 dark:hover:text-yellow-400">
          {post.title}
        </h2>
      </button>
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
