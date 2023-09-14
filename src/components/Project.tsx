import { ProjectType } from '@/types/projectType';
import Image from 'next/image';

export default function Project(prop: ProjectType) {
  const { name, image, description } = prop;
  return (
    <div
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
      <div
        className="px-10 absolute top-0 right-0 w-full h-full hover:opacity-0 duration-500 transition flex items-center py-10 flex-col
      after:content-[ ] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-black after:opacity-50">
        <h1 className="text-yellow-400 text-3xl font-black mb-10 z-10">
          {name}
        </h1>
        <p className="text-yellow-400 text-md font-black z-10">{description}</p>
      </div>
    </div>
  );
}
