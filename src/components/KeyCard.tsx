"use client";

import {
  BookOpen,
  Globe,
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
  { Icon: BookOpen, label: "Scientific name" },
  { Icon: Ruler, label: "Size (height)" },
  { Icon: MapPin, label: "States" },
  { Icon: Globe, label: "Geo region" },
  { Icon: Mountain, label: "Terrain" },
  { Icon: Wine, label: "Mezcal use" },
  { Icon: Users, label: "Producers" },
] as const;

export function KeyCard() {
  return (
    <article className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-[#32342f] shadow-lg sm:max-w-2xl">
      <div className="relative flex aspect-square w-full shrink-0 items-center justify-center bg-[#272926] px-6">
        <p className="text-center text-lg font-semibold text-white/90">
          How to read the species cards
        </p>
      </div>
      <div className="flex min-h-[280px] flex-col p-5 text-white">
        <p className="text-sm text-white/70">
          Each card uses these icons to label the information below. The paragraph under the names is the species description.
        </p>
        <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center">
          {LEGEND.map(({ Icon, label }) => (
            <span key={label} className="contents">
              <span className="flex items-center justify-end pr-2">
                <Icon className={ICON_CLASS} aria-hidden />
              </span>
              <span className="text-sm">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
