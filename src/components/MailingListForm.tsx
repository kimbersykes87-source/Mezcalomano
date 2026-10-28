"use client";

import { useEffect, useRef, useState } from "react";

/** Shopify's privacy policy page for the store (also covers marketing email). */
const PRIVACY_POLICY_URL = "https://shop.mezcalomano.com/policies/privacy-policy";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove?: (widgetId: string) => void;
};

function turnstileApi(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

export default function MailingListForm() {
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const turnstileSiteKey =
    typeof process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === "string"
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.trim()
      : "";

  useEffect(() => {
    if (done || !turnstileSiteKey || !turnstileContainerRef.current) return;

    let cancelled = false;

    function renderWidget() {
      const api = turnstileApi();
      if (cancelled || !api || !turnstileContainerRef.current) return;
      if (turnstileWidgetIdRef.current) return;

      turnstileContainerRef.current.innerHTML = "";
      turnstileWidgetIdRef.current = api.render(turnstileContainerRef.current, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
    }

    // Share the contact form's script tag so Turnstile's api.js is only ever loaded once.
    const existing = document.querySelector(
      'script[data-turnstile="contact"]'
    ) as HTMLScriptElement | null;

    let script: HTMLScriptElement;
    if (existing) {
      script = existing;
      if (turnstileApi()) {
        renderWidget();
      } else {
        existing.addEventListener("load", renderWidget);
      }
    } else {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "contact";
      script.addEventListener("load", renderWidget);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      script.removeEventListener("load", renderWidget);
      const api = turnstileApi();
      if (turnstileWidgetIdRef.current && api?.remove) {
        api.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileSiteKey, done]);

  function resetTurnstile() {
    setTurnstileToken("");
    const api = turnstileApi();
    if (api && turnstileWidgetIdRef.current) {
      api.reset(turnstileWidgetIdRef.current);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, token: turnstileToken }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (response.ok && result?.ok === true) {
        setDone(true);
        return;
      }

      setError(result?.error || "Something went wrong. Please try again.");
      resetTurnstile();
    } catch {
      setError("Network error. Please try again.");
      resetTurnstile();
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="form-success is-visible mailing-form__success" role="status">
        <p>You&apos;re on the list. Watch your inbox for news about the Discovery Deck.</p>
      </div>
    );
  }

  return (
    <form className="contact-form mailing-form" onSubmit={handleSubmit} noValidate>
      <div className={`form-error-inline ${error ? "is-visible" : ""}`} role="alert">
        {error}
      </div>

      <div className="form-group">
        <input
          type="email"
          name="email"
          className="form-input"
          placeholder="Email"
          autoComplete="email"
          required
          aria-required
          aria-label="Email address"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          disabled={sending}
          maxLength={200}
        />
      </div>

      <div className="turnstile-container">
        <div ref={turnstileContainerRef} />
      </div>

      <button type="submit" className="btn btn-submit" disabled={sending} aria-busy={sending}>
        {sending ? "Joining…" : "Join the list"}
      </button>

      <p className="mailing-form__note">
        We&apos;ll email occasionally about the Discovery Deck and agave news. Unsubscribe anytime.
        See our{" "}
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
