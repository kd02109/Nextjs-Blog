export const navigationItems = [
  { label: '글', href: '/blog' },
  { label: '프로젝트', href: '/projects' },
  { label: '소개', href: '/about' },
] as const satisfies ReadonlyArray<{
  label: string;
  href: '/blog' | '/projects' | '/about';
}>;
