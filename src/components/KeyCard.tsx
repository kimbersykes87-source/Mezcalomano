"use client";

import {
  BookOpen,
  Leaf,
  MapPin,
  Mountain,
  Ruler,
  Users,
  Wine,
} from "lucide-react";

const ICON_CLASS = "size-4 shrink-0 text-[var(--agave-yellow)]";

const LEGEND = [
  { Icon: Leaf, label: "Common name" },
  { Icon: Wine, label: "Mezcal use" },
  { Icon: Users, label: "Producers" },
  { Icon: BookOpen, label: "Description" },
  { Icon: Ruler, label: "Size" },
  { Icon: MapPin, label: "State" },
  { Icon: Mountain, label: "Terrain" },
  { Icon: BookOpen, label: "Species name" },
] as const;

export function KeyCard() {
  return (
    <article className="relative flex w-full max-w-xl flex-col items-center sm:max-w-2xl" style={{ gap: 40 }}>
      <div className="relative flex aspect-square w-4/5 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--agave-yellow)] bg-[#272926] px-2">
        <p className="text-center text-lg font-semibold text-white/90">
          How to read the species cards
        </p>
      </div>
      <div className="flex w-4/5 min-h-[280px] flex-col items-center rounded-2xl border border-[var(--agave-yellow)] px-4 py-5 text-center text-white sm:px-5">
        <p className="text-sm text-white/70">
          Each card uses these icons to label the information below.
        </p>
        <div className="mt-4 flex w-full flex-col items-center gap-4">
          {LEGEND.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className={ICON_CLASS} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--agave-yellow)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
