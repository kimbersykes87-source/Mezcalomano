import type { Metadata } from "next";
import Link from "next/link";
import { DISCOVERY_DECK_PRODUCT_URL } from "@/lib/site-seo";
import { PRESS_IMAGES, PRESS_KIT_ZIP, PRESS_LOGOS, PRESS_PACKSHOTS, formatMegabytes } from "@/lib/press";

export const metadata: Metadata = {
  title: "Press",
  description: "Images, facts and contact details for the Mezcalómano Discovery Deck.",
  alternates: { canonical: "/press" },
  openGraph: {
    title: "Press | Mezcalómano",
    description: "Images, facts and contact details for the Mezcalómano Discovery Deck.",
    url: "/press",
    images: [
      {
        url: "/press/mezcalomano-press-share.jpg",
        width: 1200,
        height: 630,
        alt: "Stop The Press. A hand holding four Mezcalómano agave playing cards in front of agave leaves",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Press | Mezcalómano",
    description: "Images, facts and contact details for the Mezcalómano Discovery Deck.",
    images: ["/press/mezcalomano-press-share.jpg"],
  },
};

const QUICK_FACTS = [
  { label: "Price", value: "$29.99", note: "Free US standard shipping" },
  { label: "In the deck", value: "40", note: "Kinds of mezcal" },
  { label: "Pre-orders", value: "Open now", note: "Ships from November 30" },
  { label: "Order by", value: "Dec 14", note: "For US Christmas delivery" },
];

const INSIDE = [
  { n: "40", text: "agaves across the number cards (Ace to 10, all four suits)" },
  { n: "12", text: "production roles on the face cards" },
  { n: "2", text: "pollinator jokers" },
  { n: "2", text: "reference cards: the flavor guide and taxonomy notes" },
];

const SPECS = [
  "Casino-quality 310gsm German black-core stock.",
  "Poker size, 2.5\" x 3.5\", rounded corners.",
  "Butter-varnish finish.",
  "Custom printed box with matte lamination and a QR code to the online agave directory.",
];

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
    </svg>
  );
}

const HERO_PACKSHOT = PRESS_PACKSHOTS.find((p) => p.file.includes("hero-olive")) ?? PRESS_PACKSHOTS[0];

