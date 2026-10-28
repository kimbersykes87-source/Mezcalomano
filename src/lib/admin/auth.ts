import { createHmac, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Single login for admin.mezcalomano.com (server-only).
 *
 * Env:
 *   ADMIN_EMAIL           optional, defaults to hola@mezcalomano.com
 *   ADMIN_PASSWORD_HASH   scrypt hash made with `node scripts/admin-password-hash.mjs`
 *                         (the password itself is never stored anywhere)
 *   ADMIN_SESSION_SECRET  long random string used to sign the session cookie
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export const SESSION_COOKIE = "mm_admin";
export const SESSION_DAYS = 30;

export const adminEmail = () => (process.env.ADMIN_EMAIL?.trim() || "hola@mezcalomano.com").toLowerCase();

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH?.trim() && process.env.ADMIN_SESSION_SECRET?.trim());
}

/** Hash format: scrypt$N$r$p$saltHex$hashHex */
export async function checkPassword(password: string): Promise<boolean> {
  const stored = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltHex, hashHex] = parts;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 256 * 1024 * 1024,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function sign(value: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function makeSessionValue(): string {
  const exp = String(Date.now() + SESSION_DAYS * 86400_000);
  return `${exp}.${sign(exp)}`;
}

export function sessionValid(value: string | undefined): boolean {
  if (!value || !adminConfigured()) return false;
  const [exp, mac] = value.split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  const good = Buffer.from(sign(exp), "hex");
  const given = Buffer.from(mac, "hex");
  return good.length === given.length && timingSafeEqual(good, given);
}

export async function isLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  return sessionValid(jar.get(SESSION_COOKIE)?.value);
}

/** For admin pages: sends anyone without a valid session to the login page. */
export async function requireAdmin() {
  if (!(await isLoggedIn())) redirect("/admin/login");
}
