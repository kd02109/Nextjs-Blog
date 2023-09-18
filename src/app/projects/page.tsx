import Project from '@/components/Project';
import { projectObj } from '@/util/project';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  openGraph: {
    title: 'SON의 개발 블로그',
    description: '지금까지 진행한 프로젝트를 확인할 수 있습니다.',
    images: 'https://source.unsplash.com/random/300×300',
  },
};
export default function ProjectsPage() {
  return (
    <div className="animate-displayPage grid grid-rows-2 grid-cols-2 max-sm:grid-rows-1 max-sm:grid-cols-1 gap-10">
      {projectObj.map(item => (
        <article key={item.name}>
          <Link href={`/projects/${item.link}`}>
            <Project {...item} />
          </Link>
        </article>
      ))}
    </div>
  );
}
