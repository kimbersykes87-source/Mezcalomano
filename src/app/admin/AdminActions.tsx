"use client";

import { useState } from "react";

/** Send a test of the Monday email now, and log out. */
export default function AdminActions() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

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

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 8 }}>
      <button className="adm-btn" onClick={sendTest} disabled={busy}>
        {busy ? "Sending" : "Send the weekly email now"}
      </button>
      <button className="adm-btn" onClick={logout}>
        Log out
      </button>
      <span className="adm-sub" role="status">{msg}</span>
    </div>
  );
}
