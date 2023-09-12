import Project from '@/components/Project';
import { projectObj } from '@/util/project';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function ProjectsPage() {
  return (
    <main className="grid grid-rows-2 grid-cols-2 max-sm:grid-rows-1 max-sm:grid-cols-1 gap-10">
      {projectObj.map(item => (
        <div key={item.name}>
          <Link href={`/projects/${item.link}`}>
            <Project {...item} />
          </Link>
        </div>
      ))}
    </main>
  );
}
