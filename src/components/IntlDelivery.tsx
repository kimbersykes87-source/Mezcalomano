"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/**
 * International delivery notice (Oct 2026). The store delivers to US addresses only, so
 * visitors from anywhere else see a slim bar from their first visit, and can leave their
 * email to hear when we deliver to their country. Signups go through /api/subscribe with
 * source "intl", which tags the Shopify customer intl-interest and intl-<country>.
 *
 * The country comes from /api/geo (Vercel's IP lookup) and can be changed in the form.
 * Testing: add ?intl=AU (any code) to a URL to force the bar, ?intl=reset to clear the
 * remembered dismissal.
 */

const PRIVACY_POLICY_URL = "https://shop.mezcalomano.com/policies/privacy-policy";
const STORE_KEY = "mm-intl";

// ISO 3166-1 alpha-2 codes, without the US (the store already delivers there).
const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FO FR GA GB GD GE GH GI GL GM GN GR GT GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NZ OM PA PE PG PH PK PL PS PT PY QA RO RS RW SA SB SC SE SG SI SK SL SM SN SO SR SV SY SZ TC TG TH TJ TL TM TN TO TR TT TW TZ UA UG UY UZ VC VE VN VU WS XK YE ZA ZM ZW".split(
    " "
  );

/** Places Shopify treats as US delivery, so no notice is shown there. */
const US_CODES = new Set(["US", "PR", "GU", "VI", "AS", "MP", "UM"]);

type Remembered = { dismissed?: boolean; signedUp?: boolean };

function readStore(): Remembered {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "{}") as Remembered;
  } catch {
    return {};
  }
}

function writeStore(value: Remembered) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...value }));
  } catch {
    // Private windows can refuse storage; the bar then simply shows again next visit.
  }
}

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export type IntlVisitor = {
  /** "pending" until the country lookup returns. */
  status: "pending" | "us" | "intl" | "hidden";
  country: string | null;
  dismiss: () => void;
  markSignedUp: () => void;
};

