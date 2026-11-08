import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { fetchSpeciesBySlug } from "@/lib/species-detail-server";
import { resolveMatrixImagePathForCommonName } from "@/lib/matrix-card-urls-server";
import { OG_IMAGE_PATH, SITE_URL } from "@/lib/site-seo";
import { speciesDirectorySlug, toSlug } from "@/lib/slug";
import SpeciesDetailClient from "./SpeciesDetailClient";
import { fetchAllSpecies } from "@/lib/species-list-server";
import { toAgaveCard } from "@/lib/agave-cards";
import { speciesMetaDescription, speciesTitle } from "@/lib/species-meta";
import { faqForSlug } from "@/lib/species-faq";
import { publishedPosts } from "@/lib/small-pours";
import type { PostBlock } from "@/lib/small-pours/types";

function blockText(b: PostBlock): string {
  if (b.type === "p" || b.type === "h2") return b.text;
  if (b.type === "list") return b.items.join("\n");
  return [...b.head, ...b.rows.flat()].join("\n");
}

/** Published Small Pours posts whose body links to this directory page. */
function relatedPosts(slug: string) {
  const link = new RegExp(`\\(/directory/${slug}(?=[)#?/])`);
  return publishedPosts()
    .filter((e) => e.body.some((b) => link.test(blockText(b))))
    .map((e) => ({ slug: e.slug, title: e.title }));
}

const DEFAULT_OG = OG_IMAGE_PATH;

type PageProps = { params: Promise<{ slug: string }> };

/** Find a species from the URL, forgiving case, accents and hyphens ("Espadin", "espad%C3%ADn", "sierra-negra"). */
async function resolveSpecies(slug: string) {
  const exact = await fetchSpeciesBySlug(slug);
  if (exact) return exact;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    /* keep raw */
  }
  const normalized = toSlug(decoded.replace(/[-+]/g, " "));
  return normalized && normalized !== slug ? fetchSpeciesBySlug(normalized) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const species = await resolveSpecies(slug);

  if (!species) {
    return { title: "Species not found" };
  }

  const title = speciesTitle(species);
  const description = speciesMetaDescription(species);
  const cardImage = resolveMatrixImagePathForCommonName(species.common_name);
  const ogImage = cardImage ?? DEFAULT_OG;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/directory/${speciesDirectorySlug(species)}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SpeciesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const species = await resolveSpecies(slug);
  if (!species) notFound();

  const pathSlug = speciesDirectorySlug(species);
  if (pathSlug !== slug) permanentRedirect(`/directory/${pathSlug}`);
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

  const all = await fetchAllSpecies();
  const rail = all.map((s) => toAgaveCard(s, resolveMatrixImagePathForCommonName(s.common_name)));
  const image = resolveMatrixImagePathForCommonName(species.common_name) ?? species.image_url;
  const faq = faqForSlug(pathSlug);
  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {faqLd ? <JsonLd data={faqLd} /> : null}
      <SpeciesDetailClient
        species={species}
        image={image}
        rail={rail}
        faq={faq}
        related={relatedPosts(pathSlug)}
      />
    </>
  );
}
