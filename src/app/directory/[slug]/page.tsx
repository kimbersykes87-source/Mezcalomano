import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSpeciesBySlug } from "@/lib/species-detail-server";
import { resolveMatrixImagePathForCommonName } from "@/lib/matrix-card-urls-server";
import SpeciesDetailClient from "./SpeciesDetailClient";

const DEFAULT_OG = "/assets/og/mezcalomano_og_1200x630.png";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const species = await fetchSpeciesBySlug(slug);

  if (!species) {
    return { title: "Species not found" };
  }

  const title = species.common_name;
  const description =
    species.description?.trim().slice(0, 160) ||
    `${species.scientific_name} — agave species in the Mezcalómano directory.`;
  const cardImage = resolveMatrixImagePathForCommonName(species.common_name);
  const ogImage = cardImage ?? DEFAULT_OG;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Mezcalómano`,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Mezcalómano`,
      description,
      images: [ogImage],
    },
  };
}

export default async function SpeciesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const species = await fetchSpeciesBySlug(slug);
  if (!species) notFound();

  return <SpeciesDetailClient initialSpecies={species} />;
}
