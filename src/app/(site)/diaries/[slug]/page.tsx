import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DiaryText from "@/components/DiaryText";
import JsonLd from "@/components/JsonLd";
import { DIARIES_NAME, allDiaries, getDiary } from "@/lib/diaries";
import { DISCOVERY_DECK_PRODUCT_URL, LOGO_IMAGE_PATH, SITE_URL } from "@/lib/site-seo";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return allDiaries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getDiary(slug);
  if (!e) return {};
  const url = `/diaries/${e.slug}`;
  return {
    title: e.title,
    description: e.description,
    alternates: { canonical: url },
    robots: e.status === "draft" ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", title: `${e.title} | Mezcalómano`, description: e.description, url, images: [{ url: e.image.src, width: e.image.width, height: e.image.height, alt: e.image.alt }] },
    twitter: { card: "summary_large_image", title: e.title, description: e.description, images: [e.image.src] },
  };
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default async function DiaryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const e = getDiary(slug);
  if (!e) notFound();
  const isDraft = e.status === "draft";
  const url = `${SITE_URL}/diaries/${e.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.title,
    description: e.description,
    image: [`${SITE_URL}${e.image.src}`],
    datePublished: e.published,
    dateModified: e.updated,
    mainEntityOfPage: url,
    author: [
      { "@type": "Person", name: "Kimber" },
      { "@type": "Person", name: "Siona" },
    ],
    publisher: { "@type": "Organization", name: "Mezcalómano", logo: { "@type": "ImageObject", url: `${SITE_URL}${LOGO_IMAGE_PATH}` } },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: e.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <article>
      {!isDraft && <JsonLd data={articleLd} />}
      {!isDraft && <JsonLd data={faqLd} />}

      {isDraft && (
        <aside className="j-draft" aria-label="Draft notes">
          <div className="s-wrap">
            <strong>Draft for review. Not public yet: hidden from the list, menu and Google.</strong>
            {e.reviewNotes && (
              <ul>
                {e.reviewNotes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            )}
          </div>
        </aside>
      )}

      <header className="j-art-head">
        <div className="j-col">
          <p className="s-eyebrow">{e.category}</p>
          <h1>{e.title}</h1>
          <p className="j-answer">{e.answer}</p>
          <p className="j-by">
            By Kimber and Siona · {e.published ? formatDate(e.published) : "Draft"} · Checked {formatDate(e.updated)}
          </p>
        </div>
      </header>

      <div className="j-hero">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio photo sized by CSS */}
        <img src={e.image.src} alt={e.image.alt} width={e.image.width} height={e.image.height} fetchPriority="high" />
      </div>

      <div className="j-body">
        <div className="j-col">
          {e.body.map((b, i) => {
            if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
            if (b.type === "p") return <p key={i}><DiaryText text={b.text} /></p>;
            if (b.type === "list") {
              return (
                <ul key={i} className="j-bullets">
                  {b.items.map((it) => <li key={it}><DiaryText text={it} /></li>)}
                </ul>
              );
            }
            return (
              <div key={i} className="j-table-wrap">
                <table>
                  <thead><tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                  <tbody>
                    {b.rows.map((r) => (
                      <tr key={r[0]}>{r.map((c, ci) => (ci === 0 ? <th key={c} scope="row"><DiaryText text={c} /></th> : <td key={c}><DiaryText text={c} /></td>))}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          <h2>Quick answers</h2>
          <dl className="j-faq">
            {e.faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="j-cta">
            <p>Meet the 40 agaves behind the bottle.</p>
            <div>
              <a className="j-btn" href={DISCOVERY_DECK_PRODUCT_URL}>Get the Discovery Deck</a>
              <Link className="j-btn j-btn-ghost" href="/directory">Browse the directory</Link>
            </div>
          </div>
          <p className="j-back"><Link href="/diaries" className="j-link">All of {DIARIES_NAME}</Link></p>
        </div>
      </div>
    </article>
  );
}
