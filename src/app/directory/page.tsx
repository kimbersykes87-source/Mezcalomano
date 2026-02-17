import Hero from "@/components/Hero";
import DirectoryContent from "@/components/DirectoryContent";
import type { MatrixSpecies } from "@/components/MatrixCard";
import matrixData from "@/data/matrix.json";

const directoryHeroMobile = "/assets/photos/directory_hero_mobile_1200x900.png";
const directoryHeroTablet = "/assets/photos/directory_hero_tablet_1920x1080.png";
const directoryHeroDesktop = "/assets/photos/directory_hero_desktop_2800x1333.png";

export const metadata = {
  title: "Directory",
  description:
    "Discover our guide to sourcing exceptional mezcals beyond espadín",
};

export default function DirectoryPage() {
  return (
    <>
      <Hero
        title="DIRECTORY"
        subtitle="Discover our guide to sourcing exceptional mezcals beyond espadín, like tobalá, tepeztate, and cuixe."
        mobile={directoryHeroMobile}
        tablet={directoryHeroTablet}
        desktop={directoryHeroDesktop}
        alt=""
      />
      <DirectoryContent matrixData={matrixData as MatrixSpecies[]} />
    </>
  );
}
