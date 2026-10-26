import type { Metadata } from "next";
import Link from "next/link";

const DESCRIPTION =
  "How we built the Discovery Deck and our agave directory: where our facts come from, how we chose 40 agaves, and how to tell us when we got something wrong.";

const COMERCAM_REPORT_URL =
  "https://comercam-dom.org.mx/wp-content/uploads/2026/05/INFORME-2026_VERSION-PUBLICA.pdf";

export const metadata: Metadata = {
  title: "Sources",
  description: DESCRIPTION,
  alternates: { canonical: "/sources" },
  openGraph: {
    title: "Sources | Mezcalómano",
    description: DESCRIPTION,
    url: "/sources",
  },
};

type Reference = { label: string; href?: string };

const REFERENCE_GROUPS: { heading: string; items: Reference[] }[] = [
  {
    heading: "Books and official sources",
    items: [
      {
        label: "Howard Scott Gentry, Agaves of Continental North America (University of Arizona Press, 1982)",
        href: "https://uapress.arizona.edu/book/agaves-of-continental-north-america",
      },
      { label: "COMERCAM, Informe Estadístico 2026", href: COMERCAM_REPORT_URL },
      { label: "Royal Botanic Gardens, Kew: Plants of the World Online", href: "https://powo.science.kew.org/" },
      { label: "IUCN Red List of Threatened Species", href: "https://www.iucnredlist.org/" },
      {
        label: "CONABIO: Diversidad biológica, Magueyes",
        href: "https://www.biodiversidad.gob.mx/diversidad/alimentos/magueyes/diversidad-magueyes",
      },
      { label: "CONABIO: EncicloVida", href: "https://enciclovida.mx/" },
      { label: "Jardín Botánico, Instituto de Biología, UNAM: Infografías", href: "https://infografiasjb.ib.unam.mx/" },
      { label: "iNaturalist México", href: "https://mexico.inaturalist.org/" },
      { label: "Useful Tropical Plants database", href: "https://tropical.theferns.info/" },
      { label: "Published studies on individual agaves, found through SciELO and PubMed Central" },
    ],
  },
  {
    heading: "Mezcal guides and writers",
    items: [
      { label: "Mezcalistas: Agave Species", href: "https://www.mezcalistas.com/agave-species/" },
      {
        label: "Mezcología: “Conoce las 9 especies de agaves mezcaleros de Oaxaca”",
        href: "https://mezcologia.mx/agaves-mezcaleros-de-oaxaca/",
      },
      {
        label: "Mezcal PhD: “How Many Agave Varieties Can Be Used To Make Mezcal?” (2012)",
        href: "https://mezcalphd.com/2012/05/how-many-agave-varieties-can-be-used-to-make-mezcal/",
      },
      { label: "Mezcal Reviews", href: "https://www.mezcalreviews.com/" },
      { label: "Agaves Pro", href: "https://agaves.pro/" },
    ],
  },
  {
    heading: "Producers",
    items: [
      { label: "Del Maguey: Agave", href: "https://delmaguey.com/es/agave/" },
      { label: "NETA", href: "https://netaspirits.com/" },
    ],
  },
];

