import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, rpc } = vi.hoisted(() => ({
  createClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('server-only', () => ({}));

import { incrementView } from './supabase';

describe('server Supabase view mutations', () => {
  const visitorHash = 'a'.repeat(64);

  beforeEach(() => {
    Object.assign(process.env, {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'server-service-role-key',
      VIEW_COUNT_HASH_SECRET: 'v'.repeat(32),
      VERCEL: '1',
    });
    createClient.mockReset();
    rpc.mockReset();
    createClient.mockReturnValue({ rpc });
    rpc.mockResolvedValue({ data: 8, error: null });
  });

  it('uses the server-only credential to invoke increment_view', async () => {
    await expect(incrementView('URLSearchParams', visitorHash)).resolves.toBe(
      8,
    );

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'server-service-role-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
    expect(createClient).not.toHaveBeenCalledWith(
      expect.anything(),
      'public-anon-key',
      expect.anything(),
    );
    expect(rpc).toHaveBeenCalledWith('increment_view', {
      slug_text: 'URLSearchParams',
      visitor_hash_text: visitorHash,
    });
  });

  it('throws a generic error when the database mutation fails', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: 'postgres://internal.example secret detail' },
    });

    await expect(incrementView('URLSearchParams', visitorHash)).rejects.toThrow(
      'Unable to increment view.',
    );
  });
});
