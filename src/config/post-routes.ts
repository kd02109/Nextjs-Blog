type RoutedPost = { brand: string; url: string };

export function getBlogRouteParts(url: string): {
  category: string;
  slug: string;
} {
  const [section, category, slug, ...extra] = url.split('/');
  if (section !== 'blog' || !category || !slug || extra.length > 0) {
    throw new Error(`Invalid blog post URL: ${url}`);
  }

  return { category, slug };
}

export function getPublicPostPath(post: RoutedPost): string {
  if (post.brand.trim() === 'blog') {
    const { category, slug } = getBlogRouteParts(post.url);
    return `/blog/${category}/${slug}`;
  }

  return `/projects/${post.url}`;
}

export function getLegacyDiscussionTerm(post: RoutedPost): string {
  return post.brand.trim() === 'blog'
    ? `blogs/${post.url}`
    : `projects/${post.url}`;
}
