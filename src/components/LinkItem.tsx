import Link from 'next/link';
import React from 'react';

type Prop = {
  href: string;
  isActive?: boolean;
  children: React.ReactNode;
};
export default function LinkItem({ href, children, isActive }: Prop) {
  return (
    <Link
      href={href}
      className={
        isActive
          ? 'inline-flex min-h-[44px] items-center rounded-lg px-2 py-1 text-2xl font-bold text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-400 max-sm:text-base'
          : 'inline-flex min-h-[44px] items-center rounded-lg px-2 py-1 text-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-400 max-sm:text-base'
      }>
      {children}
    </Link>
  );
}
