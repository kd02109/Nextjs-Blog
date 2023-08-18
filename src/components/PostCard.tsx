import Tag from '@/components/Tag';
import { Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export default function PostCard(post: Post) {
  return (
    <div className="mb-4 p-2 rounded-xl  dark:bg-slate-50 dark:text-black">
      <h2 className="text-xl font-bold m-1 hover:text-yellow-400 dark:hover:text-yellow-400">
        <Link href={post.url} legacyBehavior>
          {post.title}
        </Link>
      </h2>
      <div className="flex justify-between items-center">
        <time dateTime={post.date} className="mb-2 p-1 text-xs text-gray-600 ">
          {format(parseISO(post.date), 'LLLL d, yyyy')}
        </time>
        <div className="flex gap-2">
          {post.tag?.map(item => <Tag key={item} tag={item} />)}
        </div>
      </div>
    </div>
  );
}
