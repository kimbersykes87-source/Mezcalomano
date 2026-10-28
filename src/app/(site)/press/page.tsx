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
  "$29.99",
  "40 kinds of mezcal",
  "Pre-orders open now, ships from November 30",
  "Order by December 17 for US Christmas delivery",
  "Free US standard shipping",
];

export default function PressPage() {
  return (
    <article className="press-page">
      <header className="press-page__intro">
        <h1 className="press-page__title">The Discovery Deck</h1>
        <p className="press-page__subhead">
          Playing cards that introduce 40 kinds of mezcal and the agaves behind them.
        </p>
        <p className="press-page__tagline">Gift it to the friend who always orders espadín. Or keep it.</p>
        <ul className="press-page__facts" aria-label="Quick facts">
          {QUICK_FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
          <li>
            <a href={DISCOVERY_DECK_PRODUCT_URL}>shop.mezcalomano.com</a>
          </li>
        </ul>
      </header>

      <section className="press-page__section" aria-labelledby="press-about">
        <h2 id="press-about" className="press-page__heading">About the deck</h2>
        <p>
          About 85% of mezcal is made from a single agave, espadín (<Link href="/sources">COMERCAM, 2026</Link>). It&apos;s a
          great place to start, but there&apos;s a lot more to taste. The Discovery Deck is a full
          deck of playing cards that introduces 40 kinds of mezcal and the agaves behind them. Each
          agave card gives its local and species name, a memorable nickname, and a flavor compass
          for smoke, agave and fermentation. A QR code on the box opens an online directory of
          where each agave grows and who&apos;s bottling it. No producer pays to be listed. It&apos;s a
          field guide, a tasting companion and a conversation starter. And it&apos;s still a proper
          deck of cards, so deal a hand while you pour.
        </p>
      </section>

      <section className="press-page__section" aria-labelledby="press-inside">
        <h2 id="press-inside" className="press-page__heading">What&apos;s inside</h2>
        <ul className="press-page__list">
          <li>40 agaves across the number cards (Ace to 10, all four suits).</li>
          <li>12 production roles on the face cards.</li>
          <li>2 pollinator jokers.</li>
          <li>2 reference cards: the flavor guide and taxonomy notes.</li>
        </ul>
      </section>

      <section className="press-page__section" aria-labelledby="press-specs">
        <h2 id="press-specs" className="press-page__heading">Specs</h2>
        <ul className="press-page__list">
          <li>Casino-quality 310gsm German black-core stock.</li>
          <li>Poker size, 2.5&quot; x 3.5&quot;, rounded corners.</li>
          <li>Butter-varnish finish.</li>
          <li>Custom printed box with matte lamination and a QR code to the online agave directory.</li>
        </ul>
      </section>

      <section className="press-page__section" aria-labelledby="press-makers">
        <h2 id="press-makers" className="press-page__heading">Who made it</h2>
        <p>
          Two mezcal lovers who kept going back to Oaxaca, tasting everything they could find and
          asking questions along the way.
        </p>
      </section>

      <section className="press-page__section press-page__section--wide" aria-labelledby="press-images">
        <h2 id="press-images" className="press-page__heading">Images</h2>
        {PRESS_IMAGES.length > 0 && (
        <>
        <p className="press-page__note">Click any image to download it at full size.</p>
        <ul className="press-page__grid">
          {PRESS_IMAGES.map((img) => (
            <li key={img.file} className="press-page__tile">
              <a href={img.src} download={img.file} className="press-page__tile-link">
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized thumbnail; originals can exceed image optimizer limits */}
                <img
                  src={img.thumbSrc}
                  alt={img.alt}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  className="press-page__tile-img"
                />
                <span className="press-page__tile-meta">
                  Download · {img.width} x {img.height} · {formatMegabytes(img.bytes)}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {PRESS_PACKSHOTS.length > 0 && (
          <>
            <h3 className="press-page__subheading">Packshots</h3>
            <p className="press-page__note">
              The cut-out has a transparent background and a soft shadow, ready for white pages.
            </p>
            <ul className="press-page__grid">
              {PRESS_PACKSHOTS.map((img) => (
                <li key={img.file} className="press-page__tile">
                  <a href={img.src} download={img.file} className="press-page__tile-link">
                    {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized thumbnail */}
                    <img
                      src={img.thumbSrc}
                      alt={img.alt}
                      width={1000}
                      height={1000}
                      loading="lazy"
                      className="press-page__tile-img press-page__tile-img--contain"
                    />
                    <span className="press-page__tile-meta">
                      Download · {img.width} x {img.height} · {formatMegabytes(img.bytes)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        <a href={PRESS_KIT_ZIP} download className="btn btn-hero-cta--olive press-page__zip">
          Download all (zip)
        </a>
        </>
        )}

        <h3 className="press-page__subheading">Logo</h3>
        <div className="press-page__logos">
          <div className="press-page__logo press-page__logo--light">
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG preview */}
            <img src="/press/logos/mezcalomano-logo-for-white-backgrounds.svg" alt="Mezcalómano logo for white backgrounds" width={250} height={80} />
          </div>
          <div className="press-page__logo press-page__logo--dark">
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG preview */}
            <img src="/press/logos/mezcalomano-logo-for-dark-backgrounds.svg" alt="Mezcalómano logo for dark backgrounds" width={250} height={80} />
          </div>
        </div>
        <ul className="press-page__logo-links">
          {PRESS_LOGOS.map((logo) => (
            <li key={logo.href}>
              <a href={logo.href} download>
                {logo.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="press-page__section" aria-labelledby="press-contact">
        <h2 id="press-contact" className="press-page__heading">Contact</h2>
        <p>
          Press, sample and stockist requests:{" "}
          <a href="mailto:hola@mezcalomano.com">hola@mezcalomano.com</a>
        </p>
        <p>
          Link for coverage:{" "}
          <a href={DISCOVERY_DECK_PRODUCT_URL}>{DISCOVERY_DECK_PRODUCT_URL}</a>
        </p>
        <p className="press-page__social">
          <a href="https://www.instagram.com/mezcalomano/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://www.tiktok.com/@mezcalomano" target="_blank" rel="noopener noreferrer">
            TikTok
          </a>
        </p>
      </section>
    </article>
  );
}
