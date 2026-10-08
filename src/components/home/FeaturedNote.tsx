import { format, parseISO } from 'date-fns';
import Link from 'next/link';

import type { HomePost } from './HomePostList';
import { getArticleHref } from '@/components/ui/ArticleRow';

export default function FeaturedNote({ post }: { post: HomePost }) {
  const date = format(parseISO(post.date), 'yyyy.MM.dd');

  return (
    <div className="home-notebook-wrap">
      <article className="home-notebook" aria-label={`대표 글 ${post.title}`}>
        <span className="home-note-stage" aria-hidden="true">
          문제 · 실험 · 기록
        </span>
        <div className="home-notebook-top">
          <span className="home-note-corner">OPEN NOTE</span>
          <time dateTime={post.date}>{date}</time>
        </div>
        <p className="home-note-category">BLOG / {post.tag[0] ?? 'WRITING'}</p>
        <h2>{post.title}</h2>
        <p className="home-note-summary">{post.description}</p>
        <div className="home-note-lines">
          <p>
            <strong>주제</strong>
            <span>{post.tag.slice(0, 2).join(' · ')}</span>
          </p>
          <p>
            <strong>발행</strong>
            <span>{date}</span>
          </p>
          <p>
            <strong>기록</strong>
            <span>{post.description}</span>
          </p>
        </div>
        <Link className="home-note-link" href={getArticleHref(post)}>
          글 전문 보기 <span aria-hidden="true">↗</span>
        </Link>
      </article>
    </div>
  );
}
