import { beforeEach, describe, expect, it, vi } from 'vitest';

const { incrementView } = vi.hoisted(() => ({
  incrementView: vi.fn(),
}));

vi.mock('@/server/supabase', () => ({ incrementView }));
vi.mock('server-only', () => ({}));

import { POST } from './route';

const hashSecret = '0123456789abcdef0123456789abcdef';
const defaultTrustedAddress = '203.0.113.10';
const defaultForwardedAddress = '198.51.100.20';
const defaultUserAgent = 'Test Browser/1.0';
const defaultVisitorHash =
  'dfe993633e8dc89c6fed55b2f4c69b9bcedccd799036a73b585ef5552dfc8e35';

function request(
  slug: string,
  {
    trustedAddress = defaultTrustedAddress,
    forwardedAddress = defaultForwardedAddress,
    userAgent = defaultUserAgent,
  }: {
    trustedAddress?: string | null;
    forwardedAddress?: string | null;
    userAgent?: string | null;
  } = {},
) {
  const headers = new Headers();
  if (trustedAddress !== null) {
    headers.set('x-vercel-forwarded-for', trustedAddress);
  }
  if (forwardedAddress !== null) {
    headers.set('x-forwarded-for', forwardedAddress);
  }
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
    Object.assign(process.env, {
      VERCEL: '1',
      VIEW_COUNT_HASH_SECRET: hashSecret,
    });
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

  it('does not let User-Agent changes mint a new visitor fingerprint', async () => {
    await request('URLSearchParams', { userAgent: 'First Browser/1.0' });
    await request('URLSearchParams', { userAgent: 'Other Browser/99.0' });

    expect(incrementView.mock.calls).toEqual([
      ['URLSearchParams', defaultVisitorHash],
      ['URLSearchParams', defaultVisitorHash],
    ]);
  });

  it('ignores spoofed x-forwarded-for values', async () => {
    await request('URLSearchParams', { forwardedAddress: '192.0.2.10' });
    await request('URLSearchParams', { forwardedAddress: '192.0.2.11' });

    expect(incrementView.mock.calls).toEqual([
      ['URLSearchParams', defaultVisitorHash],
      ['URLSearchParams', defaultVisitorHash],
    ]);
  });

  it('passes a distinct fingerprint for a different trusted Vercel address', async () => {
    await request('URLSearchParams');
    await request('URLSearchParams', { trustedAddress: '203.0.113.11' });

    expect(incrementView.mock.calls).toEqual([
      ['URLSearchParams', defaultVisitorHash],
      [
        'URLSearchParams',
        'c88eaf60fc5eba0aa3b71c529f4847acfa17430a785e86e616deb1acc38cd34e',
      ],
    ]);
  });

  it('never passes a raw visitor address to the RPC boundary', async () => {
    await request('URLSearchParams');

    const rpcArguments = JSON.stringify(incrementView.mock.calls);
    expect(rpcArguments).toContain(defaultVisitorHash);
    expect(rpcArguments).not.toContain(defaultTrustedAddress);
    expect(rpcArguments).not.toContain(defaultForwardedAddress);
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
    ['missing', undefined],
    ['unexpected', '0'],
  ])(
    'fails closed outside a Vercel runtime when VERCEL is %s',
    async (_, vercelMarker) => {
      if (vercelMarker === undefined) {
        Reflect.deleteProperty(process.env, 'VERCEL');
      } else {
        Object.assign(process.env, { VERCEL: vercelMarker });
      }

      const response = await request('URLSearchParams');

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({
        message: 'Unable to record view.',
      });
      expect(incrementView).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['missing', null],
    ['malformed', 'not-an-ip'],
    ['multiple values', '203.0.113.10, 203.0.113.11'],
  ])(
    'fails closed for a %s trusted Vercel address',
    async (_, trustedAddress) => {
      const response = await request('URLSearchParams', { trustedAddress });

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({
        message: 'Unable to record view.',
      });
      expect(incrementView).not.toHaveBeenCalled();
    },
  );
});
