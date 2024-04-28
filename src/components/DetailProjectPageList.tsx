'use client';

import { ProjectName } from '@/types/projectType';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import clsx from 'clsx';
import getPosts from '@/util/getPosts';
import { useState } from 'react';
import Calender from '@/components/svg/Calender';
import { format, parseISO } from 'date-fns';
import List from '@/components/svg/List';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { getCookieClient, makeCookieClient } from '@/util/cookie/cookieClient';
import { supabaseIncrement } from '@/util/supabase';
import { useRouter } from 'next/navigation';

type Porps = {
  title: ProjectName;
  param: string | undefined;
  date: string | undefined;
};
export default function DetailProjectPageList({ title, param, date }: Porps) {
  const [isClick, setIsClick] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const posts = getPosts()
    .filter(post => post.url.includes(title) && post.url !== param)
    .reverse();

  const onClick = () => {
    setIsClick(prev => !prev);
  };

  const onLinkClick = async (url: string) => {
    const slugs = url.split('/');
    const slug = slugs[slugs.length - 1];
    if (!getCookieClient(slug)) {
      await supabaseIncrement(slug);
      makeCookieClient(slug);
    }
    router.push(`/projects/${url}`);
  };

  const variants: Variants = {
    initial: { opacity: 0, height: 0 },
    animate: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  return (
    <motion.div
      className={clsx(
        'mt-10 py-4 px-10 rounded-xl opacity-80',
        isClick === false && 'cursor-pointer hover:opacity-100',
        theme === 'dark' ? 'bg-gray-600' : 'bg-yellow-100',
      )}
      onClick={!isClick ? onClick : () => {}}>
      <div className="flex flex-col justify-center">
        <h1 className="font-bold text-2xl mb-3">
          {title.slice(0, 1).toUpperCase()}
          {title.slice(1)}
        </h1>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 font-bold text-xs">
            {format(parseISO(date!), 'yyyy.LL.dd')} <Calender />
          </div>
          <div className="flex items-center gap-2 font-bold text-xs">
            {posts.length} / {posts.length + 1} <List />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isClick && (
          <motion.ul
            className="mt-2 flex flex-col gap-2"
            variants={variants}
            initial="initial"
            exit="exit"
            animate="animate">
            {posts.map((post, idx) => (
              <button
                key={post.id}
                onClick={() => onLinkClick(post.url)}
                className="text-left">
                <li className="font-bold text-md mb-2">
                  {idx + 1}. {post.title}
                </li>
              </button>
            ))}
            <button onClick={onClick}>간략히</button>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
