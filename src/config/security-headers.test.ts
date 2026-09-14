import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

type Header = { key: string; value: string };
type HeaderRule = { source: string; headers: Header[] };

const require = createRequire(import.meta.url);
const nextConfig = require('../../next.config.js') as {
  headers: () => Promise<HeaderRule[]> | HeaderRule[];
};

async function responseHeaders() {
  const rules = await nextConfig.headers();
  const catchAll = rules.find(rule => rule.source === '/:path*');

  return new Map(catchAll?.headers.map(header => [header.key, header.value]));
}

describe('security response headers', () => {
  it('applies transport and browser hardening to every route', async () => {
    const headers = await responseHeaders();

    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    );
    expect(headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
    expect(headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
  });

  it('keeps CSP report-only while covering the application integrations', async () => {
    const headers = await responseHeaders();
    const policy = headers.get('Content-Security-Policy-Report-Only');

    expect(headers.has('Content-Security-Policy')).toBe(false);
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain('https://giscus.app');
    expect(policy).toContain('https://www.googletagmanager.com');
    expect(policy).toContain('https://*.google-analytics.com');
    expect(policy).toContain('https://*.supabase.co');
    expect(policy).toContain('https://source.unsplash.com');
    expect(policy).toContain('https://images.unsplash.com');
    expect(policy).toContain('https://i.imgur.com');
    expect(policy).toContain('https://github.com');
    expect(policy).toContain('https://*.githubusercontent.com');
  });

  it('routes modern and legacy report-only violations to the owned collector', async () => {
    const headers = await responseHeaders();
    const policy = headers.get('Content-Security-Policy-Report-Only');

    expect(headers.get('Reporting-Endpoints')).toBe(
      'csp-endpoint="/api/csp-report"',
    );
    expect(policy).toContain('report-to csp-endpoint');
    expect(policy).toContain('report-uri /api/csp-report');
    expect(headers.has('Content-Security-Policy')).toBe(false);
  });
});
