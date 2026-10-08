import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ContactPage from './page';

describe('/contact', () => {
  it('renders a single page title, the existing three-field form, and alternate contact links', async () => {
    const html = renderToStaticMarkup(await ContactPage());
    const title = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    const fieldNames = [
      ...html.matchAll(/<(?:input|textarea)\b[^>]*\bname="([^"]+)"/g),
    ]
      .map(match => match[1])
      .sort();

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(title).toContain('새로운 이야기를');
    expect(fieldNames).toEqual(['from', 'message', 'subject']);
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="mailto:kd02109@gmail.com"');
    expect(html).toContain('href="https://github.com/kd02109"');
    expect(html).toContain('href="/projects"');
  });
});
