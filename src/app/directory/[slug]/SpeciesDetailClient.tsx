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
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center">
      <main className="flex w-full min-w-0 flex-1 flex-col items-center px-5 py-6">
        <div className="w-full max-w-xl sm:max-w-2xl">
          <Link
            href="/directory"
            className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--agave-yellow)] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to directory
          </Link>
          <SpeciesCard
            species={speciesWithResolvedImage}
            showPermalink={false}
            fallbackImageUrl={speciesWithResolvedImage.fallbackImageUrl}
          />
        </div>
      </main>
    </div>
  );
}
