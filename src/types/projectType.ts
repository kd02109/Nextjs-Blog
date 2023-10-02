import { MarkdownKey } from '@/util/markdownBadge';

export type ProjectType = {
  name: string;
  image: string;
  description: string;
  href: string;
  github: string;
  link: string;
  date: string;
  stack: MarkdownKey[];
};
