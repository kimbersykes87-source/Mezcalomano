import { getRequestContext } from "@cloudflare/next-on-pages";

import { createId } from "@/lib/ids";
import "@/lib/cloudflare-env";

type SessionKind = "admin" | "customer";

const buildKey = (kind: SessionKind, type: "token" | "session", value: string) =>
  `${kind}:${type}:${value}`;

export const createMagicToken = async (kind: SessionKind, email: string, ttlSeconds: number) => {
  const token = createId(`${kind}_token`);
  const { env } = getRequestContext();
  await env.KV.put(buildKey(kind, "token", token), JSON.stringify({ email }), {
    expirationTtl: ttlSeconds,
  });
  return token;
};

export const consumeMagicToken = async (kind: SessionKind, token: string) => {
  const { env } = getRequestContext();
  const key = buildKey(kind, "token", token);
  const raw = await env.KV.get(key);
  if (!raw) return null;
  await env.KV.delete(key);
  return JSON.parse(raw) as { email: string };
};

export const createSession = async (kind: SessionKind, email: string, ttlSeconds: number) => {
  const sessionToken = createId(`${kind}_session`);
  const { env } = getRequestContext();
  await env.KV.put(buildKey(kind, "session", sessionToken), JSON.stringify({ email }), {
    expirationTtl: ttlSeconds,
  });
  return sessionToken;
};

export const getSession = async (kind: SessionKind, sessionToken: string) => {
  const { env } = getRequestContext();
  const raw = await env.KV.get(buildKey(kind, "session", sessionToken));
  if (!raw) return null;
  return JSON.parse(raw) as { email: string };
};
