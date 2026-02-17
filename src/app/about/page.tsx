import Hero from "@/components/Hero";

const aboutHeroMobile = "/assets/photos/about_hero_mobile_1200x900.png";
const aboutHeroTablet = "/assets/photos/about_hero_tablet_1920x1080.png";
const aboutHeroDesktop = "/assets/photos/about_hero_desktop_2800x1333.png";

export const metadata = {
  title: "About",
  description: "Learn about Mezcalómano and our mission to explore agave species",
};

export default function AboutPage() {
  return (
    <>
      <Hero
        title="ABOUT US"
        mobile={aboutHeroMobile}
        tablet={aboutHeroTablet}
        desktop={aboutHeroDesktop}
        alt=""
      />
      <div className="section">
        <div className="container">
          <div className="section-content about-content">
            <p>
              For mezcal lovers and the mezcal-curious, Mezcalómano is a project dedicated to
              exploring the diverse agave species that make mezcal so rich, complex, and endlessly
              fascinating.
            </p>
            <p>
              We&apos;re here to spark conversation, celebrate every spiky variety, and bring more
              joy (and mezcal knowledge) to your next pour.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
