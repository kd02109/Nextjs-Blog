import LinkCopy from '@/components/LinkCopy';
import StakList from '@/components/StakList';
import WritingList from '@/components/layout/WritingList';
import CopyUrl from '@/components/svg/CopyUrl';
import Github from '@/components/svg/Github';
import { projectObj } from '@/util/project';
import Image from 'next/image';
type Props = {
  params: {
    slug: string;
  };
};

export const generateMetadata = ({ params }: Props) => {
  const oneProject = projectObj.find(item => item.link === params.slug);
  return {
    title: oneProject!.name,
    description: oneProject!.description,
    openGraph: {
      title: oneProject?.name,
      images: 'https://source.unsplash.com/random/300×300',
      description: oneProject?.description,
    },
  };
};

export default function ProjectDetailPages({ params }: Props) {
  const oneProject = projectObj.find(item => item.link === params.slug);

  return (
    <article className="py-4">
      <div className="flex relyativy gap-2 items-center">
        <h1 className="font-black mb-5 text-3xl">{oneProject!.name}</h1>
        <LinkCopy />
      </div>

      <div className="flex max-md:flex-col gap-4">
        <Image
          src={oneProject!.image}
          alt={oneProject!.name}
          fill={false}
          width={600}
          height={600}
          style={{ width: 'auto', height: 'auto' }}
          priority={true}
          className="rounded-2xl border-solid border-2 basis-3/4"
        />
        <div className="border-solid border-2 rounded-2xl px-3 py-5  basis-1/4">
          <h2 className="font-bold text-xl mb-3">About</h2>
          <nav>
            <ul>
              <li className="flex gap-2 items-center mb-3 overflow-hidden">
                <div>
                  <Github />
                </div>
                <a
                  href={oneProject!.github}
                  target="_blank"
                  className="text-sm font-bold hover:text-yellow-400">
                  {oneProject!.github}
                </a>
              </li>
              <li className="flex gap-2 items-center">
                <CopyUrl />
                <a
                  href={oneProject!.href}
                  target="_blank"
                  className="text-sm overflow-hidden font-bold hover:text-yellow-400">
                  {oneProject!.href}
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <h2 className="font-bold text-xl">Description</h2>
              <p className="text-sm">{oneProject!.description}</p>
            </div>
            <div className="mt-4">
              <h2 className="font-bold text-xl">Date</h2>
              <span className="text-sm">{oneProject!.date}</span>
            </div>
          </nav>
        </div>
      </div>
      <StakList name={oneProject!.name} list={oneProject!.stack} />
      <WritingList tag={oneProject!.link} />
    </article>
  );
}

export function generateStaticParams() {
  const projets = projectObj.map(({ link }) => link);
  return projets.map(link => ({ slug: link }));
}
