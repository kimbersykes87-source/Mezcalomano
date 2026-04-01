"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMatrixCardUrlMap, resolveSpeciesImageUrl } from "@/lib/matrix-card-urls";
import { SpeciesCard } from "@/components/SpeciesCard";
import type { Species } from "@/types/species";

export default function SpeciesDetailClient({ initialSpecies }: { initialSpecies: Species }) {
  const [matrixCardMap, setMatrixCardMap] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    void getMatrixCardUrlMap().then(setMatrixCardMap);
  }, []);

  const speciesWithResolvedImage = useMemo(() => {
    const image_url = resolveSpeciesImageUrl(
      initialSpecies.image_url,
      initialSpecies.common_name,
      matrixCardMap
    );
    const fallbackImageUrl = resolveSpeciesImageUrl(null, initialSpecies.common_name, matrixCardMap);
    return {
      ...initialSpecies,
      image_url,
      fallbackImageUrl,
    };
  }, [initialSpecies, matrixCardMap]);

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full">
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">
        <Link
          href="/directory"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--agave-yellow)] hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to directory
        </Link>
        <div className="flex justify-center px-4 sm:px-6">
          <div className="w-full max-w-xl sm:max-w-2xl">
            <SpeciesCard
              species={speciesWithResolvedImage}
              showPermalink={false}
              fallbackImageUrl={speciesWithResolvedImage.fallbackImageUrl}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
