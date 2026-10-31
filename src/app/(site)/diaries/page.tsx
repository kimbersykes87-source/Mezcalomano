import type { Metadata } from "next";
import Link from "next/link";
import { DIARIES_NAME, hasPublishedDiaries, publishedDiaries } from "@/lib/diaries";

const DESCRIPTION =
  "Notes from two people who love mezcal: agave species explained, how to read a label, gift ideas and tasting nights.";

export const metadata: Metadata = {
  title: DIARIES_NAME,
  description: DESCRIPTION,
  alternates: { canonical: "/diaries" },
  robots: hasPublishedDiaries() ? undefined : { index: false, follow: false },
  openGraph: { title: `${DIARIES_NAME} | Mezcalómano`, description: DESCRIPTION, url: "/diaries" },
};

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default function DiariesPage() {
  const entries = publishedDiaries();
  return (
    <article>
      <section className="j-head">
        <div className="s-wrap">
          <p className="s-eyebrow">Notes from the road</p>
          <h1>{DIARIES_NAME}</h1>
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
                  <Link href={`/diaries/${e.slug}`} className="j-card">
                    {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio photo sized by CSS */}
                    <img src={e.image.src} alt={e.image.alt} width={e.image.width} height={e.image.height} loading="lazy" />
                    <span className="j-cat">{e.category}</span>
                    <h2>{e.title}</h2>
                    <p>{e.answer.split(". ")[0]}.</p>
                    <time dateTime={e.published}>{e.published ? formatDate(e.published) : ""}</time>
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
