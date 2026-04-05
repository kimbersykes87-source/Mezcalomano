import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { fetchSpeciesBySlug } from "@/lib/species-detail-server";
import { resolveMatrixImagePathForCommonName } from "@/lib/matrix-card-urls-server";
import { SITE_URL } from "@/lib/site-seo";
import { speciesDirectorySlug } from "@/lib/slug";
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

  const pathSlug = speciesDirectorySlug(species);
  const pageUrl = `${SITE_URL}/directory/${pathSlug}`;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Directory", item: `${SITE_URL}/directory` },
      { "@type": "ListItem", position: 3, name: species.common_name, item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <SpeciesDetailClient initialSpecies={species} />
    </>
  );
}
