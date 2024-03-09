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

type Porps = {
  title: ProjectName;
  param: string | undefined;
  date: string | undefined;
};
export default function DetailProjectPageList({ title, param, date }: Porps) {
  const [isClick, setIsClick] = useState(false);
  const { theme } = useTheme();
  const posts = getPosts()
    .filter(post => post.url.includes(title) && post.url !== param)
    .reverse();

  const onClick = () => {
    setIsClick(prev => !prev);
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
            className="mt-2"
            variants={variants}
            initial="initial"
            exit="exit"
            animate="animate">
            {posts.map((post, idx) => (
              <Link href={`/projects/${post.url}`} key={post.id}>
                <li className="font-bold text-md mb-2">
                  {idx + 1}. {post.title}
                </li>
              </Link>
            ))}
            <button onClick={onClick}>간략히</button>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
