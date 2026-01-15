import { env } from "@/lib/env";

export const verifyTurnstile = async (token: string, ip?: string | null) => {
  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  if (ip) {
    formData.append("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { success: boolean };
  return data.success;
};
