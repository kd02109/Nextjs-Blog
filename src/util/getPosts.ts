import { allPosts } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';

export default function getPosts(key?: string, search?: string) {
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
  if (search && search.trim() !== '') {
    const fillterposts = posts.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()),
    );
    return fillterposts;
  }
  return posts;
}
