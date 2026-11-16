"use client";
/* eslint-disable @next/next/no-img-element -- the reduced-motion still is a remote R2 file shown full frame */

import { useCallback, useEffect, useRef, useState } from "react";
import { GIVEAWAY_MEDIA, type LookupResult } from "@/lib/giveaway/config";

// window.turnstile is typed in src/components/ContactForm.tsx

type Phase = "idle" | "checking" | "loading" | "playing" | "done";

const SQ = `${GIVEAWAY_MEDIA}/sq`; // square (1:1) set, so the whole flow fits one phone screen

// Siona's approved copy, 16 Nov. The three lines still tagged DRAFT below are mine and are waiting on her.
const COPY = {
  title: "Did you win?",
  intro:
    "We drew one winner of the Mezcalómano Discovery Deck on December 7. Tap below to see your result. Whatever it says, you'll meet one of the 40 agaves in the deck.",
  win: "You won the Mezcalómano Discovery Deck.",
  winSub:
    "We've emailed you from hola@mezcalomano.com. Reply by December 10, 11:59 p.m. ET with your full name and US shipping address so we can send your deck. Check your spam folder if you can't see it.",
  lose: "This time it wasn't you.",
  // Both endings name the card the same way, so the agave is the point of the page either way.
  card: (name: string) => `Your card is the ${name}, one of the 40 agaves in the deck.`,
  meet: (name: string) => `Meet the ${name}`,
  shop: "Shop the deck",
  // Non-winners only. The 7 Dec email deliberately carries no code, so this page is the only place it is delivered.
  codeLead: "Thanks for entering. Here's 10% off the Mezcalómano Discovery Deck until December 14 with code",
  codeTail: "It works on the two-pack and five-pack too.",
  notYet: "The draw is on December 7. Come back then to see your result.",
  // Shown when there is no code: no link, or a code that does not resolve. There is no address box to offer instead.
  needLink:
    "Open the link from your December 7 email to see your result. If it isn't working, email hola@mezcalomano.com and we'll look it up for you.",
};

/** Held for this tab only, so a reload or a tap back still works once the code is out of the address bar. */
const STORE_KEY = "mm-giveaway-code";
const clean = (raw: string) => raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 32);

/** Non-winners only, tagged so the giveaway's own traffic to the deck is separable in analytics. */
const SHOP_URL =
  "https://shop.mezcalomano.com/products/discovery-deck?utm_source=mezcal-culture&utm_medium=web&utm_campaign=giveaway-2026&utm_content=reveal-page";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};
const ts = () => (typeof window !== "undefined" ? (window.turnstile as unknown as Turnstile | undefined) : undefined);

