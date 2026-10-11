import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config';
import { publicStaticRoutes } from '@/config/routes';
import { getPublicPostPath } from '@/config/post-routes';
import { getAllPosts } from '@/lib/content';
import { projectObj } from '@/util/project';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = publicStaticRoutes.map(path => ({
    url: new URL(path.replace(/^\//, ''), siteConfig.url).href,
  }));
  const projectEntries: MetadataRoute.Sitemap = projectObj.map(project => ({
    url: new URL(`projects/${project.link}`, siteConfig.url).href,
  }));
  const postEntries: MetadataRoute.Sitemap = getAllPosts().map(post => ({
    url: new URL(getPublicPostPath(post), siteConfig.url).href,
  }));

  return [...staticEntries, ...projectEntries, ...postEntries];
}
