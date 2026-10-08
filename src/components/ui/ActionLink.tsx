import Link from 'next/link';
import type { ReactNode } from 'react';

type ActionLinkProps = {
  children: ReactNode;
  href: string;
  variant?: 'primary' | 'text';
  className?: string;
};

export default function ActionLink({
  children,
  href,
  variant = 'text',
  className,
}: ActionLinkProps) {
  return (
    <Link
      href={href}
      className={['ui-action-link', `ui-action-link-${variant}`, className]
        .filter(Boolean)
        .join(' ')}>
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
