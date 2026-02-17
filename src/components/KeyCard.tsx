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
      <div className="flex min-h-[280px] flex-col gap-3 p-4 text-white">
        <p className="text-sm text-white/70">
          Each card uses these icons to label the information below. The paragraph under the names is the species description.
        </p>
        <ul className="flex flex-col gap-2.5">
          {LEGEND.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-sm"
            >
              <Icon className={ICON_CLASS} aria-hidden />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
