"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toSlug } from "@/lib/slug";
import { SpeciesCard } from "@/components/SpeciesCard";
import type { Species } from "@/types/species";

export default function SpeciesPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function fetchSpecies() {
      const { data, error } = await supabase.from("species").select("*");
      if (error) {
        console.error("Supabase error:", error);
        setNotFound(true);
      } else {
        const list = (data as Species[]) ?? [];
        const match = list.find((s) => toSlug(s.common_name) === slug);
        if (match) {
          setSpecies(match);
        } else {
          setNotFound(true);
        }
      }
      setLoading(false);
    }
    fetchSpecies();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-white/70">
        Loading…
      </div>
    );
  }

  if (notFound || !species) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
        <p className="text-white/80">Species not found.</p>
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--agave-yellow)] px-4 py-2 font-medium text-[#272926] hover:opacity-90"
        >
          <ArrowLeft className="size-4" />
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:px-6">
      <Link
        href="/directory"
        className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--agave-yellow)] hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to directory
      </Link>
      <div className="flex justify-center">
        <SpeciesCard species={species} showPermalink={false} />
      </div>
    </div>
  );
}
