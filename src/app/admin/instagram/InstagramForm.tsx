"use client";

import { useState } from "react";

type Saved = { followers?: number; profileViews?: number; reach?: number };

const label = (d: string) =>
  `Week ending Sunday ${new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;

const inputStyle = {
  width: "100%", padding: "10px 12px", marginTop: 4, background: "#1f211e", color: "inherit",
  border: "1px solid rgba(255,255,255,0.2)", fontSize: 16, fontFamily: "inherit",
} as const;

export default function InstagramForm({ weeks, initialWeek, initialSaved }: { weeks: string[]; initialWeek: string; initialSaved: Saved }) {
  const [week, setWeek] = useState(initialWeek);
  const [followers, setFollowers] = useState(initialSaved.followers?.toString() ?? "");
  const [views, setViews] = useState(initialSaved.profileViews?.toString() ?? "");
  const [reach, setReach] = useState(initialSaved.reach?.toString() ?? "");
  const [by, setBy] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekEnd: week, followers, profileViews: views, reach, by }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      setOk(Boolean(data.ok));
      setMsg(data.ok ? "Saved. It will appear in Monday's email and on the dashboard." : data.error ?? "Could not save.");
    } catch {
      setOk(false);
      setMsg("Could not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <label>
        Week
        <select value={week} onChange={(e) => setWeek(e.target.value)} style={inputStyle}>
          {weeks.map((w) => (
            <option key={w} value={w}>{label(w)}</option>
          ))}
        </select>
      </label>
      <label>
        Followers today
        <input inputMode="numeric" required value={followers} onChange={(e) => setFollowers(e.target.value)} style={inputStyle} />
      </label>
      <label>
        Profile visits, last 7 days
        <input inputMode="numeric" required value={views} onChange={(e) => setViews(e.target.value)} style={inputStyle} />
      </label>
      <label>
        Accounts reached, last 7 days (optional)
        <input inputMode="numeric" value={reach} onChange={(e) => setReach(e.target.value)} style={inputStyle} />
      </label>
      <label>
        Your name (optional)
        <input value={by} onChange={(e) => setBy(e.target.value)} style={inputStyle} />
      </label>
      <div>
        <button className="adm-btn adm-btn-primary" disabled={busy} type="submit">
          {busy ? "Saving" : "Save"}
        </button>
      </div>
      <p role="status" className={ok ? "adm-up" : "adm-down"} style={{ margin: 0 }}>{msg}</p>
    </form>
  );
}
