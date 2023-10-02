import { carouselType } from '@/types/projectType';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

export default function Article(prop: carouselType) {
  const { title, description, date, url, tag, index, brand } = prop;
  return (
    <article className="rounded-md overflow-hidden shadow-lg hover:scale-110 transition">
      <Link href={brand === 'blog' ? `/blogs/${url}` : `/projects/${url}`}>
        <Image
          className="w-full max-h-20"
          src={`https://source.unsplash.com/collection/${index}/300×300`}
          alt={title}
          width={300}
          height={200}
        />
        <div className="flex flex-col items-center p-2">
          <time className="self-end text-gray-400 mb-2 text-xs">
            {format(parseISO(date), 'LLLL d, yyyy')}
          </time>
          <h3 className="text-base font-bold">
            {title.length > 18 ? `${title.slice(0, 18)}...` : title}
          </h3>
          <p className="w-full truncate text-center text-xs text-gray-400">
            {description}
          </p>
        </div>
      </Link>
    </article>
  );
}
