import { Post } from 'contentlayer/generated';

export interface PostWithView extends Post {
  view: number;
}
