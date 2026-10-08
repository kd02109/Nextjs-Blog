export const navigationItems = [
  { label: '글', href: '/blogs' },
  { label: '프로젝트', href: '/projects' },
  { label: '소개', href: '/about' },
] as const satisfies ReadonlyArray<{
  label: string;
  href: '/blogs' | '/projects' | '/about';
}>;
