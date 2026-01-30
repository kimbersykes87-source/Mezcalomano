/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RECAPTCHA_SECRET: string;
  readonly RECAPTCHA_SITE_KEY: string;
  readonly PUBLIC_RECAPTCHA_SITE_KEY?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly MAILCHANNELS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
