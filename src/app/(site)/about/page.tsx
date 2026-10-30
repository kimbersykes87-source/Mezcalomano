/* eslint-disable @next/next/no-img-element -- responsive srcset photos sized by CSS */
export const metadata = {
  title: "About",
  description:
    "Mezcalómano celebrates agave through the Discovery Deck playing cards and a free species directory for mezcal lovers and the curious.",
  alternates: { canonical: "/about" },
};

const COLLAGE = [
  { src: "/assets/photography/about-tile-1-sign.jpg", alt: "A roadside sign pointing the way to Oaxaca, with a dog resting beneath it." },
  { src: "/assets/photography/about-tile-2-pit.jpg", alt: "A guide explaining the stone roasting pit at a palenque in Oaxaca." },
  { src: "/assets/photography/about-tile-3-palenque.jpg", alt: "Two people working beside the stone tahona inside an open-sided palenque." },
  { src: "/assets/photography/about-tile-4-agave.jpg", alt: "Rows of agave growing on a hillside in the Oaxacan highlands." },
];

export default function AboutPage() {
  return (
    <article>
      <section className="a-hero">
        <picture>
          {/* Phones: a taller crop of the wider shot, so the box and all four cards stay in view */}
          <source
            media="(max-width: 900px)"
            srcSet="/assets/photography/about-hero-mobile-2026-10-30-800.jpg 800w,
                    /assets/photography/about-hero-mobile-2026-10-30-1200.jpg 1200w,
                    /assets/photography/about-hero-mobile-2026-10-30-1800.jpg 1800w"
            sizes="100vw"
            width={1200}
            height={700}
          />
        <img
          src="/assets/photography/about-hero-2026-10-20-2000.jpg"
          srcSet="/assets/photography/about-hero-2026-10-20-1200.jpg 1200w,
                  /assets/photography/about-hero-2026-10-20-2000.jpg 2000w,
                  /assets/photography/about-hero-2026-10-20-3048.jpg 3048w"
          sizes="100vw"
          width={2000}
          height={840}
          fetchPriority="high"
          alt="The Mezcalómano Discovery Deck box beside four agave cards laid out in a row on a wood table."
        />
        </picture>
      </section>

      <section className="a-body">
        <div className="s-wrap">
          <div>
            <p className="s-eyebrow">Two people, one deck</p>
            <h1>About us</h1>
            <p className="tag">Mezcal deserves the same kind of exploration as wine or whiskey.</p>
          </div>
          <div className="a-text">
            <p>
              Mezcalómano started as a small project between two people who love mezcal, love
              learning, and spent years visiting Mexico and tasting everything we could find. Along
              the way we noticed something: too many people order a mezcal at a bar and get
              whatever&apos;s closest, usually espadín, and rarely venture beyond it.
            </p>
            <p>
              The Discovery Deck is our way to bring mezcal to the table, with playing cards that
              make it feel approachable, visual, and fun, whether you&apos;re already hooked or just
              getting curious.
            </p>
            <p>
              Our first print run is small and ships from the US. If you want first dibs on new
              decks, fresh releases, and the other mezcal adventures we&apos;re cooking up, join our
              mailing list in the footer below.
            </p>
            <p>
              When your deck lands, scan the QR code to unlock our agave directory and discover even
              more: where different agaves grow across Mexico, and who&apos;s bottling them.
            </p>
          </div>
        </div>
      </section>

      <section className="a-collage" aria-label="Photos from Oaxaca">
        <div className="s-wrap">
          <div className="grid">
            {COLLAGE.map((img) => (
              <figure key={img.src}>
                <img src={img.src} alt={img.alt} width={1200} height={900} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="a-close">
        <div className="s-wrap">
          <p>
            Because life&apos;s too short for just
            <br className="a-br" /> one agave.
          </p>
        </div>
      </section>
    </article>
  );
}
