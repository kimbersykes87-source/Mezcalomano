"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Site-wide analytics, added once in the root layout.
 *
 * 1. Cloudflare Web Analytics beacon (cookieless page views). Only renders when
 *    NEXT_PUBLIC_CF_BEACON_TOKEN is set, so local dev and previews stay quiet
 *    unless the variable is added there. The token is public by design (it is
 *    visible in the page source), so it is not a secret.
 * 2. Google Analytics 4 (gtag.js). Only renders when NEXT_PUBLIC_GA_MEASUREMENT_ID
 *    is set (Production only in Vercel). The measurement ID is public by design.
 *    GA4 enhanced measurement counts App Router page changes on its own.
 * 3. Outbound link click counter. Any click on a link that leaves
 *    mezcalomano.com is sent to /api/track with navigator.sendBeacon, which
 *    saves it to the Supabase `events` table. Links can add
 *    data-track-species and data-track-group for directory reporting.
 */

const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN?.trim() ?? "";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

const OWN_HOSTS = new Set(["mezcalomano.com", "www.mezcalomano.com", "localhost"]);

function sendClick(anchor: HTMLAnchorElement) {
  let target: URL;
  try {
    target = new URL(anchor.href, window.location.href);
  } catch {
    return;
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") return;
  if (OWN_HOSTS.has(target.hostname)) return;

  const payload = JSON.stringify({
    type: "outbound_click",
    path: window.location.pathname,
    url: target.href,
    species: anchor.dataset.trackSpecies || null,
    group: anchor.dataset.trackGroup || null,
    referrer: document.referrer || null,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/track", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    // Tracking must never get in the way of the click.
  }
}

export default function SiteAnalytics() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = event.target as Element | null;
      const anchor = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (anchor) sendClick(anchor);
    };
    // auxclick covers middle-click "open in new tab".
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);

  return (
    <>
      {CF_BEACON_TOKEN && (
        <Script
          id="cf-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN, spa: true })}
        />
      )}
      {GA_ID && (
        <>
          <Script id="ga-loader" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
