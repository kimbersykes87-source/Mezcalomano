import { fetchAllSpecies } from "@/lib/species-list-server";
import DirectoryClient from "./DirectoryClient";

/** Re-fetch species at most once a minute, so a seed shows on the live site within about a minute. */
export const revalidate = 60;

export default async function DirectoryPage() {
  const species = await fetchAllSpecies();
  return <DirectoryClient initialSpecies={species} />;
}
