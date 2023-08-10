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
          ? 'text-2xl font-bold text-yellow-400 hover:bg-slate-200 rounded-lg px-2 py-1'
          : 'text-2xl font-bold hover:bg-slate-200 rounded-lg px-2 py-1'
      }>
      {children}
    </Link>
  );
}
