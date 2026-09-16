import LinkCopy from '@/components/LinkCopy';
import StakList from '@/components/StakList';
import WritingList from '@/components/layout/WritingList';
import CopyUrl from '@/components/svg/CopyUrl';
import Github from '@/components/svg/Github';
import { projectObj } from '@/util/project';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sharedOpenGraphMetadata } from '@/config';

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

  return (
    <article className="min-w-0 py-4">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="mb-5 min-w-0 break-words text-3xl font-black">
          {oneProject.name}
        </h1>
        <LinkCopy />
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:flex-row">
        <Image
          src={oneProject.image}
          alt={oneProject.name}
          fill={false}
          width={600}
          height={600}
          priority={true}
          sizes="(max-width: 1023px) calc(100vw - 3rem), 75vw"
          className="h-auto w-full min-w-0 rounded-2xl border-2 border-solid lg:basis-3/4"
        />
        <div className="min-w-0 rounded-2xl border-2 border-solid px-3 py-5 lg:basis-1/4">
          <h2 className="font-bold text-xl mb-3">About</h2>
          <nav>
            <ul>
              <li className="flex gap-2 items-center mb-3 overflow-hidden">
                <div>
                  <Github />
                </div>
                <a
                  href={oneProject.github}
                  target="_blank"
                  className="text-sm font-bold hover:text-yellow-400">
                  {oneProject.github}
                </a>
              </li>
              <li className="flex gap-2 items-center">
                <CopyUrl />
                <a
                  href={oneProject.href}
                  target="_blank"
                  className="text-sm overflow-hidden font-bold hover:text-yellow-400">
                  {oneProject.href}
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <h2 className="font-bold text-xl">Description</h2>
              <p className="text-sm">{oneProject.description}</p>
            </div>
            <div className="mt-4">
              <h2 className="font-bold text-xl">Date</h2>
              <span className="text-sm">{oneProject.date}</span>
            </div>
          </nav>
        </div>
      </div>
      <StakList name={oneProject.name} list={oneProject.stack} />
      <WritingList tag={oneProject.link} />
    </article>
  );
}

export function generateStaticParams() {
  const projets = projectObj.map(({ link }) => link);
  return projets.map(link => ({ slug: link }));
}
