"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset?: (id: string) => void;
};

export default function LoginForm({ siteKey, next = "/" }: { siteKey: string; next?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!siteKey || !box.current) return;
    const render = () => {
      const ts = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (!ts || !box.current || widget.current) return;
      widget.current = ts.render(box.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.addEventListener("load", render);
    document.head.appendChild(s);
    return () => s.removeEventListener("load", render);
  }, [siteKey]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), token }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        window.location.href = next === "/instagram" ? "/admin/instagram" : "/admin";
        return;
      }
      setMsg(data.error ?? "Could not log in.");
      const ts = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (widget.current && ts?.reset) ts.reset(widget.current);
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required defaultValue="hola@mezcalomano.com" />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required minLength={1} />
      </label>
      <div ref={box} />
      <button className="adm-btn adm-btn-primary" type="submit" disabled={busy || !token}>
        {busy ? "Checking" : "Log in"}
      </button>
      <p className="adm-msg" role="status">{msg}</p>
    </form>
  );
}
