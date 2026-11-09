import type { Metadata } from "next";
import Link from "next/link";

// DRAFT title and description, pending Siona's sign-off.
export const metadata: Metadata = {
  title: "Agave Map of Mexico: Where Mezcal Agaves Grow",
  description:
    "See where 40 mezcal agaves grow across Mexico. Pick a species or a state to explore, from farmed espadín to wild tobalá, and the places each one comes from.",
  alternates: { canonical: "/map" },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="m-root">
      {children}
      {/* DRAFT copy, pending Siona's sign-off. Server-rendered so the page has real text for readers and crawlers. */}
      <section className="m-about" aria-label="About this map">
        <div className="s-wrap">
          <h2>About this map</h2>
          <p>
            This map shows where the 40 agaves in the Discovery Deck grow across Mexico. Pick a species to see the
            states where it is found, or pick a state to see which agaves grow there.
          </p>
          <p>
            Some agaves are farmed widely. Espadín made up about 85% of certified mezcal in 2025, according to
            COMERCAM, the council that certifies mezcal. Others grow wild in a few places only, so the word mezcal can
            mean very different agaves depending on the region.
          </p>
          <p>
            Every species has its own page in the <Link href="/directory">agave directory</Link> with its size, flavor
            notes and producers, and our <Link href="/sources">Sources page</Link> lists where each fact comes from.
          </p>
        </div>
      </section>
    </div>
  );
}
