import ProjectCollection from '@/components/projects/ProjectCollection';
import { projectObj } from '@/util/project';
import Link from 'next/link';
import type { Metadata } from 'next';
import { sharedOpenGraphMetadata } from '@/config';
import { projectOrder } from '@/lib/project-presentation';
import '@/styles/projects.css';

export const metadata: Metadata = {
  alternates: { canonical: '/projects' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/projects',
    title: 'SON의 개발 블로그',
    description: '지금까지 진행한 프로젝트를 확인할 수 있습니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};
export default function ProjectsPage() {
  const projects = projectOrder.flatMap(slug =>
    projectObj.filter(project => project.link === slug),
  );

  return (
    <div className="folio-page">
      <nav className="folio-crumb" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">프로젝트</span>
      </nav>
      <header className="folio-hero">
        <div>
          <p className="folio-kicker mono">SELECTED WORK / 2023—2024</p>
          <h1>
            만든 것에는
            <br />
            <em>이유가 남습니다.</em>
          </h1>
          <p className="folio-lead">
            화면을 완성한 결과뿐 아니라, 선택하고 고치며 배운 과정을 함께
            기록했습니다. 다섯 프로젝트에서 출발한 작업 노트를 살펴보세요.
          </p>
        </div>
        <div className="folio-index" aria-label="프로젝트 5개">
          <div>
            <span className="mono">PROJECT INDEX</span>
            <strong>{String(projects.length).padStart(2, '0')}</strong>
            <small>개발과 회고의 기록</small>
          </div>
          <span className="folio-index-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
      </header>
      <ProjectCollection projects={projects} />
    </div>
  );
}
