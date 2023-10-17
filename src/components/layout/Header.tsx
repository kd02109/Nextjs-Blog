'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { siteConfig } from '@/config';
import LinkItem from '@/components/LinkItem';
import DarkSwitch from '@/components/DarkSwitch';
import Hamburger from '@/components/Hamburger';
import checkAgent from '@/util/checkAgent';

const Header = () => {
  const pathName = usePathname();
  const [isOpened, setIsOpened] = useState(false);
  const browserUser = checkAgent();

  return (
    <header
      className={`flex justify-between items-center select-none pt-8 pb-12 sticky z-20 bg-white top-0 ${
        browserUser === 'Mozilla Firefox'
          ? 'dark:bg-[#1C1B22]'
          : 'dark:bg-[#121212]'
      }`}>
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
