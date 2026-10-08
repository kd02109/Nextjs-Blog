import { format, parseISO } from 'date-fns';
import Link from 'next/link';

import type { Post } from '@/lib/content';

export type ArticleSummary = Pick<
  Post,
  'id' | 'title' | 'description' | 'date' | 'url' | 'brand' | 'tag'
>;

type ArticleRowProps = {
  post: ArticleSummary;
  rank?: number;
  viewCount?: number;
};

export const getArticleHref = (post: ArticleSummary) =>
  post.brand.trim() === 'blog' ? `/blogs/${post.url}` : `/projects/${post.url}`;

export default function ArticleRow({ post, rank, viewCount }: ArticleRowProps) {
  return (
    <li className="ui-article-row">
      <div className="ui-article-date">
        {rank !== undefined && (
          <span className="ui-article-rank">
            {String(rank).padStart(2, '0')}
          </span>
        )}
        <time dateTime={post.date}>
          {format(parseISO(post.date), 'yyyy.MM.dd')}
        </time>
      </div>
      <span className="ui-article-topic">{post.tag[0] ?? '기록'}</span>
      <div className="ui-article-body">
        <h3>
          <Link href={getArticleHref(post)}>{post.title}</Link>
        </h3>
        {post.description && <p>{post.description}</p>}
        {viewCount !== undefined && (
          <span className="ui-article-views">
            조회 {viewCount.toLocaleString('ko-KR')}
          </span>
        )}
      </div>
      <span className="ui-article-arrow" aria-hidden="true">
        ↗
      </span>
    </li>
  );
}
