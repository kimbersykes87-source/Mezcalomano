import type { Metadata } from "next";
import Link from "next/link";
import { HOME_META_DESCRIPTION, OG_IMAGE_PATH, SITE_URL } from "@/lib/site-seo";

export const metadata: Metadata = {
  title: "Mezcalómano | Discovery Deck & Agave Species Directory",
  description: HOME_META_DESCRIPTION,
  openGraph: {
    title: "Mezcalómano | Discovery Deck & Agave Species Directory",
    description: HOME_META_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mezcalómano | Discovery Deck & Agave Species Directory",
    description: HOME_META_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export default function HomePage() {
  return (
    <section className="home-landing" aria-labelledby="home-landing-title">
      <div className="home-landing__unit">
        {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG lockup; sized via CSS */}
        <img
          src="/assets/brand/logos/mezcalomano_lockup_stacked_dark.svg"
          alt="Mezcalómano — Beyond Espadín"
          className="home-landing__logo"
          width={250}
          height={80}
        />
        <h1 id="home-landing-title" className="home-landing__lines">
          Life&apos;s too short for just one agave.
          <br />
          So here are 40 in a deck of playing cards.
          <br />
          Gift it or keep it.
        </h1>
        <Link href="/buy" className="btn btn-hero-cta btn-hero-cta--olive">
          BUY THE DISCOVERY DECK
        </Link>
      </div>
    </section>
  );
}
