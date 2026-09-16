import type { Post } from '@/lib/content';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export type HomePost = Pick<
  Post,
  'id' | 'title' | 'description' | 'date' | 'url' | 'brand' | 'tag'
>;

type Props = {
  posts: HomePost[];
  viewCounts?: Readonly<Record<string, number>>;
  ranked?: boolean;
};

const getPostHref = (post: HomePost) =>
  post.brand.trim() === 'blog' ? `/blogs/${post.url}` : `/projects/${post.url}`;

const getPostSlug = (post: HomePost) => post.url.split('/').at(-1) ?? post.id;

export default function HomePostList({
  posts,
  viewCounts,
  ranked = false,
}: Props) {
  return (
    <ol className="grid gap-x-8 sm:grid-cols-2">
      {posts.map((post, index) => (
        <li
          key={post.id}
          className="group border-t border-slate-200 py-5 dark:border-slate-700">
          <Link
            href={getPostHref(post)}
            className="block rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-950">
            <div className="mb-3 flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                {ranked && (
                  <span className="font-mono text-base font-bold text-yellow-500 dark:text-yellow-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
                <span className="uppercase tracking-[0.14em]">
                  {post.brand.trim() === 'blog' ? 'Blog' : 'Project'}
                </span>
              </div>
              <time dateTime={post.date}>
                {format(parseISO(post.date), 'yyyy.MM.dd')}
              </time>
            </div>

            <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-yellow-500 dark:group-hover:text-yellow-400">
              {post.title}
            </h3>
            {post.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {post.description}
              </p>
            )}

            <div className="mt-4 flex min-h-5 items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate">
                {post.tag.slice(0, 2).join(' · ')}
              </span>
              {ranked && viewCounts && (
                <span className="shrink-0 tabular-nums">
                  {viewCounts[getPostSlug(post)] ?? 0} views
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
