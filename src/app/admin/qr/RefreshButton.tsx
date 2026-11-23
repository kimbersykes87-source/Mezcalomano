"use client";

/** Reloads the page with ?fresh=<time> so the server skips its short hold. Date.now runs on click, not during render. */
export default function RefreshButton() {
  return (
    <button className="adm-btn" onClick={() => window.location.assign(`/admin/qr?fresh=${Date.now()}`)}>
      Refresh now
    </button>
  );
}
