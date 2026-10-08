import Link from 'next/link';

import type { ProjectType } from '@/types/projectType';

export default function ProjectTeaser({
  projects,
}: {
  projects: ProjectType[];
}) {
  return (
    <div className="home-project-grid">
      {projects.map(project => (
        <article className="home-project-card" key={project.link}>
          <div className="home-project-content">
            <p className="home-project-type">PERSONAL PROJECT</p>
            <h3>{project.name}</h3>
            <p className="home-project-description">{project.description}</p>
            <div className="home-project-tags" aria-label="사용 기술">
              {project.stack.slice(0, 3).map(stack => (
                <span key={stack}>{stack}</span>
              ))}
            </div>
            <Link
              href={`/projects/${project.link}`}
              className="home-project-action"
              aria-label={`${project.name} 프로젝트 보기`}>
              프로젝트 보기 <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div
            className={`home-project-art home-project-art-${project.link}`}
            aria-hidden="true">
            {project.link === 'nextjs-blog' ? (
              <div className="home-mock-browser">
                <span className="home-mock-title" />
                <span className="home-mock-line" />
                <span className="home-mock-line home-mock-line-short" />
                <span className="home-mock-cards">
                  <i />
                  <i />
                </span>
              </div>
            ) : (
              <div className="home-mock-phone">
                <span className="home-pet-avatar" />
                <span className="home-pet-line" />
                <span className="home-pet-photo" />
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
