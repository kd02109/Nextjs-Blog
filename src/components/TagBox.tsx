'use client';

import Tag from '@/components/Tag';
import getPosts from '@/util/getPosts';
import { useSearchParams } from 'next/navigation';

export default function TagBox() {
  const posts = getPosts();
  const obj: { [key: string]: number } = { all: posts.length };

  for (let i = 0; i < posts.length; i++) {
    const tags = posts[i].tag;
    for (let j = 0; j < tags.length; j++) {
      if (obj[tags[j]]) {
        obj[tags[j]] += 1;
      } else {
        obj[tags[j]] = 1;
      }
    }
  }

  const keys = Object.keys(obj);
  const values = Object.values(obj);

  const searchParams = useSearchParams();
  const search = searchParams.get('key') || 'all';

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {keys.map((key, index) => (
        <Tag
          key={key}
          isActive={search === key}
          tag={key}
          number={values[index]}
        />
      ))}
    </div>
  );
}
