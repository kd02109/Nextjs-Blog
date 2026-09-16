import Link from 'next/link';

type Prop = {
  tag: string;
  number?: number;
  isActive?: boolean;
};

export default function Tag({ tag, number, isActive }: Prop) {
  return (
    <Link
      className={`inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gray-500 px-3 py-2 text-center text-white hover:scale-90 hover:text-yellow-200 dark:bg-slate-500 max-md:text-sm max-md:font-normal max-md:hover:none
       ${isActive && 'border-yellow-200 text-yellow-300'}`}
      href={`/tags?key=${tag}`}>
      {tag} {number && `(${number})`}
    </Link>
  );
}
