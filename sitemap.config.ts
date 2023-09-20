import { promises as fs, writeFileSync } from 'fs';
import postJson from './.contentlayer/generated/Post/_index.json';
import { siteConfig } from './src/config';

const SITE_URL = 'https://nextjs-blog-kd02109.vercel.app';
export default async function stiempaConfig() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
<url><loc>${SITE_URL}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
${siteConfig.menus
  .map(
    url =>
      `<url><loc>${SITE_URL}${url.path}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
  )
  .join('\n')}
${postJson
  .map(post => {
    if (post.url.includes('blog'))
      return `<url><loc>${SITE_URL}blogs/${post.url}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`;
    return `<url><loc>${SITE_URL}projects/${post.url}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`;
  })
  .join('\n')}
</urlset>`;

  await fs.writeFile('public/sitemap.xml', sitemap, {
    encoding: 'utf-8',
  });
}
const createRobotsTxt = () => {
  const siteUrl = siteConfig.url;

  const text = `
User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}
`;

  writeFileSync('public/robots.txt', text.trim(), 'utf-8');
};

void createRobotsTxt();
void stiempaConfig();
