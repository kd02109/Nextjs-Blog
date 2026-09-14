/// <reference types="gtag.js" />

interface Window {
  gtag: Gtag.Gtag;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_GA_ID: string;
    readonly NEXT_EMAIL_ID: string;
    readonly NEXT_EMAIL_PASSWORD: string;
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly VIEW_COUNT_HASH_SECRET: string;
    readonly NEXT_PUBLIC_URL: string;
    readonly NEXT_DEV_URL: string;
  }
}
