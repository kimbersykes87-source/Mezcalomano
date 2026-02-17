"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { getMatrixCardUrlMap, resolveSpeciesImageUrl } from "@/lib/matrix-card-urls";
import { SwipeableCardStack } from "@/components/SwipeableCardStack";
import type { Species } from "@/types/species";

export default function DirectoryClient() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [matrixCardMap, setMatrixCardMap] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getMatrixCardUrlMap().then(setMatrixCardMap);
  }, []);

  useEffect(() => {
    async function fetchSpecies() {
      const { data, error } = await supabase.from("species").select("*");
      if (error) {
        console.error("Supabase error:", error);
        setSpecies([]);
      } else {
        const sorted = ((data as Species[]) ?? []).sort((a, b) =>
          a.common_name.localeCompare(b.common_name, "en")
        );
        setSpecies(sorted);
      }
      setLoading(false);
    }
    fetchSpecies();
  }, []);

  /** Species with image_url resolved and matrix path as fallback when primary image fails */
  const speciesWithResolvedImages = useMemo(() => {
    return species.map((s) => {
      const resolved = resolveSpeciesImageUrl(s.image_url, s.common_name, matrixCardMap);
      const fallbackImageUrl = resolveSpeciesImageUrl(null, s.common_name, matrixCardMap);
      return {
        ...s,
        image_url: resolved,
        fallbackImageUrl,
      };
    });
  }, [species, matrixCardMap]);

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full">
      <main className="flex min-h-0 flex-1 flex-col w-full gap-4 px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center text-white/70">
            Loading…
          </div>
        ) : (
          <SwipeableCardStack
            species={speciesWithResolvedImages}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            showKeyCard={true}
          />
        )}
      </main>
    </div>
  );
}
