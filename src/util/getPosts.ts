import { allPosts } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';

export default function getPosts(
  brand?: string,
  key?: string,
  search?: string,
) {
  let posts =
    key === undefined || key === 'all'
      ? allPosts
          .filter(item => item.brand.trim() === brand)
          .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
          .map(item => {
            return { ...item, tag: item.tag.map(str => str.trim()) };
          })
      : allPosts
          .filter(item => item.brand === brand)
          .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
          .filter(item => {
            const tags = item.tag.map(item => item.trim());
            return tags.includes(key);
          });

  if (!brand && (key === undefined || key === 'all')) {
    posts = allPosts
      .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
      .map(item => {
        return { ...item, tag: item.tag.map(str => str.trim()) };
      });
  } else if (!brand && key) {
    posts = allPosts
      .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
      .filter(item => {
        const tags = item.tag.map(item => item.trim());
        return tags.includes(key);
      });
  }

  if (search && search.trim() !== '') {
    const fillterposts = posts.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()),
    );
    return fillterposts;
  }
  return posts;
}
