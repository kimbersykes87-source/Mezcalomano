"use client";
/* eslint-disable @next/next/no-img-element -- the reduced-motion still is a remote R2 file shown full frame */

import { useCallback, useEffect, useRef, useState } from "react";
import { GIVEAWAY_MEDIA, type LookupResult } from "@/lib/giveaway/config";

// window.turnstile is typed in src/components/ContactForm.tsx

type Phase = "idle" | "checking" | "loading" | "playing" | "done";

const SQ = `${GIVEAWAY_MEDIA}/sq`; // square (1:1) set, so the whole flow fits one phone screen

// DRAFT copy: placeholders until Siona writes and approves the real lines. Every line shows a DRAFT tag on the page.
const COPY = {
  win: "You won the Discovery Deck.",
  winSub: "Check your inbox for our email from hola@mezcalomano.com and reply by December 10 with your US shipping address.",
  lose: "This time it wasn't you.",
  loseSub: "Thanks for entering. The card is yours to explore.",
  meet: (name: string) => `Meet the ${name}`,
  // Non-winners only. The 7 Dec email deliberately carries no code, so this page is the only place it is delivered.
  codeLine: "Here's 10% off the Discovery Deck until December 14, with the code",
  notYet: "The draw is on December 7. Come back then to draw your card.",
  code: "MEZCALCULTURE",
  notEntered: "We couldn't find an entry for that email. Check the spelling, or use the address you entered with.",
};

function Draft() {
  return <span className="gv-draft">DRAFT </span>;
}

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};
const ts = () => (typeof window !== "undefined" ? (window.turnstile as unknown as Turnstile | undefined) : undefined);

export default function GiveawayReveal({ initialEmail = "" }: { initialEmail?: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const tsId = useRef<string | null>(null);
  const tokenRef = useRef("");
  const [email, setEmail] = useState(initialEmail);
  const [prefilled, setPrefilled] = useState(Boolean(initialEmail));
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [still, setStill] = useState(false);

  // The email came in on the link (?e=...): take it out of the address bar so it is not shared or bookmarked.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (!p.has("e") && !p.has("email")) return;
    p.delete("e");
    p.delete("email");
    const q = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
  }, []);

  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (prefilled) btnRef.current?.focus({ preventScroll: true });
  }, [prefilled]);

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
        body: JSON.stringify({ email, token }),
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
    setPhase("idle");
  }

  const r = result?.status === "result" ? result : null;
  const busy = phase === "checking" || phase === "loading" || phase === "playing";

  return (
    <main className="gv-wrap">
      <header className="gv-head">
        <div className="gv-eyebrow">Mezcalómano x Mezcal Culture</div>
        <h1 className="gv-title">Draw your card</h1>
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
                {!r.won && (
                  <p className="gv-code">
                    <Draft />
                    {COPY.codeLine} <span className="gv-code-value">{COPY.code}</span>
                  </p>
                )}
                <a className="gv-btn" href={`https://mezcalomano.com/directory/${r.slug}`}>
                  {COPY.meet(r.name)}
                </a>
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
            {result.status === "not-yet" && (
              <>
                <p>
                  <Draft />
                  {COPY.notYet}
                </p>
                <button type="button" className="gv-link" onClick={startOver}>
                  Try another email
                </button>
              </>
            )}
            {result.status === "not-entered" && (
              <>
                <p>
                  <Draft />
                  {COPY.notEntered}
                </p>
                <button type="button" className="gv-link" onClick={startOver}>
                  Try another email
                </button>
              </>
            )}
          </div>
        ) : (
          <form className="gv-form" onSubmit={draw}>
            <input
              id="gv-email"
              className="gv-input"
              type="email"
              autoComplete="email"
              placeholder="The email you entered with"
              aria-label="The email you entered with"
              required
              readOnly={busy}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setPrefilled(false);
              }}
            />
            <button ref={btnRef} className="gv-btn" type="submit" disabled={busy}>
              {busy ? "Drawing..." : "Draw my card"}
            </button>
            {error && <p className="gv-error">{error}</p>}
          </form>
        )}
        <div ref={tsRef} className="gv-ts" />
      </section>
    </main>
  );
}
