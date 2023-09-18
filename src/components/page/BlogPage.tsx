'use client';

import PostCard from '@/components/PostCard';
import { content } from '@/util/content';
import getPosts from '@/util/getPosts';
import { useState, ChangeEvent, useEffect } from 'react';
import { Post } from 'contentlayer/generated';
import Spiner from '@/components/Spiner';
import { motion } from 'framer-motion';
export default function BlogPage() {
  const [searchValue, setSearchValue] = useState<string | undefined>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearchvalue = (e: ChangeEvent<HTMLInputElement>) => {
    const inputSearch = e.target.value;
    setSearchValue(inputSearch);
    const posts = getPosts('blog', undefined, inputSearch);
    setPosts(posts);
  };

  useEffect(() => {
    setPosts(() => getPosts('blog'));
    setLoading(false);
  }, []);

  return (
    <>
      <div className="py-4">
        <h1 className="mb-3 text-3xl font-bold">Blog</h1>
        <p>{content.blog}</p>
      </div>

      <div className="relative w-full">
        <input
          aria-label="Search articles"
          type="text"
          value={searchValue}
          onChange={handleSearchvalue}
          placeholder={'Search'}
          className="duration-default strong-text block w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800"
        />
        <svg
          className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <div className="py-4">
        {loading && (
          <motion.div
            className="w-full flex justify-center items-center my-10"
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'just' }}
            layoutId="change">
            <Spiner />
          </motion.div>
        )}
        {!loading && (
          <motion.div
            className="grid grid-rows-2 grid-cols-2 gap-3 max-sm:grid-rows-1 max-sm:grid-cols-1"
            layoutId="change"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}>
            {posts.map(post => (
              <PostCard key={post.id} {...post} />
            ))}
            {(posts.length === 0 || !posts) && (
              <h1 className="text-3xl mt-4">검색 결과가 없습니다🥲.</h1>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
