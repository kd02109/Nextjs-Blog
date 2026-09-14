import { beforeEach, describe, expect, it, vi } from 'vitest';

const { incrementView } = vi.hoisted(() => ({
  incrementView: vi.fn(),
}));

vi.mock('@/server/supabase', () => ({ incrementView }));
vi.mock('server-only', () => ({}));

import { POST } from './route';

const hashSecret = '0123456789abcdef0123456789abcdef';
const defaultAddress = '203.0.113.10';
const defaultUserAgent = 'Test Browser/1.0';
const defaultVisitorHash =
  'd960257723ff41489555e2dc0f52f4b5e0fb6fa9cf65b1675fa620920aafb6f4';

function request(
  slug: string,
  {
    address = defaultAddress,
    userAgent = defaultUserAgent,
  }: { address?: string | null; userAgent?: string | null } = {},
) {
  const headers = new Headers();
  if (address !== null) headers.set('x-forwarded-for', address);
  if (userAgent !== null) headers.set('user-agent', userAgent);

  return POST(
    new Request(`http://localhost/api/views/${slug}`, {
      method: 'POST',
      headers,
    }),
    {
      params: Promise.resolve({ slug }),
    },
  );
}

describe('POST /api/views/[slug]', () => {
  beforeEach(() => {
    Object.assign(process.env, { VIEW_COUNT_HASH_SECRET: hashSecret });
    incrementView.mockReset();
    incrementView.mockResolvedValue(42);
  });

  it.each(['URLSearchParams', 'parallel-routes-and-Intercepting-routes'])(
    'increments the known, case-preserving content slug %s',
    async slug => {
      const response = await request(slug);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ viewCount: 42 });
      expect(incrementView).toHaveBeenCalledOnce();
      expect(incrementView).toHaveBeenCalledWith(slug, defaultVisitorHash);
    },
  );

  it('passes the same server-derived fingerprint for repeated requests', async () => {
    await request('URLSearchParams');
    await request('URLSearchParams');

    expect(incrementView.mock.calls).toEqual([
      ['URLSearchParams', defaultVisitorHash],
      ['URLSearchParams', defaultVisitorHash],
    ]);
  });

  it('passes a distinct fingerprint for a different visitor address', async () => {
    await request('URLSearchParams');
    await request('URLSearchParams', { address: '203.0.113.11' });

    expect(incrementView.mock.calls).toEqual([
      ['URLSearchParams', defaultVisitorHash],
      [
        'URLSearchParams',
        'c8e8ac2613adb1901e27428c1b7c1c29ab9fa869fa80c929a317b878e1e9efa6',
      ],
    ]);
  });

  it('never passes the raw visitor address or user agent to the RPC boundary', async () => {
    await request('URLSearchParams');

    const rpcArguments = JSON.stringify(incrementView.mock.calls);
    expect(rpcArguments).toContain(defaultVisitorHash);
    expect(rpcArguments).not.toContain(defaultAddress);
    expect(rpcArguments).not.toContain(defaultUserAgent);
  });

  it.each(['../admin', 'not_valid', '-leading-hyphen', 'a'.repeat(121)])(
    'rejects the malformed slug %s before a database mutation',
    async slug => {
      const response = await request(slug);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        message: 'Invalid view slug.',
      });
      expect(incrementView).not.toHaveBeenCalled();
    },
  );

  it('rejects a syntactically valid unknown slug before a database mutation', async () => {
    const response = await request('not-a-real-post');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: 'Content not found.',
    });
    expect(incrementView).not.toHaveBeenCalled();
  });

  it('returns a generic 500 response without leaking database details', async () => {
    const internalDetail =
      'postgres://service_role:secret@example.internal views constraint';
    incrementView.mockRejectedValue(new Error(internalDetail));

    const response = await request('URLSearchParams');
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(JSON.parse(body)).toEqual({ message: 'Unable to record view.' });
    expect(body).not.toContain(internalDetail);
    expect(body).not.toContain('service_role');
    expect(body).not.toContain('secret');
  });

  it.each([
    ['missing', undefined],
    ['short', 'too-short'],
  ])(
    'fails closed with a generic response for a %s hash secret',
    async (_, secret) => {
      if (secret === undefined) {
        Reflect.deleteProperty(process.env, 'VIEW_COUNT_HASH_SECRET');
      } else {
        Object.assign(process.env, { VIEW_COUNT_HASH_SECRET: secret });
      }

      const response = await request('URLSearchParams');
      const body = await response.text();

      expect(response.status).toBe(500);
      expect(JSON.parse(body)).toEqual({ message: 'Unable to record view.' });
      expect(body).not.toContain('VIEW_COUNT_HASH_SECRET');
      expect(incrementView).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['forwarded address', { address: null }],
    ['user agent', { userAgent: null }],
  ])('fails closed when the request has no %s', async (_, headers) => {
    const response = await request('URLSearchParams', headers);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: 'Unable to record view.',
    });
    expect(incrementView).not.toHaveBeenCalled();
  });
});
