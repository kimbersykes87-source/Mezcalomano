import Link from "next/link";
import MailingListForm from "@/components/MailingListForm";
import { fetchAllSpecies } from "@/lib/species-list-server";
import { speciesDirectorySlug } from "@/lib/slug";
import DirectoryClient from "./DirectoryClient";

/** Re-fetch species at most once a minute, so a seed shows on the live site within about a minute. */
export const revalidate = 60;

export const metadata = {
  alternates: { canonical: "/directory" },
};

export default async function DirectoryPage() {
  const species = await fetchAllSpecies();
  return (
    <>
      <h1 className="directory-page__title">Agave species directory</h1>
      <DirectoryClient initialSpecies={species}>
        <section className="directory-signup" aria-labelledby="directory-signup-heading">
          <h2 id="directory-signup-heading" className="directory-signup__heading">
            Stay in the loop
          </h2>
          <p className="directory-signup__text">
            Join our mailing list for Discovery Deck news, new releases and more agave guides.
          </p>
          <MailingListForm source="directory" />
        </section>
        <nav className="directory-species-index" aria-labelledby="directory-all-agaves">
          <h2 id="directory-all-agaves" className="directory-species-index__heading">
            All 40 agaves
          </h2>
          <ul className="directory-species-index__list">
            {species.map((s) => {
              const slug = speciesDirectorySlug(s);
              return (
                <li key={slug}>
                  <Link href={`/directory/${slug}`}>{s.common_name}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </DirectoryClient>
    </>
  );
}
