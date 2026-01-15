"use client";

import { useEffect, useState } from "react";

type ConsentState = "unset" | "accepted" | "rejected";

const readConsent = (): ConsentState => {
  if (typeof document === "undefined") return "unset";
  const match = document.cookie.match(/consent_state=([^;]+)/);
  return (match?.[1] as ConsentState) ?? "unset";
};

const setConsentCookie = (state: ConsentState) => {
  document.cookie = `consent_state=${state}; path=/; max-age=${60 * 60 * 24 * 365}`;
};

export default function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>("unset");

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  if (consent !== "unset") return null;

  const updateConsent = async (state: ConsentState) => {
    setConsentCookie(state);
    setConsent(state);
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent: state }),
    });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-lg md:left-auto md:right-6 md:w-96">
      <p className="text-sm text-slate-700">
        We use cookies to improve your experience and to enable analytics where required. You can manage your
        preferences at any time.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => updateConsent("accepted")}
        >
          Accept
        </button>
        <button
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          onClick={() => updateConsent("rejected")}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
