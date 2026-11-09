import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostText from "@/components/PostText";
import JsonLd from "@/components/JsonLd";
import { SMALL_POURS_NAME, allPosts, getPost } from "@/lib/small-pours";
import { autoLinkStates } from "@/lib/small-pours/auto-link-states";
import { DISCOVERY_DECK_PRODUCT_URL, LOGO_IMAGE_PATH, SITE_URL } from "@/lib/site-seo";
import { laterOf } from "@/lib/content-dates";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return allPosts().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getPost(slug);
  if (!e) return {};
  const url = `/small-pours/${e.slug}`;
  return {
    title: e.title,
    description: e.description,
    alternates: { canonical: url },
    robots: e.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { type: "article", title: `${e.title} | Mezcalómano`, description: e.description, url, images: [{ url: e.image.src, width: e.image.width, height: e.image.height, alt: e.image.alt }] },
    twitter: { card: "summary_large_image", title: e.title, description: e.description, images: [e.image.src] },
  };
}

/** Flattens **bold** and [label](href) to plain words for structured data. */
function plain(text: string) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const e = getPost(slug);
  if (!e) notFound();
  const isDraft = e.status !== "published";
  const url = `${SITE_URL}/small-pours/${e.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.title,
    description: e.description,
    image: [`${SITE_URL}${e.image.src}`],
    datePublished: e.published,
    // "updated" is the last fact check and can predate the go-live date, so never let modified fall before published.
    dateModified: laterOf(e.updated, e.published),
    mainEntityOfPage: url,
    author: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Mezcalómano" },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Mezcalómano", logo: { "@type": "ImageObject", url: `${SITE_URL}${LOGO_IMAGE_PATH}` } },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: e.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plain(f.a) } })),
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
          <p className="j-answer"><PostText text={e.answer} /></p>
        </div>
      </header>

      <div className="j-hero">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio photo sized by CSS */}
        <img src={e.image.src} alt={e.image.alt} width={e.image.width} height={e.image.height} fetchPriority="high" />
      </div>

      <div className="j-body">
        <div className="j-col">
          {autoLinkStates(e.body).map((b, i) => {
            if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
            if (b.type === "p") return <p key={i}><PostText text={b.text} /></p>;
            if (b.type === "list") {
              return (
                <ul key={i} className="j-bullets">
                  {b.items.map((it) => <li key={it}><PostText text={it} /></li>)}
                </ul>
              );
            }
            return (
              <div key={i} className={b.head.length > 2 ? "j-table-wrap j-table-wide" : "j-table-wrap"}>
                <table>
                  <thead><tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                  <tbody>
                    {b.rows.map((r) => (
                      <tr key={r[0]}>{r.map((c, ci) => (ci === 0 ? <th key={c} scope="row"><PostText text={c} /></th> : <td key={c} data-label={b.head[ci]}><PostText text={c} /></td>))}</tr>
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
                <dd><PostText text={f.a} /></dd>
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
          <p className="j-back">
            <Link href="/small-pours" aria-label={`${SMALL_POURS_NAME}, all posts`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed SVG logo */}
              <img className="j-back-logo" src="/assets/brand/logos/small_pours_logo_stacked.svg" alt="" width={400} height={230} loading="lazy" />
            </Link>
            <Link href="/small-pours" className="j-link">More {SMALL_POURS_NAME}</Link>
          </p>
        </div>
      </div>
    </article>
  );
}
