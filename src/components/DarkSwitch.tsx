'use client';
import Moon from '@/components/svg/Moon';
import Sun from '@/components/svg/Sun';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import CircleButton from '@/components/CustomButton';

type Prop = {
  className?: string;
};

const DarkSwitch = ({ className }: Prop) => {
  const [mounted, setMounted] = useState(false);
  const handleDarkMode = () => {
    theme === (undefined || 'light') ? setTheme('dark') : setTheme('light');
  };
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CircleButton fn={handleDarkMode} className={className}>
        {theme === ('light' || undefined) && <Moon />}
        {theme === `dark` && <Sun />}
      </CircleButton>
    </>
  );
};

export default DarkSwitch;
