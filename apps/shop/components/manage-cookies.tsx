"use client";

export default function ManageCookies() {
  const reset = () => {
    document.cookie = "consent_state=unset; path=/; max-age=0";
    window.location.reload();
  };

  return (
    <button
      className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
      onClick={reset}
    >
      Reset cookie consent
    </button>
  );
}
