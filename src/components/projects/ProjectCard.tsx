import {
  getProjectPresentation,
  stackLabels,
} from '@/lib/project-presentation';
import type { ProjectType } from '@/types/projectType';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  project: ProjectType;
  index: number;
  featured?: boolean;
};

export default function ProjectCard({
  project,
  index,
  featured = false,
}: Props) {
  const presentation = getProjectPresentation(project);
  const number = String(index + 1).padStart(2, '0');
  const title = featured ? <h2>{project.name}</h2> : <h3>{project.name}</h3>;

  return (
    <article className={featured ? 'folio-feature' : 'folio-card'}>
      <Link href={`/projects/${project.link}`} className="folio-project-link">
        <div className={featured ? 'folio-feature-copy' : 'folio-card-copy'}>
          <span className={featured ? 'folio-feature-number mono' : 'mono'}>
            {number} / {project.link.toUpperCase()}
          </span>
          {title}
          <p>{presentation.summary}</p>
          <div className="folio-tags" aria-label="사용 기술">
            {project.stack.slice(0, featured ? 4 : 2).map(stack => (
              <span key={stack}>{stackLabels[stack]}</span>
            ))}
          </div>
          <span className={featured ? 'folio-feature-cta' : 'folio-card-cta'}>
            {featured ? '프로젝트 살펴보기' : '작업 기록 보기'}{' '}
            <span aria-hidden="true">↗</span>
          </span>
        </div>
        <div
          className={
            featured
              ? 'folio-feature-art'
              : `folio-card-art art-${project.link}`
          }>
          <div className="folio-image-frame">
            <Image
              className="folio-project-image"
              src={project.image}
              alt={project.name}
              width={720}
              height={450}
              sizes={
                featured
                  ? '(max-width: 760px) 100vw, 45vw'
                  : '(max-width: 760px) 35vw, 14vw'
              }
              priority={featured}
            />
          </div>
          <span className="art-label" aria-hidden="true">
            {presentation.artwork}
          </span>
        </div>
      </Link>
    </article>
  );
}
