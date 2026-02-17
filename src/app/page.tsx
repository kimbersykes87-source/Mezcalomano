import Link from "next/link";
import Hero from "@/components/Hero";

const homeHeroMobile = "/assets/photos/home_hero_mobile_1200x900.png";
const homeHeroTablet = "/assets/photos/home_hero_tablet_1920x1080.png";
const homeHeroDesktop = "/assets/photos/home_hero_desktop_2800x1333.png";

export const metadata = {
  title: "Mezcalómano | Discover the Agave Species Behind Mezcal",
};

export default function HomePage() {
  return (
    <Hero
      title="Life's too short for just one agave."
      mobile={homeHeroMobile}
      tablet={homeHeroTablet}
      desktop={homeHeroDesktop}
      alt=""
      standalone
    >
      <Link href="/buy" className="btn btn-hero-cta btn-hero-cta--olive">
        BUY THE DISCOVERY DECK
      </Link>
    </Hero>
  );
}