export default function PressPage() {
  return (
    <article>
      <section className="p-hero">
        <div className="s-wrap">
          <div>
            <p className="s-eyebrow">Press kit</p>
            <h1>The Discovery Deck</h1>
            <p className="sub">Playing cards that introduce 40 kinds of mezcal and the agaves behind them.</p>
            <p className="tag">Gift it to the friend who always orders espadín. Or keep it.</p>
            <dl className="p-facts" aria-label="Quick facts">
              {QUICK_FACTS.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>
                    <b>{f.value}</b>
                    <span>{f.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <a className="s-cta p-shoplink" href={DISCOVERY_DECK_PRODUCT_URL}>
              shop.mezcalomano.com
            </a>
          </div>
          {HERO_PACKSHOT ? (
            <div className="p-pic">
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized thumbnail */}
              <img src={HERO_PACKSHOT.thumbSrc} alt={HERO_PACKSHOT.alt} width={1000} height={1000} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="p-sec" aria-labelledby="press-about">
        <div className="s-wrap">
          <h2 id="press-about">About the deck</h2>
          <div>
            <p>
              About 85% of mezcal is made from a single agave, espadín (<Link href="/sources">COMERCAM, 2026</Link>).
              It&apos;s a great place to start, but there&apos;s a lot more to taste. The Discovery Deck is a full
              deck of playing cards that introduces 40 kinds of mezcal and the agaves behind them. Each agave card
              gives its local and species name, a memorable nickname, and a flavor compass for smoke, agave and
              fermentation. A QR code on the box opens an online directory of where each agave grows and who&apos;s
              bottling it. No producer pays to be listed. It&apos;s a field guide, a tasting companion and a
              conversation starter. And it&apos;s still a proper deck of cards, so deal a hand while you pour.
            </p>
          </div>
        </div>
      </section>

      <section className="p-sec" aria-labelledby="press-inside">
        <div className="s-wrap">
          <h2 id="press-inside">What&apos;s inside</h2>
          <ul className="p-inside">
            {INSIDE.map((item) => (
              <li key={item.text} className="p-stat">
                <i>{item.n}</i>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="p-sec" aria-labelledby="press-specs">
        <div className="s-wrap">
          <h2 id="press-specs">Specs</h2>
          <ul className="p-specs">
            {SPECS.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="p-sec" aria-labelledby="press-makers">
        <div className="s-wrap">
          <h2 id="press-makers">Who made it</h2>
          <div>
            <p>
              Two mezcal lovers who kept going back to Oaxaca, tasting everything they could find and asking
              questions along the way.
            </p>
          </div>
        </div>
      </section>

      <section className="p-imgs" aria-labelledby="press-images">
        <div className="s-wrap">
          <div className="p-head">
            <div>
              <h2 id="press-images">Images</h2>
              {PRESS_IMAGES.length > 0 ? <p>Click any image to download it at full size.</p> : null}
            </div>
          </div>
          {PRESS_IMAGES.length > 0 ? (
            <ul className="p-grid">
              {PRESS_IMAGES.map((img) => (
                <li key={img.file}>
                  <a className="p-tile" href={img.src} download={img.file}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized thumbnail; originals can exceed image optimizer limits */}
                    <img src={img.thumbSrc} alt={img.alt} width={1000} height={1000} loading="lazy" />
                    <span>
                      Download · {img.width} x {img.height} · {formatMegabytes(img.bytes)}
                      <DownloadIcon />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {PRESS_PACKSHOTS.length > 0 ? (
            <>
              <h3 className="p-sub">Packshots</h3>
              <p className="p-note">The cut-out has a transparent background and a soft shadow, ready for white pages.</p>
              <ul className="p-grid">
                {PRESS_PACKSHOTS.map((img) => (
                  <li key={img.file}>
                    <a className="p-tile" href={img.src} download={img.file}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized thumbnail */}
                      <img
                        src={img.thumbSrc}
                        alt={img.alt}
                        width={1000}
                        height={1000}
                        loading="lazy"
                        className={img.file.endsWith(".png") ? "contain" : undefined}
                      />
                      <span>
                        {img.label}
                        <DownloadIcon />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {PRESS_IMAGES.length > 0 ? (
            <a className="s-cta p-zip" href={PRESS_KIT_ZIP} download>
              Download all (zip)
            </a>
          ) : null}

          <h3 className="p-sub">Logo</h3>
          <div className="p-logos">
            <div className="p-logo light">
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG preview */}
              <img src="/press/logos/mezcalomano-logo-for-white-backgrounds.svg" alt="Mezcalómano logo for white backgrounds" width={250} height={80} />
            </div>
            <div className="p-logo dark">
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG preview */}
              <img src="/press/logos/mezcalomano-logo-for-dark-backgrounds.svg" alt="Mezcalómano logo for dark backgrounds" width={250} height={80} />
            </div>
          </div>
          <ul className="p-dl">
            {PRESS_LOGOS.map((logo) => (
              <li key={logo.href}>
                <a href={logo.href} download>
                  {logo.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="p-sec p-contact" aria-labelledby="press-contact">
        <div className="s-wrap">
          <h2 id="press-contact">Contact</h2>
          <div>
            <p>
              Press, sample and stockist requests:{" "}
              <a className="u" href="mailto:hola@mezcalomano.com">hola@mezcalomano.com</a>
            </p>
            <p>
              Link for coverage:{" "}
              <a className="u" href={DISCOVERY_DECK_PRODUCT_URL}>{DISCOVERY_DECK_PRODUCT_URL}</a>
            </p>
            <div className="p-soc">
              <a href="https://www.instagram.com/mezcalomano/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@mezcalomano" target="_blank" rel="noopener noreferrer">TikTok</a>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
