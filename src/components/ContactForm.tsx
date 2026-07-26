"use client";

import { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
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
      getResponse: (widgetId?: string) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

export default function ContactForm() {
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileSiteKey =
    typeof process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === "string"
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.trim()
      : "";

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return;

    let cancelled = false;

    function renderWidget() {
      if (cancelled || !window.turnstile || !turnstileContainerRef.current) return;
      if (turnstileWidgetIdRef.current) return;

      turnstileContainerRef.current.innerHTML = "";
      const id = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
      turnstileWidgetIdRef.current = id;
    }

    const existing = document.querySelector(
      'script[data-turnstile="contact"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.turnstile) {
        renderWidget();
      } else {
        existing.addEventListener("load", renderWidget);
      }
      return () => {
        cancelled = true;
        existing.removeEventListener("load", renderWidget);
        if (turnstileWidgetIdRef.current && window.turnstile?.remove) {
          window.turnstile.remove(turnstileWidgetIdRef.current);
          turnstileWidgetIdRef.current = null;
        }
      };
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "contact";
    script.addEventListener("load", renderWidget);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", renderWidget);
      if (turnstileWidgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileSiteKey]);

  const [successVisible, setSuccessVisible] = useState(false);
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  function resetTurnstile() {
    setTurnstileToken("");
    if (typeof window !== "undefined" && window.turnstile && turnstileWidgetIdRef.current) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }

  function readTurnstileToken(form: HTMLFormElement): string {
    if (turnstileToken.trim()) return turnstileToken.trim();

    const fromInput = form.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]'
    )?.value;
    if (fromInput?.trim()) return fromInput.trim();

    if (typeof window !== "undefined" && window.turnstile && turnstileWidgetIdRef.current) {
      return window.turnstile.getResponse(turnstileWidgetIdRef.current)?.trim() ?? "";
    }
    return "";
  }

  function clearErrors() {
    setFieldErrors({});
    setFormError("");
  }

  function showError(field: "name" | "email" | "message", message: string) {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }

  function validateForm(data: { name: string; email: string; message: string }): boolean {
    clearErrors();
    let isValid = true;
    if (!data.name.trim()) {
      showError("name", "Name is required");
      isValid = false;
    }
    if (!data.email.trim()) {
      showError("email", "Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      showError("email", "Please enter a valid email address");
      isValid = false;
    }
    if (!data.message.trim()) {
      showError("message", "Message is required");
      isValid = false;
    }
    return isValid;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearErrors();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");

    if (!validateForm({ name, email, message })) return;

    const token = readTurnstileToken(form);
    if (!token) {
      setFormError("Please complete the verification challenge.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, token }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (response.ok && result?.ok === true) {
        setSuccessVisible(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setFormError(result?.error || "Something went wrong. Please try again.");
      resetTurnstile();
    } catch {
      setFormError("Network error. Please try again.");
      resetTurnstile();
    } finally {
      setSending(false);
    }
  }

  if (successVisible) {
    return (
      <div className="form-success is-visible" id="form-success" role="status">
        <p>Thanks, we got it. We&apos;ll reply within 1 to 2 business days.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
      <div
        className={`form-error-inline ${formError ? "is-visible" : ""}`}
        id="form-error-inline"
        role="alert"
      >
        {formError}
      </div>

      <div className="form-group">
        <input
          type="text"
          id="name"
          name="name"
          className="form-input"
          placeholder="Name"
          required
          aria-required
          aria-label="Name"
          disabled={sending}
          maxLength={200}
        />
        <div className={`form-error ${fieldErrors.name ? "is-visible" : ""}`} id="name-error">
          {fieldErrors.name}
        </div>
      </div>

      <div className="form-group">
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          placeholder="Email"
          required
          aria-required
          aria-label="Email"
          disabled={sending}
          maxLength={200}
        />
        <div className={`form-error ${fieldErrors.email ? "is-visible" : ""}`} id="email-error">
          {fieldErrors.email}
        </div>
      </div>

      <div className="form-group">
        <textarea
          id="message"
          name="message"
          className="form-textarea"
          placeholder="Message"
          required
          aria-required
          aria-label="Message"
          disabled={sending}
          maxLength={5000}
        />
        <div className={`form-error ${fieldErrors.message ? "is-visible" : ""}`} id="message-error">
          {fieldErrors.message}
        </div>
      </div>

      <div className="turnstile-container">
        <div ref={turnstileContainerRef} id="turnstile-widget" />
      </div>

      <button type="submit" className="btn btn-submit" disabled={sending} aria-busy={sending}>
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
