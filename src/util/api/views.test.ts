import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestViewIncrement } from './views';

describe('requestViewIncrement', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts an encoded slug to the server-owned mutation route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ viewCount: 8 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestViewIncrement('URLSearchParams')).resolves.toBe(8);
    expect(fetchMock).toHaveBeenCalledWith('/api/views/URLSearchParams', {
      method: 'POST',
    });
  });

  it('throws a generic error for a rejected mutation request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('postgres://internal.example service_role secret', {
          status: 500,
        }),
      ),
    );

    await expect(requestViewIncrement('URLSearchParams')).rejects.toThrow(
      'Unable to record view.',
    );
  });
});
