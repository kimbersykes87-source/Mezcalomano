"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Leaf,
  MapPin,
  Mountain,
  Ruler,
  Users,
  Wine,
} from "lucide-react";
import { speciesDirectorySlug } from "@/lib/slug";
import { producerLinks, type ProducerLink } from "@/lib/producers";
import type { Species } from "@/types/species";

/** Shown only after species/matrix image URLs fail to load (not when URL is missing). */
export const BRAND_FALLBACK_SRC = "/assets/favicon/app_icon_512.png";

/* Match localhost: explicit size + fallback color so icons render the same in production */
const ICON_CLASS =
  "species-card-icon size-4 h-4 w-4 shrink-0 text-[var(--agave-yellow)] text-[#e0b825]";

function parseHabitat(habitat: Species["habitat"]) {
  if (!habitat || typeof habitat !== "object") return null;
  const t = habitat as { terrain?: string };
  if (!t.terrain) return null;
  return t;
}

/** Comma-separated producer names, linked where there is a URL. */
function ProducerNames({ list }: { list: ProducerLink[] }) {
  return (
    <span className="text-center text-sm">
      {list.map((p, i) => (
        <span key={p.name + "-" + i}>
          {i > 0 && ", "}
          {p.url ? (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="species-card-producer-link text-[var(--agave-yellow)] underline decoration-[var(--agave-yellow)] underline-offset-2 hover:opacity-90"
            >
              {p.name}
            </a>
          ) : (
            p.name
          )}
        </span>
      ))}
    </span>
  );
}

