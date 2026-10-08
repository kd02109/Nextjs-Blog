import type { Post } from '@/lib/content';
import Link from 'next/link';

type Props = { posts: Post[] };

const formatDate = (date: string) => date.slice(0, 10).replaceAll('-', '.');

export default function ProjectChapterList({ posts }: Props) {
  return (
    <section
      className="detail-section"
      id="project-notes"
      aria-labelledby="notes-title">
      <p className="folio-kicker mono">02 / FIELD NOTES</p>
      <h2 id="notes-title">만들면서 남긴 기록</h2>
      <p>
        구현한 순서와 부딪힌 문제를 글로 정리했습니다. 제목을 눌러 과정과 선택의
        근거를 읽을 수 있습니다.
      </p>
      {posts.length > 0 ? (
        <ol className="chapter-list" aria-label="프로젝트 기록">
          {posts.map((post, index) => (
            <li key={post.url}>
              <Link
                className="chapter-link"
                href={`/projects/${post.url}`}
                aria-label={post.title}>
                <span className="chapter-index mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <strong>{post.title}</strong>
                <time className="mono" dateTime={post.date}>
                  {formatDate(post.date)}
                </time>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="chapter-empty">아직 공개된 작업 기록이 없습니다.</p>
      )}
      <p className="chapter-count mono">{posts.length} NOTES IN THIS PROJECT</p>
    </section>
  );
}
