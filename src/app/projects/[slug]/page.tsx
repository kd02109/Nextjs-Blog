import ProjectDetail from '@/components/projects/ProjectDetail';
import getPosts from '@/util/getPosts';
import { projectObj } from '@/util/project';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sharedOpenGraphMetadata } from '@/config';
import { projectOrder } from '@/lib/project-presentation';
import '@/styles/projects.css';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const oneProject = projectObj.find(item => item.link === slug);

  if (!oneProject) notFound();

  return {
    title: oneProject.name,
    description: oneProject.description,
    alternates: { canonical: `/projects/${oneProject.link}` },
    openGraph: {
      ...sharedOpenGraphMetadata,
      url: `/projects/${oneProject.link}`,
      title: oneProject.name,
      images: 'https://source.unsplash.com/random/300×300',
      description: oneProject.description,
    },
  };
};

export default async function ProjectDetailPages({ params }: Props) {
  const { slug } = await params;
  const oneProject = projectObj.find(item => item.link === slug);

  if (!oneProject) notFound();
  const posts = getPosts('project').filter(post =>
    post.url.startsWith(`${oneProject.link}/`),
  );

  return (
    <ProjectDetail
      project={oneProject}
      posts={posts}
      index={projectOrder.indexOf(slug as (typeof projectOrder)[number])}
    />
  );
}

export function generateStaticParams() {
  const projets = projectObj.map(({ link }) => link);
  return projets.map(link => ({ slug: link }));
}
