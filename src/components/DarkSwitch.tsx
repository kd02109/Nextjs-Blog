'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

import Moon from '@/components/svg/Moon';
import Sun from '@/components/svg/Sun';

type DarkSwitchProps = {
  className?: string;
};

const subscribe = () => () => undefined;

export default function DarkSwitch({ className }: DarkSwitchProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={['site-theme-toggle', className].filter(Boolean).join(' ')}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      <span aria-hidden="true">{isDark ? <Sun /> : <Moon />}</span>
    </button>
  );
}
