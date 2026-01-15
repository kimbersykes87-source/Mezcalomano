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

export const env = isTest
  ? ({
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
    } as ServerEnv)
  : serverSchema.parse({
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