export function useIntlVisitor(): IntlVisitor {
  const [status, setStatus] = useState<IntlVisitor["status"]>("pending");
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const forced = (params.get("intl") ?? "").trim().toUpperCase();
    if (forced === "RESET") {
      try {
        window.localStorage.removeItem(STORE_KEY);
      } catch {
        // ignore
      }
    }

    function decide(code: string | null) {
      if (cancelled) return;
      if (!code || US_CODES.has(code)) {
        setStatus("us");
        return;
      }
      setCountry(code);
      const remembered = readStore();
      setStatus(remembered.dismissed || remembered.signedUp ? "hidden" : "intl");
    }

    if (/^[A-Z]{2}$/.test(forced)) {
      decide(forced);
      return () => {
        cancelled = true;
      };
    }

    fetch("/api/geo", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { country?: string | null } | null) => decide(data?.country ?? null))
      .catch(() => decide(null));

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    writeStore({ dismissed: true });
    setStatus("hidden");
  }, []);

  const markSignedUp = useCallback(() => {
    writeStore({ signedUp: true });
  }, []);

  return { status, country, dismiss, markSignedUp };
}

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

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** The luggage tag illustration from the design (Option 5). */
function DeliveryTag({ className }: { className?: string }) {
  const leaf = "M0 26 C-3 16 -2 6 0 -2 C2 6 3 16 0 26Z";
  return (
    <svg
      className={className}
      role="img"
      aria-label="A luggage style delivery tag reading from USA, to your country, next stop coming soon"
      viewBox="30 36 296 168"
    >
      <path d="M40 120 C20 120 14 70 40 52" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <g transform="rotate(-4 179 120)">
        <path
          d="M64 44 L300 44 Q316 44 316 60 L316 180 Q316 196 300 196 L64 196 L40 170 L40 70 Z"
          fill="rgba(255,255,255,.05)"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="58" cy="120" r="7" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="58" cy="120" r="3" fill="#B86744" />
        <line x1="84" y1="56" x2="84" y2="184" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.4" />
        <text x="104" y="76" fill="#D4D3CB" fontSize="10.5" letterSpacing="0.7">FROM</text>
        <text x="104" y="100" fill="#FFFFFF" fontSize="22" fontWeight="700" fontStretch="75%" letterSpacing="0.9">USA</text>
        <text x="104" y="126" fill="#D4D3CB" fontSize="10.5" letterSpacing="0.7">TO</text>
        <text x="104" y="150" fill="#FFFFFF" fontSize="22" fontWeight="700" fontStretch="75%" letterSpacing="0.9">YOUR COUNTRY</text>
        <text x="104" y="178" fill="#84866D" fontSize="12" fontWeight="700" fontStretch="75%" letterSpacing="0.6">NEXT STOP: COMING SOON</text>
        <g transform="translate(270 76)" fill="#84866D">
          {[0, -34, 34, -68, 68].map((deg) => (
            <path key={deg} d={leaf} transform={deg ? `rotate(${deg} 0 26)` : undefined} />
          ))}
        </g>
        <path
          d="M246 150 V178 M252 150 V178 M256 150 V178 M264 150 V178 M268 150 V178 M276 150 V178 M280 150 V178 M286 150 V178 M294 150 V178"
          stroke="#FFFFFF"
          strokeWidth="2"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}

type DialogProps = {
  initialCountry: string;
  onClose: () => void;
  onSignedUp: () => void;
};

function IntlDialog({ initialCountry, onClose, onSignedUp }: DialogProps) {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(initialCountry);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLAnchorElement>(null);

  const countries = useMemo(() => {
    const list = COUNTRY_CODES.map((code) => ({ code, name: countryName(code) }));
    list.sort((a, b) => a.name.localeCompare(b.name, "en"));
    return list;
  }, []);

  const siteKey =
    typeof process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === "string"
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.trim()
      : "";

  // Escape closes, the page behind does not scroll, focus starts in the form.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  // Same Turnstile setup as the footer signup, sharing its script tag.
  useEffect(() => {
    if (done || !siteKey || !turnstileRef.current) return;
    let cancelled = false;
    function renderWidget() {
      const api = turnstileApi();
      if (cancelled || !api || !turnstileRef.current || widgetIdRef.current) return;
      turnstileRef.current.innerHTML = "";
      widgetIdRef.current = api.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
    }
    let script = document.querySelector('script[data-turnstile="contact"]') as HTMLScriptElement | null;
    if (script) {
      if (turnstileApi()) renderWidget();
      else script.addEventListener("load", renderWidget);
    } else {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "contact";
      script.addEventListener("load", renderWidget);
      document.head.appendChild(script);
    }
    const tag = script;
    return () => {
      cancelled = true;
      tag.removeEventListener("load", renderWidget);
      const api = turnstileApi();
      if (widgetIdRef.current && api?.remove) {
        api.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, done]);

  function resetTurnstile() {
    setTurnstileToken("");
    const api = turnstileApi();
    if (api && widgetIdRef.current) api.reset(widgetIdRef.current);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please tick the box so we can email you.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, token: turnstileToken, source: "intl", country }),
      });
      const result = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && result?.ok === true) {
        setDone(true);
        onSignedUp();
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

  const name = countryName(country);

  return (
    <div
      className="s-intl-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {done ? (
        <div className="s-intl-card s-intl-done" role="dialog" aria-modal="true" aria-labelledby="s-intl-done-title">
          <button type="button" className="s-intl-x" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
          <DeliveryTag className="s-intl-tag" />
          <p className="s-eyebrow">International delivery</p>
          <h2 id="s-intl-done-title" className="s-intl-h">You&apos;re on the list</h2>
          <p className="s-intl-p">
            We&apos;ll email you as soon as we deliver the Discovery Deck to {name}. Until then, go and meet the wild ones.
          </p>
          <Link href="/map" className="s-intl-olive" ref={doneRef} onClick={onClose}>
            Find your agave
          </Link>
          <button type="button" className="s-intl-back" onClick={onClose}>
            Back to the site
          </button>
        </div>
      ) : (
        <form
          className="s-intl-card s-intl-form"
          role="dialog"
          aria-modal="true"
          aria-labelledby="s-intl-title"
          onSubmit={handleSubmit}
          noValidate
        >
          <button type="button" className="s-intl-x" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
          <div className="s-intl-intro">
            <div className="s-intl-art">
              <DeliveryTag className="s-intl-tag" />
            </div>
            <p className="s-eyebrow">International delivery</p>
            <h2 id="s-intl-title" className="s-intl-h">Delivering to {name}, soon</h2>
            <p className="s-intl-p">
              We deliver within the US for now. Leave your email and we&apos;ll tell you the moment we can deliver the
              Discovery Deck to your country.
            </p>
          </div>
          <div className="s-intl-fields">
            <div className="s-intl-field">
              <label htmlFor="s-intl-email">Email</label>
              <input
                id="s-intl-email"
                ref={emailRef}
                type="email"
                className="s-intl-in"
                placeholder="you@example.com"
                autoComplete="email"
                required
                maxLength={200}
                value={email}
                disabled={sending}
                onChange={(ev) => setEmail(ev.target.value)}
              />
            </div>
            <div className="s-intl-field">
              <label htmlFor="s-intl-country">Country</label>
              <select
                id="s-intl-country"
                className="s-intl-in"
                value={country}
                disabled={sending}
                onChange={(ev) => setCountry(ev.target.value)}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="s-intl-help">Filled in from your location. Change it if it&apos;s wrong.</span>
            </div>
            <div className="s-intl-check">
              <input
                id="s-intl-consent"
                type="checkbox"
                checked={consent}
                disabled={sending}
                onChange={(ev) => setConsent(ev.target.checked)}
              />
              <label htmlFor="s-intl-consent">
                Yes, email me when you deliver to my country, plus the occasional Mezcalómano update. Unsubscribe anytime.
              </label>
            </div>
            <div className="s-intl-ts" ref={turnstileRef} />
            {error ? (
              <p className="s-intl-err" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="s-intl-go" disabled={sending} aria-busy={sending}>
              {sending ? "Sending…" : "Notify me"}
            </button>
            <p className="s-intl-note">
              We only use your email for Mezcalómano updates.{" "}
              <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
                Privacy
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

/** The slim bar shown above the header to visitors outside the US, plus its signup dialog. */
export function IntlBar({ visitor }: { visitor: IntlVisitor }) {
  const [open, setOpen] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const { country, dismiss, markSignedUp } = visitor;
  const close = useCallback(() => setOpen(false), []);

  if (!country) return null;
  const name = countryName(country);

  return (
    <>
      {signedUp ? null : (
        <div className="s-intl-bar" role="region" aria-label="Delivery notice">
          <p>
            <span className="long">We deliver to US addresses only, for now. Gifting to the US? Free US delivery.</span>
            <span className="short">US delivery only, for now.</span>
            <button type="button" className="s-intl-link" onClick={() => setOpen(true)}>
              <span className="long">Want delivery to {name}? Get notified</span>
              <span className="short">Get notified</span>
            </button>
          </p>
          <button type="button" className="s-intl-bar-x" aria-label="Dismiss delivery notice" onClick={dismiss}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
      {open ? (
        <IntlDialog
          initialCountry={country}
          onClose={close}
          onSignedUp={() => {
            markSignedUp();
            setSignedUp(true);
          }}
        />
      ) : null}
    </>
  );
}
