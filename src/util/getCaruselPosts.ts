import type { Post } from '@/lib/content';

export default function getCaruselPosts(posts: Post[]) {
  return posts.filter(post => post.carousel);
}
