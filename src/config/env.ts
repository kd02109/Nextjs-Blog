import { z } from 'zod';

type EnvironmentSource = Readonly<Record<string, string | undefined>>;

const requiredString = z.string().trim().min(1);
const requiredUrl = z.url();
const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const publicSupabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: requiredUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredString,
});

function parseEnvironment<T>(
  schema: z.ZodType<T>,
  source: EnvironmentSource,
  scope: string,
): T {
  const result = schema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid ${scope} environment: ${details}`);
  }

  return result.data;
}

function publicSupabaseSource(): EnvironmentSource {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function publicAnalyticsSource(): EnvironmentSource {
  return {
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  };
}

function publicSiteSource(): EnvironmentSource {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_DEV_URL: process.env.NEXT_PUBLIC_DEV_URL,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  };
}

function mailSource(): EnvironmentSource {
  const environment = process.env;

  return {
    NEXT_EMAIL_ID: environment.NEXT_EMAIL_ID,
    NEXT_EMAIL_PASSWORD: environment.NEXT_EMAIL_PASSWORD,
  };
}

function viewMutationSource(): EnvironmentSource {
  const environment = process.env;

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: environment.SUPABASE_SERVICE_ROLE_KEY,
    VIEW_COUNT_HASH_SECRET: environment.VIEW_COUNT_HASH_SECRET,
    VERCEL: environment.VERCEL,
  };
}

export function getPublicSupabaseEnv(
  source: EnvironmentSource = publicSupabaseSource(),
) {
  return parseEnvironment(publicSupabaseSchema, source, 'public Supabase');
}

export function getPublicAnalyticsId(
  source: EnvironmentSource = publicAnalyticsSource(),
) {
  const publicAnalyticsSchema = z.object({
    NEXT_PUBLIC_GA_ID: z.preprocess(
      emptyStringToUndefined,
      requiredString.optional(),
    ),
  });

  return parseEnvironment(publicAnalyticsSchema, source, 'public analytics')
    .NEXT_PUBLIC_GA_ID;
}

export function getPublicSiteUrl(
  source: EnvironmentSource = publicSiteSource(),
) {
  const optionalUrl = z.preprocess(
    emptyStringToUndefined,
    requiredUrl.optional(),
  );
  const publicSiteSchema = z.object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('production'),
    NEXT_PUBLIC_DEV_URL: optionalUrl,
    NEXT_PUBLIC_URL: optionalUrl,
  });
  const environment = parseEnvironment(publicSiteSchema, source, 'public site');

  return environment.NODE_ENV === 'development'
    ? environment.NEXT_PUBLIC_DEV_URL
    : environment.NEXT_PUBLIC_URL;
}

export function getMailEnv(source: EnvironmentSource = mailSource()) {
  const optionalString = z.preprocess(
    emptyStringToUndefined,
    requiredString.optional(),
  );
  const mailSchema = z
    .object({
      NEXT_EMAIL_ID: z.preprocess(emptyStringToUndefined, z.email().optional()),
      NEXT_EMAIL_PASSWORD: optionalString,
    })
    .superRefine((environment, context) => {
      if (
        Boolean(environment.NEXT_EMAIL_ID) ===
        Boolean(environment.NEXT_EMAIL_PASSWORD)
      ) {
        return;
      }

      const message =
        'NEXT_EMAIL_ID and NEXT_EMAIL_PASSWORD must both be present or both be absent.';
      context.addIssue({
        code: 'custom',
        message,
        path: ['NEXT_EMAIL_ID'],
      });
      context.addIssue({
        code: 'custom',
        message,
        path: ['NEXT_EMAIL_PASSWORD'],
      });
    });
  const environment = parseEnvironment(mailSchema, source, 'mail');

  if (!environment.NEXT_EMAIL_ID || !environment.NEXT_EMAIL_PASSWORD) {
    throw new Error(
      'Mail delivery requires NEXT_EMAIL_ID and NEXT_EMAIL_PASSWORD.',
    );
  }

  return environment;
}

export function getViewMutationEnv(
  source: EnvironmentSource = viewMutationSource(),
) {
  const viewMutationSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: requiredUrl,
    SUPABASE_SERVICE_ROLE_KEY: requiredString,
    VIEW_COUNT_HASH_SECRET: requiredString.min(32),
    VERCEL: z.literal('1'),
  });

  return parseEnvironment(viewMutationSchema, source, 'view mutation');
}
