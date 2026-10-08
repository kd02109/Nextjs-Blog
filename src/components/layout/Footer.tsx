import Link from 'next/link';

import PageShell from '@/components/layout/PageShell';
import { siteConfig } from '@/config';

export default function Footer() {
  const year = new Date().getFullYear();
  const years =
    year === siteConfig.since ? `${year}` : `${siteConfig.since}–${year}`;

  return (
    <footer className="site-footer">
      <PageShell className="site-footer-inner">
        <div>
          <p className="site-footer-brand">
            SON<span>.</span>
          </p>
          <p className="site-footer-note">
            만들면서 배우고, 배운 것은 기록합니다.
            <br />© {years} Junseok Son
          </p>
        </div>
        <nav className="site-footer-links" aria-label="보조 메뉴">
          <Link
            href="https://github.com/kd02109"
            target="_blank"
            rel="noopener noreferrer">
            GitHub ↗
          </Link>
          <Link href="/contact">연락 ↗</Link>
          <Link href="#top">맨 위로 ↑</Link>
        </nav>
      </PageShell>
    </footer>
  );
}
