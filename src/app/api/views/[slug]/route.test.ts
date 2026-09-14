import { beforeEach, describe, expect, it, vi } from 'vitest';

const { incrementView } = vi.hoisted(() => ({
  incrementView: vi.fn(),
}));

vi.mock('@/server/supabase', () => ({ incrementView }));
vi.mock('server-only', () => ({}));

import { POST } from './route';

function request(slug: string) {
  return POST(
    new Request(`http://localhost/api/views/${slug}`, { method: 'POST' }),
    {
      params: Promise.resolve({ slug }),
    },
  );
}

describe('POST /api/views/[slug]', () => {
  beforeEach(() => {
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
      expect(incrementView).toHaveBeenCalledWith(slug);
    },
  );

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
});
