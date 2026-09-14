'use client';

import Tag from '@/components/Tag';
import { getAllTags } from '@/lib/content';
import { useSearchParams } from 'next/navigation';

const TagBox = () => {
  const obj = getAllTags();

  const keys = Object.keys(obj);
  const values = Object.values(obj);

  const searchParams = useSearchParams();
  const search = searchParams!.get('key') || 'all';

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
};
export default TagBox;
