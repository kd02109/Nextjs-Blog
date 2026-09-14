import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config';
import { getAllPosts } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', ...siteConfig.menus.map(menu => menu.path)];
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(path => ({
    url: new URL(path.replace(/^\//, ''), siteConfig.url).href,
    changeFrequency: 'daily',
    priority: 0.7,
  }));
  const postEntries: MetadataRoute.Sitemap = getAllPosts().map(post => ({
    url: new URL(
      `${post.brand.trim() === 'blog' ? 'blogs' : 'projects'}/${post.url}`,
      siteConfig.url,
    ).href,
    lastModified: post.date,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
