"use client";

import { useRef, useEffect, useCallback } from "react";
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
      if (next !== currentIndex) onIndexChange(next);
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

  if (species.length === 0 && !showKeyCard) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-white/70">
        <p>No species to show. Run the seed script and add Supabase credentials.</p>
      </div>
    );
  }

  if (species.length === 0 && showKeyCard) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <div ref={cardRef} className="touch-pan-y">
          <div
            key="key"
            className="flex justify-center px-2 py-2 sm:px-4 sm:py-4"
          >
            <KeyCard />
          </div>
        </div>
      </div>
    );
  }

  const current = isKeyCard ? null : species[currentIndex - (showKeyCard ? 1 : 0)];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
      <div
        ref={cardRef}
        className="touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={isKeyCard ? "key" : current!.id}
          className="flex justify-center px-2 py-2 sm:px-4 sm:py-4"
        >
          {isKeyCard ? <KeyCard /> : (
            <SpeciesCard
              species={current!}
              fallbackImageUrl={"fallbackImageUrl" in current! ? (current as Species & { fallbackImageUrl?: string | null }).fallbackImageUrl : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
