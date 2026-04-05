"use client";

import { useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { KeyCard } from "./KeyCard";
import { SpeciesCard } from "./SpeciesCard";
import type { Species } from "@/types/species";

const SWIPE_THRESHOLD = 50;

export function SwipeableCardStack({
  species,
  currentIndex,
  onIndexChange,
  showKeyCard = true,
}: {
  species: Species[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showKeyCard?: boolean;
}) {
  const touchStartX = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalCards = showKeyCard ? species.length + 1 : species.length;
  const isKeyCard = showKeyCard && currentIndex === 0;

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, totalCards - 1));
      if (next === currentIndex) return;
      onIndexChange(next);
    },
    [totalCards, currentIndex, onIndexChange]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD) goTo(currentIndex + 1);
    else if (delta < -SWIPE_THRESHOLD) goTo(currentIndex - 1);
  };

  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, goTo]);

  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= totalCards - 1;

  const speciesPos = currentIndex - (showKeyCard ? 1 : 0);
  const speciesTotal = species.length;
  const positionLabel =
    totalCards > 0
      ? isKeyCard
        ? speciesTotal > 0
          ? `How to read these cards · ${speciesTotal} species`
          : "How to read these cards"
        : speciesPos >= 0 && species[speciesPos]
          ? `${speciesPos + 1} of ${speciesTotal} — ${species[speciesPos]!.common_name}`
          : ""
      : "";

  if (species.length === 0 && !showKeyCard) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-white/70">
        <p>No species to show. Run the seed script and add Supabase credentials.</p>
      </div>
    );
  }

  if (species.length === 0 && showKeyCard) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-3 flex flex-col items-center gap-2 sm:mb-4">
          <nav
            className="flex w-full max-w-xl items-center justify-between gap-3 sm:max-w-2xl"
            aria-label="Card navigation"
          >
            <button
              type="button"
              aria-label="Previous card"
              disabled
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white/40"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <p className="min-w-0 flex-1 text-center text-sm text-white/80" aria-live="polite">
              How to read these cards
            </p>
            <button
              type="button"
              aria-label="Next card"
              disabled
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white/40"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </nav>
          <p className="text-center text-xs text-white/50">Use arrow keys to move between cards.</p>
        </div>
        <div ref={cardRef} className="touch-pan-y">
          <div key="key" className="flex justify-center px-4 py-4 transition-opacity duration-200 ease-out sm:px-6">
            <div className="w-full max-w-xl sm:max-w-2xl">
              <KeyCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = isKeyCard ? null : species[currentIndex - (showKeyCard ? 1 : 0)];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <div className="mb-3 flex flex-col items-center gap-2 sm:mb-4">
        <nav
          className="flex w-full max-w-xl items-center justify-between gap-3 sm:max-w-2xl"
          aria-label="Card navigation"
        >
          <button
            type="button"
            aria-label="Previous card"
            disabled={atStart}
            onClick={() => goTo(currentIndex - 1)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/5 text-[var(--agave-yellow)] hover:bg-white/10 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <p className="min-w-0 flex-1 text-center text-sm text-white/85" aria-live="polite">
            {positionLabel}
          </p>
          <button
            type="button"
            aria-label="Next card"
            disabled={atEnd}
            onClick={() => goTo(currentIndex + 1)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/5 text-[var(--agave-yellow)] hover:bg-white/10 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </nav>
        <p className="text-center text-xs text-white/50">Use arrow keys to move between cards.</p>
      </div>
      <div
        ref={cardRef}
        className="touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={isKeyCard ? "key" : current!.id}
          className="flex justify-center px-4 py-4 transition-opacity duration-200 ease-out sm:px-6"
        >
          {isKeyCard ? (
            <div className="w-full max-w-xl sm:max-w-2xl">
              <KeyCard />
            </div>
          ) : (
            <div className="w-full max-w-xl sm:max-w-2xl">
              <SpeciesCard
                species={current!}
                fallbackImageUrl={"fallbackImageUrl" in current! ? (current as Species & { fallbackImageUrl?: string | null }).fallbackImageUrl : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
