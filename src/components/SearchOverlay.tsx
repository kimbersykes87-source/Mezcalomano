"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function SearchOverlay({
  open,
  onClose,
  value,
  onChange,
  placeholder = "Search by common name…",
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#272926]/95 backdrop-blur-sm"
      role="dialog"
      aria-label="Search species"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-[var(--agave-yellow)] focus:outline-none focus:ring-1 focus:ring-[var(--agave-yellow)]"
          aria-label="Search by common name"
        />
        <button
          type="button"
          onClick={onClose}
          className="rounded p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close search"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