function SpeciesCardContent({
  species,
  showPermalink,
  primaryUrl,
  fallbackUrl,
}: {
  species: Species;
  showPermalink: boolean;
  primaryUrl: string | null;
  fallbackUrl: string | null;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(primaryUrl);

  const handleImageError = () => {
    if (imageSrc === primaryUrl && fallbackUrl) {
      setImageSrc(fallbackUrl);
      return;
    }
    if (imageSrc === primaryUrl || imageSrc === fallbackUrl) {
      setImageSrc(BRAND_FALLBACK_SRC);
      return;
    }
    if (imageSrc === BRAND_FALLBACK_SRC) {
      setImageSrc(null);
    }
  };

  const isLocalAsset =
    typeof imageSrc === "string" &&
    (imageSrc.startsWith("/") || imageSrc.startsWith("."));
  const isBrandFallback = imageSrc === BRAND_FALLBACK_SRC;

  const habitat = parseHabitat(species.habitat);
  const sizeStr =
    species.size_height_feet || species.size_height_meters
      ? species.size_height_feet && species.size_height_meters
        ? `${species.size_height_feet} (${species.size_height_meters})`
        : species.size_height_feet || species.size_height_meters
      : null;

  const producers = producerLinks(species);
  const usProducers = producers.filter((p) => p.us);
  const otherProducers = producers.filter((p) => !p.us);
  const hasProducers = producers.length > 0;

  const statesFormatted =
    species.states &&
    species.states
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "en"))
      .join("; ");

  const slugHref = "/directory/" + speciesDirectorySlug(species);
  const imageFrameClass =
    "relative aspect-square w-4/5 shrink-0 overflow-hidden rounded-2xl border border-[var(--agave-yellow)] bg-[#272926]";

  const imageInner =
    imageSrc ? (
      <Image
        key={imageSrc}
        src={imageSrc}
        alt={species.common_name}
        fill
        className={isBrandFallback ? "object-contain p-3 sm:p-4" : "object-cover"}
        sizes="(max-width: 640px) 45vw, 15rem"
        priority={!showPermalink}
        unoptimized={isLocalAsset || !imageSrc.includes("supabase")}
        onError={handleImageError}
      />
    ) : (
      <div className="flex h-full min-h-0 items-center justify-center text-[var(--agave-yellow)]/50">
        <Leaf className="size-16" />
      </div>
    );

  const articleEl = (
    <article className="relative flex w-full max-w-xl flex-col items-center sm:max-w-2xl" style={{ gap: 40 }}>
      {showPermalink ? (
        <Link
          href={slugHref}
          className={`${imageFrameClass} block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agave-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#272926]`}
          aria-label={`View ${species.common_name} in directory`}
        >
          {imageInner}
        </Link>
      ) : (
        <div className={imageFrameClass}>{imageInner}</div>
      )}
          <div className="species-card-content flex w-4/5 flex-col items-center rounded-2xl border border-[var(--agave-yellow)] text-center text-white" style={{ padding: 10 }}>
            <div className="flex w-full flex-col items-center" style={{ gap: 12 }}>
              <div className="flex flex-col items-center" style={{ gap: 4 }}>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <Leaf className={ICON_CLASS} aria-hidden />
                  <span className="text-sm text-[var(--agave-yellow)]">Common name</span>
                </div>
                <span className="notranslate text-sm" translate="no">{species.common_name}</span>
              </div>
              {species.mezcal_use && (
                <div className="flex flex-col items-center" style={{ gap: 4 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <Wine className={ICON_CLASS} aria-hidden />
                    <span className="text-sm text-[var(--agave-yellow)]">Mezcal use</span>
                  </div>
                  <span className="text-sm">{species.mezcal_use}</span>
                </div>
              )}
              {hasProducers && (
                <div className="flex flex-col items-center" style={{ gap: 4 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <Users className={ICON_CLASS} aria-hidden />
                    <span className="text-sm text-[var(--agave-yellow)]">Producers</span>
                  </div>
                  {usProducers.length > 0 && (
                    <div className="flex flex-col items-center" style={{ gap: 2 }}>
                      <span className="species-card-producer-group">Buy in the US</span>
                      <ProducerNames list={usProducers} />
                    </div>
                  )}
                  {otherProducers.length > 0 && (
                    <div className="flex flex-col items-center" style={{ gap: 2, marginTop: usProducers.length ? 6 : 0 }}>
                      {usProducers.length > 0 && <span className="species-card-producer-group">More producers</span>}
                      <ProducerNames list={otherProducers} />
                    </div>
                  )}
                </div>
              )}
              {species.description && (
                <div className="flex flex-col items-center" style={{ gap: 4 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <BookOpen className={ICON_CLASS} aria-hidden />
                    <span className="text-sm text-[var(--agave-yellow)]">Description</span>
                  </div>
                  <span className="text-center text-sm">{species.description}</span>
                </div>
              )}
              {sizeStr && (
                <div className="flex flex-col items-center" style={{ gap: 4 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <Ruler className={ICON_CLASS} aria-hidden />
                    <span className="text-sm text-[var(--agave-yellow)]">Size</span>
                  </div>
                  <span className="text-sm">{sizeStr}</span>
                </div>
              )}
              {statesFormatted && (
                <div className="flex flex-col items-center" style={{ gap: 4 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <MapPin className={ICON_CLASS} aria-hidden />
                    <span className="text-sm text-[var(--agave-yellow)]">State</span>
                  </div>
                  <span className="text-sm">{statesFormatted}</span>
                </div>
              )}
              {habitat?.terrain && (
                <div className="flex flex-col items-center" style={{ gap: 4 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <Mountain className={ICON_CLASS} aria-hidden />
                    <span className="text-sm text-[var(--agave-yellow)]">Terrain</span>
                  </div>
                  <span className="text-sm">{habitat.terrain}</span>
                </div>
              )}
              <div className="flex flex-col items-center" style={{ gap: 4 }}>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <BookOpen className={ICON_CLASS} aria-hidden />
                  <span className="text-sm text-[var(--agave-yellow)]">Species name</span>
                </div>
                <span className="notranslate text-sm" translate="no">{species.scientific_name}</span>
              </div>
            </div>
          </div>
    </article>
  );

  return <div className="mx-auto w-full max-w-xl sm:max-w-2xl">{articleEl}</div>;
}

export function SpeciesCard({
  species,
  showPermalink = true,
  fallbackImageUrl,
}: {
  species: Species;
  showPermalink?: boolean;
  fallbackImageUrl?: string | null;
}) {
  const primaryUrl = species.image_url?.trim() ?? null;
  const fallbackUrl =
    fallbackImageUrl?.trim() && fallbackImageUrl.trim() !== primaryUrl
      ? fallbackImageUrl.trim()
      : null;

  return (
    <SpeciesCardContent
      key={`${species.id}-${primaryUrl ?? "none"}`}
      species={species}
      showPermalink={showPermalink}
      primaryUrl={primaryUrl}
      fallbackUrl={fallbackUrl}
    />
  );
}
