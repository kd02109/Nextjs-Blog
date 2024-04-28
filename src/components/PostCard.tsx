'use client';

import Tag from '@/components/Tag';
import useSupabaseCount from '@/components/hook/useSupabaseCount';
import { getCookieClient, makeCookieClient } from '@/util/cookie/cookieClient';

import { supabaseIncrement, supabaseViewCount } from '@/util/supabase';
import { Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function PostCard(post: Post) {
  const ids = useMemo(() => post.url.split('/'), [post.url]);
  const view = useSupabaseCount(ids[ids.length - 1]);

  const router = useRouter();

  const onClick = async () => {
    const slug = ids[ids.length - 1].trim();
    if (!getCookieClient(slug)) {
      await supabaseIncrement(slug);
      makeCookieClient(slug);
    }

    const brand = post.brand.trim();
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
