"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Globe,
  Leaf,
  Link2,
  MapPin,
  Mountain,
  Ruler,
  Users,
  Wine,
} from "lucide-react";
import { toSlug } from "@/lib/slug";
import type { Species } from "@/types/species";

const ICON_CLASS = "size-4 shrink-0 text-[var(--agave-yellow)]";

function parseHabitat(habitat: Species["habitat"]) {
  if (!habitat || typeof habitat !== "object") return null;
  const t = habitat as { terrain?: string };
  if (!t.terrain) return null;
  return t;
}

export function SpeciesCard({
  species,
  showPermalink = true,
}: {
  species: Species;
  showPermalink?: boolean;
}) {
  const habitat = parseHabitat(species.habitat);
  const sizeStr =
    species.size_height_feet || species.size_height_meters
      ? species.size_height_feet && species.size_height_meters
        ? `${species.size_height_feet} (${species.size_height_meters})`
        : species.size_height_feet || species.size_height_meters
      : null;

  const producerList = species.producers
    ? species.producers.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const linkList = species.producer_links
    ? species.producer_links.split(",").map((u) => u.trim()).filter(Boolean)
    : [];
  const hasProducers = producerList.length > 0;

  const statesFormatted =
    species.states &&
    species.states
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "en"))
      .join("; ");

  return (
    <article className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-[#32342f] shadow-lg sm:max-w-2xl">
      {showPermalink && (
        <Link
          href={"/directory/" + toSlug(species.common_name)}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-[var(--agave-yellow)] transition-colors hover:bg-black/70 hover:text-white"
          aria-label={"Open direct link to " + species.common_name}
        >
          <Link2 className="size-5" />
        </Link>
      )}
      <div className="relative aspect-square w-full shrink-0 bg-[#272926]">
        {species.image_url ? (
          <Image
            src={species.image_url}
            alt={species.common_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 32rem"
            unoptimized={!species.image_url.includes("supabase")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--agave-yellow)]/50">
            <Leaf className="size-16" />
          </div>
        )}
      </div>
      <div className="flex min-h-[280px] flex-col gap-3 p-4 text-white">
        <div>
          <p className="notranslate flex items-center gap-2 font-bold" translate="no">
            <Leaf className={ICON_CLASS} aria-hidden />
            {species.common_name}
          </p>
          <p className="notranslate mt-0.5 flex items-center gap-2 italic text-white/90" translate="no">
            <BookOpen className={ICON_CLASS} aria-hidden />
            {species.scientific_name}
          </p>
          {species.description && (
            <p className="mt-1.5 text-sm text-white/80">{species.description}</p>
          )}
        </div>
        {sizeStr && (
          <div className="flex items-start gap-2 text-sm">
            <Ruler className={ICON_CLASS} aria-hidden />
            <span>{sizeStr}</span>
          </div>
        )}
        {statesFormatted && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className={ICON_CLASS} aria-hidden />
            <span>{statesFormatted}</span>
          </div>
        )}
        {species.geo_region && (
          <div className="flex items-start gap-2 text-sm">
            <Globe className={ICON_CLASS} aria-hidden />
            <span>{species.geo_region}</span>
          </div>
        )}
        {habitat?.terrain && (
          <div className="flex gap-2 text-sm">
            <Mountain className={ICON_CLASS} aria-hidden />
            <span>{habitat.terrain}</span>
          </div>
        )}
        {species.mezcal_use && (
          <div className="flex items-start gap-2 text-sm">
            <Wine className={ICON_CLASS} aria-hidden />
            <span>{species.mezcal_use}</span>
          </div>
        )}
        {hasProducers && (
          <div className="flex items-start gap-2 text-sm">
            <Users className={ICON_CLASS} aria-hidden />
            <span className="flex flex-wrap gap-x-1.5 gap-y-0.5">
              {producerList.map((name, i) => {
                const url = linkList[i]?.startsWith("http") ? linkList[i] : null;
                return (
                  <span key={name + "-" + i}>
                    {i > 0 && ", "}
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--agave-yellow)] underline decoration-[var(--agave-yellow)]/60 underline-offset-2 hover:decoration-[var(--agave-yellow)]"
                      >
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </span>
                );
              })}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
