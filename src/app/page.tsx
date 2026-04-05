import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import { HOME_META_DESCRIPTION, OG_IMAGE_PATH, SITE_URL } from "@/lib/site-seo";

const homeHeroMobile = "/assets/photos/home_hero_mobile_1200x900.png";
const homeHeroTablet = "/assets/photos/home_hero_tablet_1920x1080.png";
const homeHeroDesktop = "/assets/photos/home_hero_desktop_2800x1333.png";

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
    <Hero
      title="Life's too short for just one agave."
      subtitle="The Discovery Deck is premium playing cards for mezcal lovers—gift it or keep it. Our agave directory helps you learn what goes into the bottle."
      mobile={homeHeroMobile}
      tablet={homeHeroTablet}
      desktop={homeHeroDesktop}
      alt="Mezcalómano Discovery Deck — premium agave-themed playing cards"
      standalone
    >
      <Link href="/buy" className="btn btn-hero-cta btn-hero-cta--olive">
        BUY THE DISCOVERY DECK
      </Link>
    </Hero>
  );
}
