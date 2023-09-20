'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { siteConfig } from '@/config';
import LinkItem from '@/components/LinkItem';
import DarkSwitch from '@/components/DarkSwitch';
import Hamburger from '@/components/Hamburger';
const Header = () => {
  const pathName = usePathname();
  const [isOpened, setIsOpened] = useState(false);
  return (
    <header className="flex justify-between items-center select-none pt-8 pb-12 sticky z-20 bg-white dark:bg-[#121212] top-0">
      <Hamburger
        isOpened={isOpened}
        setIsOpened={setIsOpened}
        pathName={pathName!}
      />
      <nav className="flex gap-6 max-md:hidden">
        <LinkItem href={'/'} isActive={pathName === '/'}>
          Home
        </LinkItem>
        {siteConfig.menus.map(({ path, label }) => (
          <LinkItem key={label} href={path} isActive={pathName!.includes(path)}>
            {label}
          </LinkItem>
        ))}
      </nav>
      <nav className="ml-auto flex items-center gap-2 max-md:hidden">
        <DarkSwitch />
      </nav>
    </header>
  );
};
export default Header;
