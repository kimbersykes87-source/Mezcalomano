"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMatrixCardUrlMap, resolveSpeciesImageUrl } from "@/lib/matrix-card-urls";
import { SwipeableCardStack } from "@/components/SwipeableCardStack";
import type { Species } from "@/types/species";

function DirectoryCardSkeleton() {
  return (
    <div className="flex w-full min-w-0 max-w-4xl flex-col items-center animate-pulse px-5">
      <div className="mx-auto mb-10 h-12 w-4/5 max-w-xl rounded-lg bg-white/10 sm:max-w-2xl" />
      <div className="mx-auto w-full max-w-xl sm:max-w-2xl">
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

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const maxCardIndex = Math.max(0, filteredSpecies.length - 1);
  const currentIndex = Math.min(rawCardIndex, maxCardIndex);

  return (
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center">
        <main className="flex w-full min-w-0 flex-1 flex-col items-center gap-4 pb-6 pt-10">
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
            {filteredSpecies.length === 0 && searchQuery.trim() !== "" ? (
              <div className="flex w-full min-w-0 max-w-4xl flex-col items-center px-5">
                <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-10 sm:max-w-2xl">
                  <nav
                    className="flex w-4/5 items-center gap-2.5 sm:gap-3"
                    aria-label="Search"
                  >
                    <span
                      className="inline-flex size-10 shrink-0"
                      aria-hidden
                    />
                    <div className="relative min-h-12 min-w-0 flex-1">
                      <label className="sr-only" htmlFor="directory-empty-search">
                        Search species
                      </label>
                      <input
                        id="directory-empty-search"
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        value={searchQuery}
                        placeholder="Search or choose…"
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setRawCardIndex(0);
                        }}
                        className="box-border min-h-12 w-full min-w-0 rounded-lg border border-white/20 bg-white/5 text-center text-white placeholder:text-white/40 focus:border-[var(--agave-yellow)] focus:outline-none"
                        style={{
                          fontSize: "1.3125rem",
                          lineHeight: 1.35,
                          paddingLeft: "6rem",
                          paddingRight: "6rem",
                          paddingTop: "0.625rem",
                          paddingBottom: "0.625rem",
                        }}
                      />
                      <div className="pointer-events-none absolute right-2 top-0 flex h-12 items-center">
                        <button
                          type="button"
                          aria-label="Clear search"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchQuery("");
                            setRawCardIndex(0);
                          }}
                          className="pointer-events-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                    <span
                      className="inline-flex size-10 shrink-0"
                      aria-hidden
                    />
                  </nav>
                  <div className="flex w-full flex-col items-center justify-center gap-3 pb-5 text-center sm:min-h-[280px]">
                    <p className="text-sm text-white/85">
                      No species match your search.
                    </p>
                    <button
                      type="button"
                      className="directory-inline-link"
                      onClick={() => {
                        setSearchQuery("");
                        setRawCardIndex(0);
                      }}
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <SwipeableCardStack
                species={filteredSpecies}
                currentIndex={currentIndex}
                onIndexChange={setRawCardIndex}
                directoryToolbar={{
                  searchQuery,
                  onSearchChange: (q) => {
                    setSearchQuery(q);
                    setRawCardIndex(0);
                  },
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
