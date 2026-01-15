import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_TAX_CODE: z.string().min(1).optional(),
  SHIPSTATION_API_KEY: z.string().min(1),
  SHIPSTATION_API_SECRET: z.string().min(1),
  SHIPSTATION_STORE_ID: z.string().min(1),
  SHIPSTATION_WEBHOOK_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  GOOGLE_SHEETS_CLIENT_EMAIL: z.string().email(),
  GOOGLE_SHEETS_PRIVATE_KEY: z.string().min(1),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1),
  ADMIN_EMAIL_ALLOWLIST: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

const isTest = process.env.NODE_ENV === "test";
const isNextBuildPhase = typeof process.env.NEXT_PHASE === "string" && process.env.NEXT_PHASE.length > 0;

const readProcessEnv = () => ({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_TAX_CODE: process.env.STRIPE_TAX_CODE,
  SHIPSTATION_API_KEY: process.env.SHIPSTATION_API_KEY,
  SHIPSTATION_API_SECRET: process.env.SHIPSTATION_API_SECRET,
  SHIPSTATION_STORE_ID: process.env.SHIPSTATION_STORE_ID,
  SHIPSTATION_WEBHOOK_SECRET: process.env.SHIPSTATION_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
  GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
});

let cachedEnv: ServerEnv | null = null;
const loadEnv = (): ServerEnv => {
  if (cachedEnv) return cachedEnv;

  if (isTest) {
    cachedEnv = {
      NODE_ENV: "test",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "test",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "test",
      STRIPE_TAX_CODE: process.env.STRIPE_TAX_CODE,
      SHIPSTATION_API_KEY: process.env.SHIPSTATION_API_KEY ?? "test",
      SHIPSTATION_API_SECRET: process.env.SHIPSTATION_API_SECRET ?? "test",
      SHIPSTATION_STORE_ID: process.env.SHIPSTATION_STORE_ID ?? "1",
      SHIPSTATION_WEBHOOK_SECRET: process.env.SHIPSTATION_WEBHOOK_SECRET ?? "test",
      RESEND_API_KEY: process.env.RESEND_API_KEY ?? "test",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "test@example.com",
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? "test",
      GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL ?? "test@example.com",
      GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? "test",
      GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "test",
      ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
    };
    return cachedEnv;
  }

  const parsed = serverSchema.safeParse(readProcessEnv());
  if (parsed.success) {
    cachedEnv = parsed.data;
    return cachedEnv;
  }

  // During `next build`/page data collection, env vars may not be present in CI.
  // Defer strict validation to runtime where Cloudflare injects bindings/env vars.
  if (isNextBuildPhase) {
    cachedEnv = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "build",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "build",
      STRIPE_TAX_CODE: process.env.STRIPE_TAX_CODE,
      SHIPSTATION_API_KEY: process.env.SHIPSTATION_API_KEY ?? "build",
      SHIPSTATION_API_SECRET: process.env.SHIPSTATION_API_SECRET ?? "build",
      SHIPSTATION_STORE_ID: process.env.SHIPSTATION_STORE_ID ?? "1",
      SHIPSTATION_WEBHOOK_SECRET: process.env.SHIPSTATION_WEBHOOK_SECRET ?? "build",
      RESEND_API_KEY: process.env.RESEND_API_KEY ?? "build",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "build@example.com",
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? "build",
      GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL ?? "build@example.com",
      GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? "build",
      GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "build",
      ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
    };
    return cachedEnv;
  }

  throw parsed.error;
};

export const env: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    const loaded = loadEnv() as unknown as Record<string, unknown>;
    return loaded[prop as string];
  },
}) as ServerEnv;
