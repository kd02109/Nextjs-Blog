'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import DarkSwitch from '@/components/DarkSwitch';
import Hamburger from '@/components/Hamburger';
import NavigationLinks from '@/components/layout/NavigationLinks';
import PageShell from '@/components/layout/PageShell';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header" id="top">
      <PageShell className="site-masthead">
        <Link href="/" className="site-brand" aria-label="SON 홈으로">
          <span className="site-brand-mark" aria-hidden="true">
            SON<span>.</span>
          </span>
          <span className="site-brand-caption">
            Junseok Son
            <br />
            Frontend Engineer
          </span>
        </Link>

        <nav className="site-desktop-nav" aria-label="주요 메뉴">
          <NavigationLinks pathname={pathname} />
        </nav>

        <div className="site-header-actions">
          <DarkSwitch />
          <Hamburger key={pathname} pathName={pathname} />
        </div>
      </PageShell>
    </header>
  );
}
