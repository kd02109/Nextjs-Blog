import { ProjectType } from '@/types/projectType';
import Image from 'next/image';

export default function Project(prop: ProjectType) {
  const { name, image, href, description, github, link } = prop;
  return (
    <article
      className={`relative h-96 mb-10 rounded-lg border-gray-300 border-solid border-2 `}>
      {
        <Image
          src={image}
          alt={name}
          fill={true}
          priority={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
      }
      <div className="absolute top-0 right-0 w-full h-full hover:opacity-0 duration-500 transition bg-transparent bg-black opacity-80 flex items-center py-10 flex-col">
        <h1 className="text-yellow-600 text-3xl font-black mb-10">{name}</h1>
        <p className="text-yellow-600 text-md font-black">{description}</p>
      </div>
    </article>
  );
}
