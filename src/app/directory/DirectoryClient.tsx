"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getMatrixCardUrlMap, resolveSpeciesImageUrl } from "@/lib/matrix-card-urls";
import { SwipeableCardStack } from "@/components/SwipeableCardStack";
import type { Species } from "@/types/species";

function DirectoryCardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse px-4 sm:px-6">
      <div className="mx-auto mb-4 h-10 max-w-xl rounded-lg bg-white/10 sm:max-w-2xl" />
      <div className="flex justify-center px-4 py-4 sm:px-6">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-[#32342f] shadow-lg sm:max-w-2xl">
          <div className="aspect-square w-full bg-white/10" />
          <div className="flex min-h-[280px] flex-col gap-3 p-5">
            <div className="h-4 w-[75%] rounded bg-white/10" />
            <div className="h-4 w-[50%] rounded bg-white/10" />
            <div className="mt-2 h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-[80%] rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function matchesSearch(s: Species, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const hay = [
    s.common_name,
    s.scientific_name,
    s.states,
    s.description,
    s.geo_region,
    s.mezcal_use,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(t);
}

export default function DirectoryClient() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [matrixCardMap, setMatrixCardMap] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rawCardIndex, setRawCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchIdRef = useRef(0);

  useEffect(() => {
    getMatrixCardUrlMap().then(setMatrixCardMap);
  }, []);

  const loadSpecies = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase.from("species").select("*");
    if (id !== fetchIdRef.current) return;
    if (error) {
      console.error("Supabase error:", error);
      setFetchError(error.message || "Could not load species.");
      setSpecies([]);
    } else {
      const sorted = ((data as Species[]) ?? []).sort((a, b) =>
        a.common_name.localeCompare(b.common_name, "en")
      );
      setSpecies(sorted);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadSpecies();
    });
  }, [loadSpecies]);

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

  const filteredSpecies = useMemo(() => {
    return speciesWithResolvedImages.filter((s) => matchesSearch(s, searchQuery));
  }, [speciesWithResolvedImages, searchQuery]);

  const maxCardIndex = filteredSpecies.length;
  const currentIndex = Math.min(rawCardIndex, maxCardIndex);

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full">
      <main className="flex min-h-0 flex-1 flex-col w-full gap-4 px-4 py-6 sm:px-6">
        {loading ? (
          <DirectoryCardSkeleton />
        ) : fetchError ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <p className="max-w-md text-white/80">{fetchError}</p>
            <button
              type="button"
              onClick={() => loadSpecies()}
              className="rounded-lg bg-[var(--agave-yellow)] px-4 py-2 font-medium text-[#272926] hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <label className="sr-only" htmlFor="directory-search">
                Search species
              </label>
              <input
                id="directory-search"
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setRawCardIndex(0);
                }}
                placeholder="Search by name, state, description…"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[var(--agave-yellow)] focus:outline-none sm:max-w-md"
                autoComplete="off"
              />
              {searchQuery.trim() !== "" && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setRawCardIndex(0);
                  }}
                  className="shrink-0 text-sm text-[var(--agave-yellow)] underline-offset-2 hover:underline"
                >
                  Clear search
                </button>
              )}
              <label className="sr-only" htmlFor="directory-jump">
                Jump to species
              </label>
              <select
                id="directory-jump"
                value={currentIndex === 0 ? "" : String(currentIndex)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") setRawCardIndex(0);
                  else setRawCardIndex(Number(v));
                }}
                disabled={filteredSpecies.length === 0}
                className="w-full rounded-lg border border-white/20 bg-[#32342f] px-3 py-2 text-sm text-white focus:border-[var(--agave-yellow)] focus:outline-none sm:ml-auto sm:max-w-xs"
              >
                <option value="">Jump to species…</option>
                {filteredSpecies.map((s, i) => (
                  <option key={s.id} value={String(i + 1)}>
                    {s.common_name}
                  </option>
                ))}
              </select>
            </div>
            {filteredSpecies.length === 0 && searchQuery.trim() !== "" ? (
              <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center text-white/80">
                <p>No species match your search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setRawCardIndex(0);
                  }}
                  className="text-sm text-[var(--agave-yellow)] underline-offset-2 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <SwipeableCardStack
                species={filteredSpecies}
                currentIndex={currentIndex}
                onIndexChange={setRawCardIndex}
                showKeyCard={true}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
