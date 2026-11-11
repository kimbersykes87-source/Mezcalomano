"use client";
/* eslint-disable @next/next/no-img-element -- the reduced-motion still is a remote R2 file shown full frame */

import { useCallback, useEffect, useRef, useState } from "react";
import { GIVEAWAY_MEDIA, type LookupResult } from "@/lib/giveaway/config";

// window.turnstile is typed in src/components/ContactForm.tsx

type Phase = "idle" | "checking" | "playing" | "done";

// DRAFT copy: placeholders until Siona writes and approves the real lines. Every line shows a DRAFT tag on the page.
const COPY = {
  intro: "Type the email you entered with to draw your card.",
  win: "You won the Discovery Deck.",
  winSub:
    "We have emailed you from hola@mezcalomano.com. Reply by December 10 with your name and US shipping address.",
  lose: "This time it wasn't you.",
  loseSub:
    "Thanks for entering. We drew one winner at random from every entry.",
  agave: (name: string) =>
    `Your card is the ${name}. Here is where it grows and who bottles it.`,
  notYet: "The draw is on December 7. Come back then to draw your card.",
  notEntered:
    "We couldn't find an entry for that email. Check the spelling, or use the address you entered with.",
};

function Draft() {
  return <span className="gv-draft">DRAFT </span>;
}

export default function GiveawayReveal() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const tsId = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [still, setStill] = useState(false);

  // Turnstile, same explicit render pattern as the contact form
  useEffect(() => {
    if (!siteKey || !tsRef.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.turnstile || !tsRef.current || tsId.current)
        return;
      tsRef.current.innerHTML = "";
      tsId.current = window.turnstile.render(tsRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile="giveaway"]',
    );
    if (existing) {
      if (window.turnstile) render();
      else existing.addEventListener("load", render);
    } else {
      const s = document.createElement("script");
      s.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.dataset.turnstile = "giveaway";
      s.addEventListener("load", render);
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  const resetTurnstile = useCallback(() => {
    setToken("");
    if (tsId.current && window.turnstile) window.turnstile.reset(tsId.current);
  }, []);

  /** Back to the start: poster, empty result, new verification. Nothing is stored, so every run is fresh. */
  const startOver = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    setResult(null);
    setError("");
    setStill(false);
    setPhase("idle");
    resetTurnstile();
  }, [resetTurnstile]);

  async function draw(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPhase("checking");
    let res: { ok: boolean; result?: LookupResult; error?: string };
    try {
      const r = await fetch("/api/giveaway/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      res = await r.json();
    } catch {
      res = { ok: false, error: "Something went wrong. Please try again." };
    }
    resetTurnstile();
    if (!res.ok || !res.result) {
      setError(res.error ?? "Something went wrong. Please try again.");
      setPhase("idle");
      return;
    }
    const out = res.result;
    setResult(out);
    if (out.status !== "result") {
      setPhase("done");
      return;
    }
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const v = videoRef.current;
    if (reduce || !v) {
      setStill(true);
      setPhase("done");
      return;
    }
    v.src = `${GIVEAWAY_MEDIA}/video/${out.slug}.mp4`;
    v.load();
    setPhase("playing");
    try {
      await v.play();
    } catch {
      setStill(true);
      setPhase("done");
    }
  }

  const r = result?.status === "result" ? result : null;

  return (
    <main className="gv-wrap">
      <header className="gv-head">
        <div className="gv-eyebrow">Mezcalómano x Mezcal Culture</div>
        <h1 className="gv-title">Draw your card</h1>
      </header>

      <div className="gv-frame">
        <video
          ref={videoRef}
          poster={`${GIVEAWAY_MEDIA}/poster.webp`}
          muted
          playsInline
          preload="none"
          onEnded={() => setPhase("done")}
          aria-label="A ribbon of agave cards turns over and one card is drawn"
        />
        {still && r && (
          <img
            src={`${GIVEAWAY_MEDIA}/end/${r.slug}.webp`}
            alt={`The ${r.name} card, face up`}
          />
        )}
      </div>

      <div aria-live="polite">
        {phase === "done" && result ? (
          <div className="gv-result">
            {r?.test && <span className="gv-tag">Test result</span>}
            {r && (
              <>
                <h2>
                  <Draft />
                  {r.won ? COPY.win : COPY.lose}
                </h2>
                <p>
                  <Draft />
                  {r.won ? COPY.winSub : COPY.loseSub}
                </p>
                <p>
                  <Draft />
                  <a href={`https://mezcalomano.com/directory/${r.slug}`}>
                    {COPY.agave(r.name)}
                  </a>
                </p>
              </>
            )}
            {result.status === "not-yet" && (
              <p>
                <Draft />
                {COPY.notYet}
              </p>
            )}
            {result.status === "not-entered" && (
              <p>
                <Draft />
                {COPY.notEntered}
              </p>
            )}
            <button
              type="button"
              className="gv-btn gv-btn-ghost"
              onClick={startOver}
            >
              Start over
            </button>
          </div>
        ) : null}
        {/* the form stays mounted so the Turnstile widget survives Start over; it is only hidden */}
        <form
          className="gv-form"
          onSubmit={draw}
          hidden={phase === "playing" || phase === "done"}
        >
          <label className="gv-label" htmlFor="gv-email">
            <Draft />
            {COPY.intro}
          </label>
          <input
            id="gv-email"
            className="gv-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div ref={tsRef} />
          {error && <p className="gv-error">{error}</p>}
          <button
            className="gv-btn"
            type="submit"
            disabled={!token || phase === "checking"}
          >
            {phase === "checking" ? "Drawing..." : "Draw my card"}
          </button>
        </form>
      </div>
    </main>
  );
}
