'use client';

import { Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import useSupabaseCount from '@/components/hook/useSupabaseCount';
import { getCookieClient, makeCookieClient } from '@/util/cookie/cookieClient';
import { supabaseIncrement } from '@/util/supabase';
import { useRouter } from 'next/navigation';

export default function ProjectWitingList(prop: Post) {
  const { title, date, url } = prop;
  const router = useRouter();
  const slug = url.split('/');
  const view = useSupabaseCount(slug[slug.length - 1]);
  const onClick = async () => {
    const key = slug[slug.length - 1].trim();
    if (!getCookieClient(key)) {
      await supabaseIncrement(key);
      makeCookieClient(key);
    }
    router.push(url);
  };
  return (
    <li className="border-b-2 mb-4 py-2">
      <section className="flex flex-col">
        <button onClick={onClick} className="hover:text-yellow-400 text-left">
          <h2 className="text-xl font-bold">{title}</h2>
        </button>
        <div className="flex items-center text-center">
          <time
            dateTime={date}
            className="mb-1 text-xs text-gray-600 dark:text-gray-300">
            {format(parseISO(date), 'LLLL d, yyyy')}
          </time>
          &#44;
          <span className="mb-1 text-xs text-gray-600">
            VIEW : {view ?? view}
          </span>
        </div>
      </section>
    </li>
  );
}
