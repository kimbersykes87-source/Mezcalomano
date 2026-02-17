"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMatrixCardUrlMap, resolveSpeciesImageUrl } from "@/lib/matrix-card-urls";
import { SearchOverlay } from "@/components/SearchOverlay";
import { SwipeableCardStack } from "@/components/SwipeableCardStack";
import type { Species } from "@/types/species";

function filterByCommonName(species: Species[], query: string): Species[] {
  if (!query.trim()) return species;
  const q = query.trim().toLowerCase();
  return species.filter((s) => s.common_name.toLowerCase().includes(q));
}

export default function DirectoryClient() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [matrixCardMap, setMatrixCardMap] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery]);

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

  const filtered = filterByCommonName(species, searchQuery);

  /** Species with image_url resolved and matrix path as fallback when primary image fails */
  const speciesWithResolvedImages = useMemo(() => {
    return filtered.map((s) => {
      const resolved = resolveSpeciesImageUrl(s.image_url, s.common_name, matrixCardMap);
      const fallbackImageUrl = resolveSpeciesImageUrl(null, s.common_name, matrixCardMap);
      return {
        ...s,
        image_url: resolved,
        fallbackImageUrl,
      };
    });
  }, [filtered, matrixCardMap]);

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full">
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by common name…"
      />

      <div className="flex min-h-0 flex-1 flex-col w-full gap-4 py-6">
        <div className="container flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            aria-label="Open search"
          >
            <Search className="size-5" />
            Search species
          </button>
        </div>
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
      </div>
    </div>
  );
}
