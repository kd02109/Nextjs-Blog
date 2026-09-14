import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, from, select, eq, maybeSingle } = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient }));

let browserSupabase: typeof import('./browser');

describe('browser Supabase reads', () => {
  beforeEach(async () => {
    vi.resetModules();
    Object.assign(process.env, {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'server-service-role-key',
    });
    createClient.mockReset();
    from.mockReset();
    select.mockReset();
    eq.mockReset();
    maybeSingle.mockReset();
    createClient.mockReturnValue({ from });
    from.mockReturnValue({ select });
    select.mockReturnValue({ eq });
    eq.mockReturnValue({ maybeSingle });
    maybeSingle.mockResolvedValue({ data: { view_count: 7 }, error: null });
    browserSupabase = await import('./browser');
  });

  it('reuses one read-only client across view count queries', async () => {
    await browserSupabase.getViewCount('URLSearchParams');
    await browserSupabase.getViewCount('react-design-pattern');

    expect(createClient).toHaveBeenCalledOnce();
  });

  it('uses the public credential for a SELECT-only view count query', async () => {
    await expect(browserSupabase.getViewCount('URLSearchParams')).resolves.toBe(
      7,
    );

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'public-anon-key',
    );
    expect(createClient).not.toHaveBeenCalledWith(
      expect.anything(),
      'server-service-role-key',
    );
    expect(from).toHaveBeenCalledWith('views');
    expect(select).toHaveBeenCalledWith('view_count');
    expect(eq).toHaveBeenCalledWith('slug', 'URLSearchParams');
  });

  it('returns zero without inserting when a view row is missing', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(browserSupabase.getViewCount('URLSearchParams')).resolves.toBe(
      0,
    );
  });

  it('does not expose a browser mutation function or client', () => {
    expect(Object.keys(browserSupabase)).toEqual(['getViewCount']);
  });
});
