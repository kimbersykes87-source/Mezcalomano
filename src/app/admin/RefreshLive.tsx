"use client";

import { useRouter } from "next/navigation";

/** Reloads the page with ?fresh=<time>, which tells the server to skip its 60 second hold and ask the source again. */
export default function RefreshLive({ path, periodKey }: { path: string; periodKey: string }) {
  const router = useRouter();
  return (
    <button className="adm-btn" onClick={() => router.push(`${path}?p=${periodKey}&fresh=${Date.now()}`)}>
      Refresh now
    </button>
  );
}
