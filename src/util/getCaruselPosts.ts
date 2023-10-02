import { Post } from 'contentlayer/generated';

export default function getCaruselPosts(posts: Post[]) {
  return posts.filter(post => post.carousel);
}
