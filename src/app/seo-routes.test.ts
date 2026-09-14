import { describe, expect, it, vi } from 'vitest';

import { getAllPosts } from '@/lib/content';
import { siteConfig } from '@/config';

vi.mock('next/font/google', () => ({
  Nanum_Gothic: () => ({ className: 'nanum-gothic' }),
  Nanum_Gothic_Coding: () => ({ className: 'nanum-gothic-coding' }),
}));

type SitemapEntry = { url: string };

const loadSeoRoute = async <T>(filename: string): Promise<T | undefined> => {
  const moduleUrl = new URL(filename, import.meta.url).href;

  try {
    const route = (await import(/* @vite-ignore */ moduleUrl)) as {
      default?: () => T;
    };
    return route.default?.();
  } catch {
    return undefined;
  }
};

const loadModule = async <T>(filename: string): Promise<T | undefined> => {
  const moduleUrl = new URL(filename, import.meta.url).href;

  try {
    return (await import(/* @vite-ignore */ moduleUrl)) as T;
  } catch (error) {
    throw error;
  }
};

describe('App Router SEO routes', () => {
  it('publishes every one of the 73 post URLs on the canonical host', async () => {
    const sitemap = await loadSeoRoute<SitemapEntry[]>('./sitemap.ts');
    expect(sitemap).toBeDefined();

    const sitemapUrls = new Set(sitemap!.map(entry => entry.url));
    const expectedPostUrls = getAllPosts().map(
      post =>
        new URL(
          `${post.brand.trim() === 'blog' ? 'blogs' : 'projects'}/${post.url}`,
          siteConfig.url,
        ).href,
    );

    expect(expectedPostUrls).toHaveLength(73);
    expect(expectedPostUrls.every(url => sitemapUrls.has(url))).toBe(true);
    expect(sitemapUrls.size).toBe(sitemap!.length);
    expect(
      sitemap!.every(
        ({ url }) => new URL(url).origin === 'https://sonblog.vercel.app',
      ),
    ).toBe(true);
    expect(
      sitemap!.some(({ url }) => url.includes('nextjs-blog-kd02109')),
    ).toBe(false);
  });

  it('points robots at the App Router sitemap on the canonical host', async () => {
    const robots = await loadSeoRoute<{
      rules: { userAgent: string; allow: string };
      sitemap: string;
      host?: string;
    }>('./robots.ts');

    expect(robots).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://sonblog.vercel.app/sitemap.xml',
      host: 'https://sonblog.vercel.app/',
    });
  });

  it('anchors App Router metadata to the canonical production URL', async () => {
    const layout = await loadModule<{
      metadata: {
        metadataBase?: URL;
        alternates?: { canonical?: string };
        openGraph?: { url?: string };
      };
    }>('./layout.tsx');

    expect(layout?.metadata.metadataBase?.href).toBe(
      'https://sonblog.vercel.app/',
    );
    expect(layout?.metadata.alternates?.canonical).toBe('/');
    expect(layout?.metadata.openGraph?.url).toBe('/');
  });
});