export default function GiveawayReveal({ initialCode = "", preview = "" }: { initialCode?: string; preview?: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const tsId = useRef<string | null>(null);
  const tokenRef = useRef("");
  const [code, setCode] = useState(initialCode);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [still, setStill] = useState(false);

  // The code came in on the link (?c=...): keep it for this tab, then take it out of the address bar so it is not
  // shared, bookmarked, or handed on in the referrer when they tap through to the directory. It is stashed in
  // sessionStorage because there is no address box to fall back on if they reload.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const fromUrl = clean(p.get("c") ?? "");
    if (fromUrl) {
      try {
        sessionStorage.setItem(STORE_KEY, fromUrl);
      } catch {}
      p.delete("c");
      const q = p.toString();
      window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
      return;
    }
    try {
      const saved = clean(sessionStorage.getItem(STORE_KEY) ?? "");
      if (saved) setCode(saved);
    } catch {}
  }, []);

  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (code) btnRef.current?.focus({ preventScroll: true });
  }, [code]);

  // Turnstile, invisible unless Cloudflare needs the person to do something
  useEffect(() => {
    if (!siteKey || !tsRef.current) return;
    let cancelled = false;
    const render = () => {
      const t = ts();
      if (cancelled || !t || !tsRef.current || tsId.current) return;
      tsId.current = t.render(tsRef.current, {
        sitekey: siteKey,
        theme: "dark",
        appearance: "interaction-only",
        callback: (tok: string) => (tokenRef.current = tok),
        "expired-callback": () => (tokenRef.current = ""),
        "error-callback": () => (tokenRef.current = ""),
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile="giveaway"]');
    if (existing) {
      if (ts()) render();
      else existing.addEventListener("load", render);
    } else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
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

  const newToken = useCallback(() => {
    tokenRef.current = "";
    const t = ts();
    if (tsId.current && t) t.reset(tsId.current);
  }, []);

  /** Waits up to 6 s for the invisible check to hand over a token (it is usually ready before anyone taps). */
  async function waitForToken(): Promise<string> {
    for (let i = 0; i < 30 && !tokenRef.current; i++) await new Promise((r) => setTimeout(r, 200));
    return tokenRef.current;
  }

  /** Waits until enough video has arrived to play through without stalling (max 10 s, then plays anyway). */
  function whenPlayable(v: HTMLVideoElement): Promise<void> {
    return new Promise((resolve) => {
      if (v.readyState >= 4) return resolve();
      const done = () => {
        v.removeEventListener("canplaythrough", done);
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(done, 10000);
      v.addEventListener("canplaythrough", done);
    });
  }

  function keepFrameInView() {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function draw(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "idle") return;
    setError("");
    setPhase("checking");
    keepFrameInView();
    const token = await waitForToken();
    let res: { ok: boolean; result?: LookupResult; error?: string };
    try {
      const r = await fetch("/api/giveaway/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, token, ...(preview ? { preview } : {}) }),
      });
      res = await r.json();
    } catch {
      res = { ok: false, error: "Something went wrong. Please try again." };
    }
    newToken();
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
    const v = videoRef.current;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !v) {
      setStill(true);
      setPhase("done");
      return;
    }
    setPhase("loading");
    v.src = `${SQ}/video/${out.slug}.mp4`;
    v.preload = "auto";
    v.load();
    await whenPlayable(v);
    setPhase("playing");
    try {
      await v.play();
    } catch {
      setStill(true);
      setPhase("done");
    }
  }

  /** Tap the video while it plays to jump to the landed card. */
  function skip() {
    const v = videoRef.current;
    if (phase !== "playing" || !v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.max(0, v.duration - 0.05);
  }

  function watchAgain() {
    const v = videoRef.current;
    if (!v || still) return;
    v.currentTime = 0;
    setPhase("playing");
    v.play().catch(() => setPhase("done"));
  }

  /** Test only: back to an empty start. Nothing is stored, so every run is fresh. */
  function startOver() {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    setResult(null);
    setError("");
    setStill(false);
    setPhase("idle"); // the code is kept: it is the only way back to a result
  }

  const r = result?.status === "result" ? result : null;
  const busy = phase === "checking" || phase === "loading" || phase === "playing";

  return (
    <main className="gv-wrap">
      <header className="gv-head">
        <div className="gv-eyebrow">Mezcalómano x Mezcal Culture Giveaway</div>
        {/* The headline itself carries the result, so the answer is the first thing read, not a line under the card. */}
        <h1 className="gv-title">{r ? (r.won ? COPY.win : COPY.lose) : COPY.title}</h1>
        {!r && <p className="gv-intro">{COPY.intro}</p>}
      </header>

      <div ref={frameRef} className={`gv-frame${phase === "playing" ? " is-playing" : ""}`} onClick={skip}>
        <video
          ref={videoRef}
          poster={`${SQ}/poster.webp`}
          muted
          playsInline
          preload="none"
          onEnded={() => setPhase("done")}
          aria-label="A ribbon of agave cards turns over and one card is drawn"
        />
        {still && r && <img src={`${SQ}/end/${r.slug}.webp`} alt={`The ${r.name} card, face up`} />}
        {(phase === "checking" || phase === "loading") && (
          <div className="gv-loader" aria-hidden="true">
            <span />
          </div>
        )}
        {phase === "playing" && <div className="gv-skip">Tap to skip</div>}
      </div>

      {/* One panel under the video that never changes height, so nothing jumps */}
      <section className="gv-panel" aria-live="polite">
        {phase === "done" && result ? (
          <div className="gv-result">
            {r?.test && <span className="gv-tag">Test result</span>}
            {preview && <span className="gv-tag">Rehearsal, results opened early</span>}
            {r && (
              <>
                <p className="gv-card">{COPY.card(r.name)}</p>
                {r.won && <p>{COPY.winSub}</p>}
                {!r.won && r.code && (
                  <p className="gv-code">
                    {COPY.codeLead} <span className="gv-code-value">{r.code}</span>. {COPY.codeTail}
                  </p>
                )}
                <div className="gv-btns">
                  <a className="gv-btn" href={`https://mezcalomano.com/directory/${r.slug}`}>
                    {COPY.meet(r.name)}
                  </a>
                  {!r.won && (
                    <a className="gv-btn gv-btn--ghost" href={SHOP_URL}>
                      {COPY.shop}
                    </a>
                  )}
                </div>
                <div className="gv-row">
                  {!still && (
                    <button type="button" className="gv-link" onClick={watchAgain}>
                      Watch again
                    </button>
                  )}
                  {r.test && (
                    <button type="button" className="gv-link" onClick={startOver}>
                      Start over
                    </button>
                  )}
                </div>
              </>
            )}
            {result.status === "not-yet" && <p>{COPY.notYet}</p>}
            {result.status === "not-entered" && <p>{COPY.needLink}</p>}
          </div>
        ) : (
          code ? (
            <form className="gv-form" onSubmit={draw}>
              <button ref={btnRef} className="gv-btn" type="submit" disabled={busy}>
                {busy ? "Drawing..." : "See my result"}
              </button>
              {error && <p className="gv-error">{error}</p>}
            </form>
          ) : (
            <p className="gv-need-link">{COPY.needLink}</p>
          )
        )}
        <div ref={tsRef} className={`gv-ts${phase === "done" ? " is-hidden" : ""}`} />
      </section>
    </main>
  );
}
