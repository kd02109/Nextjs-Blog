import { allPosts } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';

export default function getPosts(key?: string) {
  let posts =
    key === undefined || key === 'all'
      ? allPosts
          .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
          .map(item => {
            return { ...item, tag: item.tag.map(str => str.trim()) };
          })
      : allPosts
          .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
          .filter(item => {
            const tags = item.tag.map(item => item.trim());
            return tags.includes(key);
          });
  return posts;
}
