import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { POST } from './route';

function reportRequest(
  contentType: string,
  body: string,
  headers: Record<string, string> = {},
) {
  return new Request('https://blog.example/api/csp-report?ignored=secret', {
    method: 'POST',
    headers: {
      'content-type': contentType,
      authorization: 'Bearer must-not-be-logged',
      cookie: 'session=must-not-be-logged',
      ...headers,
    },
    body,
  });
}

describe('POST /api/csp-report', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts a legacy report and emits only sanitized allowlisted fields', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const response = await POST(
      reportRequest(
        'application/csp-report',
        JSON.stringify({
          'csp-report': {
            'document-uri':
              'https://reader:password@blog.example/posts/hello?token=secret#part',
            referrer: 'https://private.example/account?credential=secret',
            'violated-directive': 'script-src-elem',
            'effective-directive': 'script-src-elem',
            'original-policy': "default-src 'none'; private-policy-marker",
            disposition: 'report',
            'blocked-uri':
              'https://cdn.example/script.js?credential=blocked-secret',
            'source-file':
              'https://blog.example/_next/static/app.js?build=private',
            'status-code': 200,
            'line-number': 14,
            'column-number': 7,
            'script-sample': 'document.cookie',
          },
        }),
      ),
    );

    expect(response?.status).toBe(204);
    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith('csp-report', {
      type: 'csp-violation',
      documentUrl: 'https://blog.example/posts/hello',
      blockedUrl: 'https://cdn.example/script.js',
      sourceFile: 'https://blog.example/_next/static/app.js',
      effectiveDirective: 'script-src-elem',
      violatedDirective: 'script-src-elem',
      disposition: 'report',
      statusCode: 200,
      lineNumber: 14,
      columnNumber: 7,
    });

    const emitted = JSON.stringify(log.mock.calls);
    expect(emitted).not.toMatch(
      /reader|password|token|credential|private-policy-marker|document\.cookie|authorization|cookie|must-not-be-logged/,
    );
  });

  it('accepts a Reporting API batch and strips query strings from logged URLs', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const response = await POST(
      reportRequest(
        'application/reports+json; charset=utf-8',
        JSON.stringify([
          {
            age: 12,
            type: 'csp-violation',
            url: 'https://blog.example/posts/hello?outer=private',
            user_agent: 'Private Browser Detail',
            body: {
              blockedURL: 'inline',
              columnNumber: 5,
              disposition: 'report',
              documentURL: 'https://blog.example/posts/hello?draft=true',
              effectiveDirective: 'style-src-elem',
              lineNumber: 9,
              originalPolicy: "default-src 'none'",
              referrer: 'https://private.example/',
              sample: 'private inline sample',
              sourceFile: 'https://blog.example/_next/app.js?hash=private',
              statusCode: 200,
            },
          },
        ]),
      ),
    );

    expect(response?.status).toBe(204);
    expect(log).toHaveBeenCalledWith('csp-report', {
      type: 'csp-violation',
      documentUrl: 'https://blog.example/posts/hello',
      blockedUrl: 'inline',
      sourceFile: 'https://blog.example/_next/app.js',
      effectiveDirective: 'style-src-elem',
      disposition: 'report',
      statusCode: 200,
      lineNumber: 9,
      columnNumber: 5,
    });

    expect(JSON.stringify(log.mock.calls)).not.toMatch(
      /outer|draft|hash|Private Browser Detail|inline sample|referrer/,
    );
  });

  it('rejects unsupported content types without emitting a report', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const response = await POST(reportRequest('application/json', '{}'));

    expect(response?.status).toBe(415);
    expect(log).not.toHaveBeenCalled();
  });

  it('rejects a declared body larger than 16 KiB', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const response = await POST(
      reportRequest('application/csp-report', '{}', {
        'content-length': '16385',
      }),
    );

    expect(response?.status).toBe(413);
    expect(log).not.toHaveBeenCalled();
  });

  it('rejects an actual body larger than 16 KiB without trusting its declaration', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const response = await POST(
      reportRequest('application/csp-report', 'x'.repeat(16385)),
    );

    expect(response?.status).toBe(413);
    expect(log).not.toHaveBeenCalled();
  });

  it.each([
    ['malformed JSON', '{'],
    ['an unrecognized object', JSON.stringify({ report: {} })],
  ])('rejects %s with a generic response', async (_description, body) => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const response = await POST(reportRequest('application/csp-report', body));

    expect(response?.status).toBe(400);
    await expect(response?.json()).resolves.toEqual({
      message: 'Invalid CSP report.',
    });
    expect(log).not.toHaveBeenCalled();
  });
});
