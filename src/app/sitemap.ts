import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config';
import { publicStaticRoutes } from '@/config/routes';
import { getAllPosts } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = publicStaticRoutes.map(path => ({
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