export default function SourcesPage() {
  return (
    <article className="press-page">
      <header className="press-page__intro">
        <h1 className="press-page__title">Sources</h1>
        <p className="press-page__subhead">
          The Discovery Deck and our agave directory are built on other people’s work: botanists,
          Mexico’s mezcal certifiers, producers, and the writers who have been documenting mezcal
          for years. This page shows where our facts come from and how we put them together.
        </p>
      </header>

      <section className="press-page__section" aria-labelledby="sources-number">
        <h2 id="sources-number" className="press-page__heading">The number we quote most</h2>
        <p>About 85% of mezcal is made from a single agave, espadín.</p>
        <p>
          Espadín (<em>Agave angustifolia</em>) made up 84.53% of certified mezcal production in
          2025, according to COMERCAM, the council that certifies mezcal in Mexico.
        </p>
        <p>
          COMERCAM (Consejo Mexicano Regulador de la Calidad del Mezcal), Informe Estadístico 2026,
          p. 7, Tabla 2.{" "}
          <a href={COMERCAM_REPORT_URL} target="_blank" rel="noopener noreferrer">
            Read the report (PDF, in Spanish)
          </a>
        </p>
        <p className="press-page__note">The figure covers certified mezcal only.</p>
      </section>

      <section className="press-page__section" aria-labelledby="sources-choosing">
        <h2 id="sources-choosing" className="press-page__heading">How we chose 40 agaves</h2>
        <p>
          Our research started in late 2025 with a list of more than 50 agaves linked to mezcal. We
          cut it down to agaves you can actually find in a bottle, because that’s the whole point:
          discover more, taste more. Every agave in the deck has at least one producer making
          mezcal from it today.
        </p>
        <p>
          Some made the cut because they’re rare, some because they’re everywhere, and a few
          because they show how tangled agave names get.
        </p>
      </section>

      <section className="press-page__section" aria-labelledby="sources-names">
        <h2 id="sources-names" className="press-page__heading">One plant, many names</h2>
        <p>
          The 40 cards cover 22 botanical species, plus varieties, a subspecies, and two agaves
          without a settled botanical name. That’s on purpose. Botanists still debate where one
          agave species ends and another begins, and common names change from region to region.
          One species can go by several names, and one name can mean different plants in different
          places.
        </p>
        <p>
          <em>Agave karwinskii</em> alone appears five times, as Cuishe, Barril, Madrecuixe,
          Bicuixe and Tobaziche. Producers treat them as different plants, and they make different
          mezcal.
        </p>
        <p>
          Two cards, Lumbre and Chuparrosa, say <em>Agave</em> sp. because there’s no settled
          botanical name for them yet. We’d rather say so than guess. Where our sources disagreed,
          we went back and forth, and we may still change our minds as we learn more.
        </p>
      </section>

      <section className="press-page__section" aria-labelledby="sources-cards">
        <h2 id="sources-cards" className="press-page__heading">What’s on each card, and where it comes from</h2>
        <p>
          <strong>Names and botany.</strong> Botanical names, ranges, heights and growing
          conditions come from botanical databases, Mexican government plant records, published
          field studies and Howard Scott Gentry’s <em>Agaves of Continental North America</em>, cross-checked against mezcal writers
          and producers.
        </p>
        <p>
          <strong>Flavor.</strong> Each card has three flavor words, always in the same order:
          smoke, agave, fermentation. Smoke runs from clean to toasty to smoky. The agave word is
          green, roasted, floral, herbal or mineral. The fermentation word is fruity, funky, lactic,
          savory or spicy. We built that vocabulary from the themes mezcal lovers and producers keep
          coming back to, then chose the words for each agave from our own tasting and from how
          producers and tasters describe it. Your bottle will vary with the producer, the place and
          the batch. Use it as a starting point, then trust your palate.
        </p>
        <p>
          <strong>Nicknames.</strong> The nicknames are ours. They’re there to help you remember
          the plant, not to describe it scientifically.
        </p>
        <p>
          <strong>Face cards and jokers.</strong> The jacks, queens and kings show the people and
          steps behind a bottle, from cutting the plant to the final taste. The jokers are bats,
          which pollinate agaves.
        </p>
      </section>

      <section className="press-page__section" aria-labelledby="sources-producers">
        <h2 id="sources-producers" className="press-page__heading">Producers and bottles</h2>
        <p>
          Our <Link href="/directory">directory</Link> lists more than 80 producers across all 40
          agaves, with links to where you can buy each bottle. The listings come from producers’
          own sites and from retailers. We check the links and take down bottles that sell out. No
          producer pays to be listed, and we don’t ask anyone to pay. If you make one of these
          mezcals and want to be added or corrected, email us.
        </p>
      </section>

      <section className="press-page__section" aria-labelledby="sources-references">
        <h2 id="sources-references" className="press-page__heading">Our main references</h2>
        {REFERENCE_GROUPS.map((group) => (
          <div key={group.heading}>
            <h3 className="press-page__subheading">{group.heading}</h3>
            <ul className="press-page__list">
              {group.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="press-page__note">
          We also used general encyclopedias and nursery listings to cross-check basics like height
          and leaf shape.
        </p>
      </section>

      <section className="press-page__section" aria-labelledby="sources-corrections">
        <h2 id="sources-corrections" className="press-page__heading">Spotted something wrong?</h2>
        <p>
          Tell us at <a href="mailto:hola@mezcalomano.com">hola@mezcalomano.com</a>. We’d rather be
          corrected than stay wrong.
        </p>
        <p className="press-page__note">Last updated October 2026.</p>
      </section>
    </article>
  );
}
