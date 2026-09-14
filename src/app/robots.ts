import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('sitemap.xml', siteConfig.url).href,
    host: siteConfig.url,
  };
}
