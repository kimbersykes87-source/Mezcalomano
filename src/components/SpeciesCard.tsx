"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { toSlug } from "@/lib/slug";
import type { Species } from "@/types/species";

/* Match localhost: explicit size + fallback color so icons render the same in production */
const ICON_CLASS =
  "species-card-icon size-4 h-4 w-4 shrink-0 text-[var(--agave-yellow)] text-[#a29037]";

function parseHabitat(habitat: Species["habitat"]) {
  if (!habitat || typeof habitat !== "object") return null;
  const t = habitat as { terrain?: string };
  if (!t.terrain) return null;
  return t;
}

export function SpeciesCard({
  species,
  showPermalink = true,
  fallbackImageUrl,
}: {
  species: Species;
  showPermalink?: boolean;
  /** When the main image fails to load (e.g. broken Supabase URL), show this instead */
  fallbackImageUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const displayUrl =
    imageError && fallbackImageUrl ? fallbackImageUrl : species.image_url;
  /** Skip Next.js image optimizer for same-origin paths to avoid 400s in production */
  const isLocalAsset =
    typeof displayUrl === "string" &&
    (displayUrl.startsWith("/") || displayUrl.startsWith("."));
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

  const slugHref = "/directory/" + toSlug(species.common_name);
  const articleEl = (
    <article className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-[#32342f] shadow-lg sm:max-w-2xl">
      <div className="relative aspect-square w-full shrink-0 bg-[#272926]">
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={species.common_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 32rem"
            unoptimized={isLocalAsset || !displayUrl.includes("supabase")}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--agave-yellow)]/50">
            <Leaf className="size-16" />
          </div>
        )}
      </div>
      <div className="species-card-content flex min-h-[280px] flex-col p-5 text-white">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-center">
          <span className="flex items-center justify-end pr-2">
            <Leaf className={ICON_CLASS} aria-hidden />
          </span>
          <p className="notranslate font-bold" translate="no">{species.common_name}</p>
          <span className="flex items-center justify-end pr-2">
            <BookOpen className={ICON_CLASS} aria-hidden />
          </span>
          <p className="notranslate italic text-white/90" translate="no">{species.scientific_name}</p>
        </div>
        {species.description && (
          <p className="mt-3 text-sm leading-relaxed text-white/80">{species.description}</p>
        )}
        <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-start">
          {sizeStr && (
            <Fragment key="size">
              <span className="flex items-start justify-end pt-0.5 pr-2">
                <Ruler className={ICON_CLASS} aria-hidden />
              </span>
              <span className="text-sm">{sizeStr}</span>
            </Fragment>
          )}
          {statesFormatted && (
            <Fragment key="states">
              <span className="flex items-start justify-end pt-0.5 pr-2">
                <MapPin className={ICON_CLASS} aria-hidden />
              </span>
              <span className="text-sm">{statesFormatted}</span>
            </Fragment>
          )}
          {species.geo_region && (
            <Fragment key="geo">
              <span className="flex items-start justify-end pt-0.5 pr-2">
                <Globe className={ICON_CLASS} aria-hidden />
              </span>
              <span className="text-sm">{species.geo_region}</span>
            </Fragment>
          )}
          {habitat?.terrain && (
            <Fragment key="habitat">
              <span className="flex items-start justify-end pt-0.5 pr-2">
                <Mountain className={ICON_CLASS} aria-hidden />
              </span>
              <span className="text-sm">{habitat.terrain}</span>
            </Fragment>
          )}
          {species.mezcal_use && (
            <Fragment key="mezcal">
              <span className="flex items-start justify-end pt-0.5 pr-2">
                <Wine className={ICON_CLASS} aria-hidden />
              </span>
              <span className="text-sm">{species.mezcal_use}</span>
            </Fragment>
          )}
          {hasProducers && (
            <Fragment key="producers">
              <span className="flex items-start justify-end pt-0.5 pr-2">
                <Users className={ICON_CLASS} aria-hidden />
              </span>
              <span className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-sm">
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
            </Fragment>
          )}
        </div>
      </div>
    </article>
  );

  return showPermalink ? (
    <Link href={slugHref} className="block w-full max-w-xl sm:max-w-2xl">
      {articleEl}
    </Link>
  ) : (
    <div className="w-full">{articleEl}</div>
  );
}
