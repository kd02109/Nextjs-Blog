'use client';
import Moon from '@/components/svg/Moon';
import Sun from '@/components/svg/Sun';
import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import CircleButton from '@/components/CustomButton';

type Prop = {
  className?: string;
};

const subscribe = () => () => undefined;

const DarkSwitch = ({ className }: Prop) => {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();

  const handleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CircleButton fn={handleDarkMode} className={className}>
        {theme !== 'dark' && <Moon />}
        {theme === `dark` && <Sun />}
      </CircleButton>
    </>
  );
};

export default DarkSwitch;
