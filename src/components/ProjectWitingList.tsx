import Link from 'next/link';
import { Post } from 'contentlayer/generated';
import Tag from '@/components/Tag';
import { format, parseISO } from 'date-fns';

export default function ProjectWitingList(prop: Post) {
  const { title, tag, date, url } = prop;
  const tags = tag.map(item => item.trim());
  return (
    <li className="border-b-2 mb-4 py-2">
      <section className="flex flex-col">
        <Link href={url} className="hover:text-yellow-400">
          <h2 className="text-2xl font-bold">{title}</h2>
        </Link>
        <div className="flex justify-between items-center">
          <time
            dateTime={date}
            className="mb-1 text-xs text-gray-600 dark:text-gray-300">
            {format(parseISO(date), 'LLLL d, yyyy')}
          </time>
          <ul className="flex gap-4 py-2 max-md:flex-wrap">
            {tags?.map(item => (
              <li key={item}>
                <Tag tag={item} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </li>
  );
}
