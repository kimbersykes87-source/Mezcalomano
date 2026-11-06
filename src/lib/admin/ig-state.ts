import { createHmac } from "node:crypto";

/** Signed `state` for the Instagram connect flow (see api/admin/instagram/connect). */
export const STATE_COOKIE = "mm_ig_state";

export function signState(nonce: string, exp: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(`ig.${nonce}.${exp}`).digest("hex");
}
