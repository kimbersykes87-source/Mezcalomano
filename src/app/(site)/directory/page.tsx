import { fetchAllSpecies } from "@/lib/species-list-server";
import { resolveMatrixImagePathForCommonName } from "@/lib/matrix-card-urls-server";
import { toAgaveCard } from "@/lib/agave-cards";
import DirectoryClient from "./DirectoryClient";

/** Re-fetch species at most once a minute, so a seed shows on the live site within about a minute. */
export const revalidate = 60;

export const metadata = {
  alternates: { canonical: "/directory" },
};

export default async function DirectoryPage() {
  const species = await fetchAllSpecies();
  const cards = species.map((s) => toAgaveCard(s, resolveMatrixImagePathForCommonName(s.common_name)));
  return <DirectoryClient initialCards={cards} />;
}
