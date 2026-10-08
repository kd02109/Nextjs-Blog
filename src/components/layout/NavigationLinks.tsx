import Link from 'next/link';

import { navigationItems } from '@/config/navigation';

type NavigationLinksProps = {
  pathname: string;
  onNavigate?: () => void;
};

export default function NavigationLinks({
  pathname,
  onNavigate,
}: NavigationLinksProps) {
  return navigationItems.map(item => {
    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        className="site-nav-link"
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}>
        {item.label}
      </Link>
    );
  });
}
