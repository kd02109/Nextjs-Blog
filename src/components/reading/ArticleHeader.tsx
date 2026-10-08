import LinkCopy from '@/components/LinkCopy';
import type { Post } from '@/lib/content';
import { projectObj } from '@/util/project';
import Link from 'next/link';

type Props = { post: Post; tags?: string[] };

const formatDate = (date: string) => date.slice(0, 10).replaceAll('-', '.');

export default function ArticleHeader({ post, tags = post.tag }: Props) {
  const projectSlug = post.brand === 'project' ? post.url.split('/')[0] : null;
  const project = projectObj.find(item => item.link === projectSlug);

  return (
    <>
      <nav className="reading-breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true">/</span>
        {project ? (
          <>
            <Link href="/projects">프로젝트</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/projects/${project.link}`}>{project.name}</Link>
          </>
        ) : (
          <Link href="/blogs">글</Link>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{post.title}</span>
      </nav>
      <header className="reading-hero">
        <div className="reading-hero-content">
          <p className="reading-kicker">
            {project ? `${project.name} / FIELD NOTE` : 'FIELD NOTE / WRITING'}
          </p>
          <h1 className="reading-title">{post.title}</h1>
          {post.description && (
            <p className="reading-lead">{post.description}</p>
          )}
          <div className="reading-byline">
            <span className="reading-avatar" aria-hidden="true">
              JS
            </span>
            <strong>손준석</strong>
            <span className="reading-divider" aria-hidden="true">
              ·
            </span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="reading-divider" aria-hidden="true">
              ·
            </span>
            <span>{project ? '프로젝트 기록' : '개발 글'}</span>
          </div>
          <div className="reading-meta">
            <div className="reading-tags" aria-label="글 주제">
              {tags.map(tag => (
                <Link key={tag} href={`/tags?key=${encodeURIComponent(tag)}`}>
                  # {tag}
                </Link>
              ))}
            </div>
            <LinkCopy />
          </div>
        </div>
        {!project && (
          <div className="reading-cover" aria-hidden="true">
            <span className="reading-cover-top">SON. / FIELD NOTE</span>
            <span className="reading-cover-mark">{'{ }'}</span>
            <span className="reading-cover-bottom">BUILD · LEARN · WRITE</span>
          </div>
        )}
      </header>
    </>
  );
}
