'use client';

import { useEffect, useRef, useState } from 'react';

import NavigationLinks from '@/components/layout/NavigationLinks';

type HamburgerProps = {
  pathName: string;
};

export default function Hamburger({ pathName }: HamburgerProps) {
  const [isOpened, setIsOpened] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpened) return;

    navRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpened(false);
      toggleRef.current?.focus();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpened]);

  return (
    <div className="site-mobile-navigation">
      <button
        ref={toggleRef}
        type="button"
        className="site-menu-toggle"
        aria-label={isOpened ? '메뉴 닫기' : '메뉴 열기'}
        aria-controls="mobile-navigation"
        aria-expanded={isOpened}
        onClick={() => setIsOpened(open => !open)}>
        <span aria-hidden="true">{isOpened ? '×' : '☰'}</span>
      </button>
      <nav
        ref={navRef}
        id="mobile-navigation"
        className="site-mobile-nav"
        aria-label="모바일 메뉴"
        hidden={!isOpened}>
        <NavigationLinks
          pathname={pathName}
          onNavigate={() => setIsOpened(false)}
        />
      </nav>
    </div>
  );
}
