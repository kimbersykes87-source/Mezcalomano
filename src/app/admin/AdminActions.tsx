"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Send a test of the Monday email now, and log out. */
export default function AdminActions() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function sendTest() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/send-weekly", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; to?: string };
      setMsg(data.ok ? `Sent to ${data.to}.` : data.error ?? "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    setBusy(true);
    setMsg("Refreshing, this takes up to a minute.");
    try {
      const res = await fetch("/api/admin/refresh", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; failed?: string[] };
      setMsg(data.ok ? "Refreshed." : data.error ?? `Refreshed, but these failed: ${(data.failed ?? []).join(", ")}.`);
      router.refresh();
    } catch {
      setMsg("Could not refresh.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 8 }}>
      <button className="adm-btn" onClick={refresh} disabled={busy}>
        Refresh now
      </button>
      <button className="adm-btn" onClick={sendTest} disabled={busy}>
        {busy ? "Sending" : "Send the weekly email now"}
      </button>
      <a className="adm-btn" href="/admin/instagram">
        Enter Instagram figures
      </a>
      <button className="adm-btn" onClick={logout}>
        Log out
      </button>
      <span className="adm-sub" role="status">{msg}</span>
    </div>
  );
}
