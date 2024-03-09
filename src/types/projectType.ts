import { MarkdownKey } from '@/util/markdownBadge';
import { Post } from 'contentlayer/generated';

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

export type carouselType = Post & { index: number };

export type ProjectName =
  | 'mbtmi'
  | 'nextjs-blog'
  | 'sharepetment'
  | 'solo-project';
