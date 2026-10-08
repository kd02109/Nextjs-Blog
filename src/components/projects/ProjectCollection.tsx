'use client';

import ProjectCard from '@/components/projects/ProjectCard';
import { stackLabels } from '@/lib/project-presentation';
import type { ProjectType } from '@/types/projectType';
import Link from 'next/link';
import { useState } from 'react';

type Props = { projects: ProjectType[] };

export default function ProjectCollection({ projects }: Props) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = projects.filter(project => {
    const searchable = [
      project.name,
      project.description,
      ...project.stack.map(stack => stackLabels[stack]),
    ]
      .join(' ')
      .toLocaleLowerCase();
    return searchable.includes(normalizedQuery);
  });
  const featured = filtered.find(project => project.link === 'nextjs-blog');
  const others = filtered.filter(project => project !== featured);

  return (
    <section className="folio-collection" aria-label="프로젝트 모음">
      <div className="folio-controls">
        <span className="mono">01 / EXPLORE THE WORK</span>
        <label className="folio-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="프로젝트 또는 기술 검색"
            aria-label="프로젝트 또는 기술 검색"
          />
        </label>
      </div>

      <div aria-live="polite">
        {featured && <ProjectCard project={featured} index={0} featured />}
        <div className="folio-grid">
          {others.map(project => (
            <ProjectCard
              key={project.link}
              project={project}
              index={projects.indexOf(project)}
            />
          ))}
        </div>
      </div>
      {filtered.length === 0 && (
        <p className="folio-empty" role="status">
          검색 결과가 없습니다. 다른 이름이나 기술로 찾아보세요.
        </p>
      )}
      <div className="folio-bottom">
        <span className="mono" aria-live="polite">
          {filtered.length} PROJECTS
        </span>
        <Link href="/blog">개발 글도 살펴보기 ↗</Link>
      </div>
    </section>
  );
}
