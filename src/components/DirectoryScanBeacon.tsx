"use client";

import { useEffect } from "react";

/**
 * Counts a likely box QR scan. The QR on the Discovery Deck box is the plain
 * address mezcalomano.com/directory, so the best signal available is: the
 * visit started on /directory, the browser sent no referrer, and the address
 * carries no query string. Typed addresses and bookmarks look the same, so the
 * dashboard calls the number "scans (visits with no referrer)".
 *
 * Counted once per browser session (sessionStorage), never on a reload or a
 * back/forward step, and never in a browser with the mm_ignore cookie
 * (mezcalomano.com/?ignore=1). Renders nothing.
 */

const SEEN_KEY = "mm-qr-scan";

function shouldCount(): boolean {
  if (document.referrer) return false;
  if (window.location.pathname.replace(/\/$/, "") !== "/directory") return false;
  if (window.location.search) return false;
  if (document.cookie.split("; ").includes("mm_ignore=1")) return false;

  // The page load itself must be a fresh arrival on /directory, not a reload,
  // a back/forward step, or a move here from another page of the site.
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav) {
    if (nav.type !== "navigate") return false;
    try {
      if (new URL(nav.name).pathname.replace(/\/$/, "") !== "/directory") return false;
    } catch {
      return false;
    }
  }

  try {
    if (window.sessionStorage.getItem(SEEN_KEY)) return false;
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // No session storage (private modes): without it "once per session" cannot be kept, so do not count.
    return false;
  }
  return true;
}

export default function DirectoryScanBeacon() {
  useEffect(() => {
    try {
      if (!shouldCount()) return;
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/qr-scan");
      } else {
        void fetch("/api/qr-scan", { method: "POST", keepalive: true });
      }
    } catch {
      // Counting must never get in the way of the page.
    }
  }, []);
  return null;
}
