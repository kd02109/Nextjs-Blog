import { describe, expect, it } from 'vitest';

import {
  getMailEnv,
  getPublicAnalyticsId,
  getPublicSiteUrl,
  getPublicSupabaseEnv,
  getViewMutationEnv,
} from './env';

const publicSupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-placeholder',
};

describe('environment contract', () => {
  it('names a missing public Supabase URL when the client path initializes', () => {
    expect(() =>
      getPublicSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-placeholder',
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('names an invalid public Supabase URL when the client path initializes', () => {
    expect(() =>
      getPublicSupabaseEnv({
        ...publicSupabaseEnv,
        NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('names a missing public Supabase anonymous key', () => {
    expect(() =>
      getPublicSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: publicSupabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it('rejects an incomplete mail credential pair when delivery is invoked', () => {
    expect(() =>
      getMailEnv({
        NEXT_EMAIL_ID: 'operator@example.com',
      }),
    ).toThrow(
      /NEXT_EMAIL_ID.*NEXT_EMAIL_PASSWORD|NEXT_EMAIL_PASSWORD.*NEXT_EMAIL_ID/,
    );
  });

  it('requires mail credentials only when delivery is invoked', () => {
    expect(() => getMailEnv({})).toThrow(
      /NEXT_EMAIL_ID.*NEXT_EMAIL_PASSWORD|NEXT_EMAIL_PASSWORD.*NEXT_EMAIL_ID/,
    );
  });

  it.each([
    ['a service role key', { SUPABASE_SERVICE_ROLE_KEY: undefined }],
    ['a 32-character hash secret', { VIEW_COUNT_HASH_SECRET: 'too-short' }],
    ['the Vercel runtime marker', { VERCEL: '0' }],
  ])('requires %s for view mutations', (_description, override) => {
    expect(() =>
      getViewMutationEnv({
        NEXT_PUBLIC_SUPABASE_URL: publicSupabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: 'server-role-placeholder',
        VIEW_COUNT_HASH_SECRET: 'v'.repeat(32),
        VERCEL: '1',
        ...override,
      }),
    ).toThrow();
  });

  it('treats optional public analytics and site URLs as disabled when blank', () => {
    expect(getPublicAnalyticsId({ NEXT_PUBLIC_GA_ID: '' })).toBeUndefined();
    expect(
      getPublicSiteUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_URL: '',
      }),
    ).toBeUndefined();
  });
});
