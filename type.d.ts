declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_GA_ID: string;
    readonly NEXT_EMAIL_ID: string;
    readonly NEXT_EMAIL_PASSWORD: string;
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
