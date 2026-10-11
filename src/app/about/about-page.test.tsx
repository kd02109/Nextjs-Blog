import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import AboutPage from './page';

describe('/about', () => {
  it('has one page title, the three working-method steps, and real destinations', () => {
    const html = renderToStaticMarkup(<AboutPage />);
    const title = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(title).toContain('만드는 과정까지');
    expect(title).toContain('남기는 사람.');
    expect(html).toContain('문제에서 시작');
    expect(html).toContain('직접 구현');
    expect(html).toContain('다시 쓸 수 있게 기록');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/projects"');
    expect(html).toContain('id="contact"');
    expect(html).toContain('href="/contact"');
  });
});
