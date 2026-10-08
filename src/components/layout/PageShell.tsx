import type { ReactNode } from 'react';

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={['site-page-shell', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
