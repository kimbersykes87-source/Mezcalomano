/* eslint-disable @next/next/no-img-element -- LCP hero; CSS switches contain/cover by breakpoint */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import {
  DISCOVERY_DECK_PRODUCT_DESCRIPTION,
  DISCOVERY_DECK_PRODUCT_URL,
  HOME_META_DESCRIPTION,
  OG_IMAGE_PATH,
  SITE_URL,
} from "@/lib/site-seo";

const OG_IMAGE_ALT =
  "The Discovery Deck box beside the Sierra Negra card on a charcoal background";

const HOME_TITLE = "The Discovery Deck: Mezcal Playing Cards | Mezcalómano";

const discoveryDeckProductLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "The Discovery Deck",
  sku: "MM-1002",
  brand: { "@type": "Brand", name: "Mezcalómano" },
  description: DISCOVERY_DECK_PRODUCT_DESCRIPTION,
  image: SITE_URL + OG_IMAGE_PATH,
  url: DISCOVERY_DECK_PRODUCT_URL,
  offers: {
    "@type": "Offer",
    url: DISCOVERY_DECK_PRODUCT_URL,
    priceCurrency: "USD",
    price: "29.99",
    availability: "https://schema.org/PreOrder",
    availabilityStarts: "2026-11-30",
    itemCondition: "https://schema.org/NewCondition",
  },
};

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_META_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_META_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_META_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

const HOME_HERO_SRC = "/assets/photos/Hero_New.webp";
const HOME_HERO_WIDTH = 713;
const HOME_HERO_HEIGHT = 769;
const HOME_HERO_ALT =
  "A Discovery Deck card standing on terracotta plaster, its agave back casting a long shadow on the wall.";

export default function HomePage() {
  return (
    <section className="home-landing" aria-labelledby="home-landing-title">
      {/* deploy-test 2026-08-25 */}
      <JsonLd data={discoveryDeckProductLd} />
      <div className="home-landing__unit">
        <h1 id="home-landing-title" className="home-landing__lines">
          Life&apos;s too short for just one agave.
          <br />
          So here are 40 in a deck of playing cards.
          <br />
          Gift it or keep it.
        </h1>
        <div className="home-landing__visual">
          <img
            className="home-landing__img"
            src={HOME_HERO_SRC}
            alt={HOME_HERO_ALT}
            width={HOME_HERO_WIDTH}
            height={HOME_HERO_HEIGHT}
            fetchPriority="high"
          />
        </div>
        <Link href="/buy" className="btn btn-hero-cta btn-hero-cta--olive">
          PRE-ORDER THE DISCOVERY DECK
        </Link>
        <div className="home-landing__copy">
          <p>
            The Discovery Deck is a deck of playing cards that introduces 40 kinds of mezcal
            and the agaves behind them. About 85% of mezcal is made from a single agave,
            espadín. It&apos;s a great place to start, but there&apos;s a lot more to taste.
          </p>
          <p>
            Each agave card gives its local and species name, a memorable nickname, and a
            flavor compass for smoke, agave and fermentation. A QR code on the box opens our
            online directory: where each agave grows and who&apos;s bottling it. And it&apos;s
            still a proper deck of cards, so deal a hand while you pour.
          </p>
          <p>
            Gift it to the friend who always orders espadín. Or keep it. $29.99 with free US
            shipping. Pre-orders ship from November 30, in time for Christmas.
          </p>
        </div>
      </div>
    </section>
  );
}
