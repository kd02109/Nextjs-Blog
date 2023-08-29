'use client';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config';
import LinkItem from '@/components/LinkItem';
import DarkSwitch from '@/components/DarkSwitch';
const Header = () => {
  const pathName = usePathname();

  return (
    <header className="flex w-full select-none items-end pt-8 pb-12">
      <nav className="flex gap-6 max-sm:gap-1">
        <LinkItem href={'/'} isActive={pathName === '/'}>
          Home
        </LinkItem>
        {siteConfig.menus.map(({ path, label }) => (
          <LinkItem key={label} href={path} isActive={pathName.includes(path)}>
            {label}
          </LinkItem>
        ))}
      </nav>
      <nav className="ml-auto flex items-center gap-2">
        <DarkSwitch />
      </nav>
    </header>
  );
};
export default Header;
