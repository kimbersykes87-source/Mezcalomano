import type { Metadata } from "next";
import Link from "next/link";
import { SMALL_POURS_NAME, hasPublishedPosts, listedPosts } from "@/lib/small-pours";

const SHARE_IMAGE = "/small-pours/small-pours-share-1200x630.png";

const DESCRIPTION =
  "Notes from two people who love mezcal: agave species explained, how to read a label, gift ideas and tasting nights.";

export const metadata: Metadata = {
  title: SMALL_POURS_NAME,
  description: DESCRIPTION,
  alternates: { canonical: "/small-pours" },
  robots: hasPublishedPosts() ? undefined : { index: false, follow: false },
  openGraph: {
    title: `${SMALL_POURS_NAME} | Mezcalómano`,
    description: DESCRIPTION,
    url: "/small-pours",
    images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: "Small Pours by Mezcalómano, short reads on agave and mezcal" }],
  },
  twitter: { card: "summary_large_image", title: `${SMALL_POURS_NAME} | Mezcalómano`, description: DESCRIPTION, images: [SHARE_IMAGE] },
};

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}


/**
 * Card teaser from the answer: links flattened to their words (a card is already a link),
 * and enough whole sentences to read as a standfirst. The wording stays as written.
 */
function teaser(answer: string): string {
  const plain = answer.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  const parts = plain.split(/(?<=\.)\s+/);
  let out = "";
  for (const part of parts) {
    out = out ? `${out} ${part}` : part;
    if (out.length >= 70) break;
  }
  return out;
}

export default function SmallPoursPage() {
  const entries = listedPosts();
  return (
    <article>
      <section className="j-head">
        <div className="s-wrap">
          <p className="s-eyebrow">Notes from the road</p>
          <h1 className="j-logo-h">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed SVG logo */}
            <img className="j-logo" src="/assets/brand/logos/small_pours_logo_stacked.svg" alt={SMALL_POURS_NAME} width={400} height={230} fetchPriority="high" />
          </h1>
          <p className="j-sub">Agaves explained, bottles decoded and tasting nights planned, by two people who can&apos;t stop reading labels.</p>
        </div>
      </section>
      <section className="j-list">
        <div className="s-wrap">
          {entries.length === 0 ? (
            <p className="j-empty">The first entries are on their way. In the meantime, meet the 40 agaves in the <Link href="/directory" className="j-link">directory</Link>.</p>
          ) : (
            <ul className="j-grid">
              {entries.map((e) => (
                <li key={e.slug}>
                  <Link href={`/small-pours/${e.slug}`} className="j-card">
                    {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio photo sized by CSS */}
                    <img src={e.image.src} alt={e.image.alt} width={e.image.width} height={e.image.height} loading="lazy" />
                    <span className="j-cat">{e.category}</span>
                    <h2>{e.title}</h2>
                    <p>{teaser(e.answer)}</p>
                    {e.status === "review" ? (
                      <span className="j-review">In review</span>
                    ) : (
                      <time dateTime={e.published}>{e.published ? formatDate(e.published) : ""}</time>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </article>
  );
}
