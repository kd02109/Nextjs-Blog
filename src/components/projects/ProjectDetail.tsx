import ProjectChapterList from '@/components/projects/ProjectChapterList';
import type { Post } from '@/lib/content';
import {
  getProjectPresentation,
  stackLabels,
} from '@/lib/project-presentation';
import type { ProjectType } from '@/types/projectType';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  project: ProjectType;
  posts: Post[];
  index: number;
};

const projectPeriod = (date: string) => {
  const [start, end] = date.split('~').map(part => part.trim());
  return `${start} — ${end || '현재'}`;
};

export default function ProjectDetail({ project, posts, index }: Props) {
  const presentation = getProjectPresentation(project);
  const technologies = project.stack.map(stack => stackLabels[stack]);
  const period = projectPeriod(project.date);

  return (
    <article className="folio-page folio-detail-page">
      <nav className="folio-crumb" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true">/</span>
        <Link href="/projects">프로젝트</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{project.name}</span>
      </nav>

      <section className="detail-hero" aria-labelledby="project-title">
        <div className="detail-hero-inner">
          <div className="detail-hero-copy">
            <p className="folio-kicker mono">
              PROJECT NOTE / {String(index + 1).padStart(2, '0')}
            </p>
            <h1 id="project-title">{project.name}</h1>
            <p>{presentation.summary}</p>
            <div className="folio-tags" aria-label="사용 기술">
              {technologies.map(technology => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
            <div className="detail-actions">
              {project.href !== '#' && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer">
                  웹사이트 보기 <span aria-hidden="true">↗</span>
                </a>
              )}
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer">
                GitHub 보기 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="detail-graphic" aria-hidden="true">
            <div className="detail-sheet">
              <div className="detail-sheet-head mono">
                <span>WORK IN PROGRESS</span>
                <span>{String(index + 1).padStart(2, '0')} / 05</span>
              </div>
              <span className="detail-sheet-title">{project.name}</span>
              <p>{presentation.artwork}</p>
              <div className="detail-sheet-list">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <dl className="detail-metadata">
        <div>
          <dt className="mono">PERIOD</dt>
          <dd>{period}</dd>
        </div>
        <div>
          <dt className="mono">TYPE</dt>
          <dd>
            {project.link === 'sharepetment' ? '팀 프로젝트' : '프로젝트'}
          </dd>
        </div>
        <div>
          <dt className="mono">FIELD NOTES</dt>
          <dd>{posts.length}개의 작업 기록</dd>
        </div>
      </dl>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-section" aria-labelledby="overview-title">
            <p className="folio-kicker mono">01 / OVERVIEW</p>
            <h2 id="overview-title">프로젝트가 시작된 이유</h2>
            <p>{presentation.overview}</p>
            <div className="detail-project-visual">
              <Image
                className="detail-project-image"
                src={project.image}
                alt={project.name}
                width={1000}
                height={620}
                sizes="(max-width: 760px) calc(100vw - 36px), 65vw"
              />
            </div>
            <div className="detail-process" aria-label="프로젝트 진행 과정">
              {presentation.focus.map((focus, focusIndex) => (
                <div key={focus.title}>
                  <span className="mono">
                    {['DISCOVER', 'BUILD', 'ITERATE'][focusIndex]} /{' '}
                    {String(focusIndex + 1).padStart(2, '0')}
                  </span>
                  <h3>{focus.title}</h3>
                  <p>{focus.description}</p>
                </div>
              ))}
            </div>
          </section>

          <ProjectChapterList posts={posts} />
        </div>
        <aside className="detail-side" aria-label="프로젝트 정보 요약">
          <span className="mono">PROJECT FILE</span>
          <h2>{project.name}</h2>
          <dl>
            <dt className="mono">기간</dt>
            <dd>{period}</dd>
            <dt className="mono">기술</dt>
            <dd>{technologies.join(' · ')}</dd>
            <dt className="mono">바로가기</dt>
            <dd>
              <a href="#project-notes">작업 기록으로 이동 ↓</a>
            </dd>
          </dl>
        </aside>
      </div>
      <div className="detail-next">
        <Link href="/projects">← 모든 프로젝트</Link>
        <Link href="/blogs">개발 글 더 읽기 ↗</Link>
      </div>
    </article>
  );
}
