import { markdownBadge, MarkdownKey } from '@/util/markdownBadge';

type Prop = {
  name: string;
  list: MarkdownKey[];
};

export default function StakList({ name, list }: Prop) {
  return (
    <div className="mt-10">
      <h2 className="font-bold text-2xl mb-2">Stack</h2>
      <ul className="flex flex-wrap gap-2">
        {list.map((item: MarkdownKey) => (
          <li key={item} className="w-1/5 h-10 max-md:w-3/5">
            <div
              className="w-full h-full bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url("${markdownBadge[item]}")`,
                backgroundPosition: '50% 50%',
              }}></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
