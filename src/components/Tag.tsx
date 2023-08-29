import Link from 'next/link';

type Prop = {
  tag: string;
  number?: number;
  isActive?: boolean;
};

export default function Tag({ tag, number, isActive }: Prop) {
  return (
    <Link
      className={`py-1 px-2 dark:bg-slate-500 rounded-lg hover:text-yellow-200 bg-gray-500 text-white ${
        isActive && 'border-yellow-200 text-yellow-300'
      }`}
      href={`/tags?key=${tag}`}>
      {tag} {number && `(${number})`}
    </Link>
  );
}
