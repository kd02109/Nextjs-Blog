'use client';
import Moon from '@/components/svg/Moon';
import Sun from '@/components/svg/Sun';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function DarkSwitch() {
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
      {!mounted ? (
        <></>
      ) : (
        <button
          className={
            'w-10 h-10 rounded-full dark:bg-slate-200 bg-slate-600 left-1 top-1 flex items-center justify-center cursor-pointer'
          }
          onClick={handleDarkMode}>
          {theme === ('light' || undefined) && <Moon />}
          {theme === `dark` && <Sun />}
        </button>
      )}
    </>
  );
}
