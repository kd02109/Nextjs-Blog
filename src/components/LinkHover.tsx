import Link from 'next/link';
export default function LinkHover({
  url,
  children,
}: {
  url: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      className="flex justufy-center items-center gap-4 text-xl max-md:text-sm font-bold dark:hover:bg-slate-400 hover:text-yellow-400 hover:bg-slate-200 rounded-lg max-md:px-2 px-4 py-1 "
      href={url}>
      {children}
    </Link>
  );
}
