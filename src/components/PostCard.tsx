'use client';

import Tag from '@/components/Tag';
import useSupabaseCount from '@/components/hook/useSupabaseCount';

import { requestViewIncrement } from '@/util/api/views';
import type { Post } from '@/lib/content';
import { format, parseISO } from 'date-fns';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function PostCard(post: Post) {
  const ids = useMemo(() => post.url.split('/'), [post.url]);
  const view = useSupabaseCount(ids[ids.length - 1]);

  const router = useRouter();

  const onClick = async () => {
    const slug = ids[ids.length - 1].trim();
    try {
      await requestViewIncrement(slug);
    } catch {
      // View metrics must not prevent navigation.
    }

    const brand = post.brand.trim();
    if (brand === 'project') router.push(`projects/${post.url}`);
    else router.push(`blogs/${post.url}`);
  };

  return (
    <div className="border-solded mb-4 min-w-0 rounded-lg border-2 border-indigo-100 p-2 dark:bg-slate-50 dark:text-black">
      <button onClick={onClick} className="min-w-0 max-w-full text-left">
        <h2 className="text-xl font-bold m-1 hover:text-yellow-400 dark:hover:text-yellow-400">
          {post.title}
        </h2>
      </button>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="shrink-0">
          <time dateTime={post.date} className="mb-2 p-1 text-xs text-gray-600">
            {format(parseISO(post.date), 'LLLL d, yyyy')}
          </time>
          &#44;
          <span className="mb-2 p-1 text-xs text-gray-600">
            VIEW : {view ?? view}
          </span>
        </div>

        <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
          {post.tag?.map(item => (
            <Tag key={item} tag={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
