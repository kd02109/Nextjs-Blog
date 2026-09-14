import type { Post } from '@/lib/content';

export interface PostWithView extends Post {
  view: number;
}
