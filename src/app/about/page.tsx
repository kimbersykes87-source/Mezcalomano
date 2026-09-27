export const metadata = {
  title: "About",
  description:
    "Mezcalómano celebrates agave through the Discovery Deck playing cards and a free species directory for mezcal lovers and the curious.",
};

export default function AboutPage() {
  return (
    <article className="about-page">
      <img
        className="about-page__hero"
        src="/assets/photography/about-hero-2026-09-27-2000.jpg"
        srcSet="/assets/photography/about-hero-2026-09-27-1200.jpg 1200w,
                /assets/photography/about-hero-2026-09-27-2000.jpg 2000w,
                /assets/photography/about-hero-2026-09-27-3300.jpg 3300w"
        sizes="100vw"
        width={2000}
        height={840}
        alt="The Mezcalómano Discovery Deck box beside four agave cards laid out in a row on a wood table."
      />

      <div className="about-page__body">
        <h1 className="about-page__title">ABOUT US</h1>

        <p>
          Mezcalómano started as a small project between two people who love mezcal, love
          learning, and spent years visiting Mexico and tasting everything we could find. Along
          the way we noticed something: too many people order a mezcal at a bar and get
          whatever&apos;s closest, usually espadín, and rarely venture beyond it. Mezcal deserves
          the same kind of exploration as wine or whiskey.
        </p>

        <p>
          The Discovery Deck is our way to bring mezcal to the table, with playing cards that make
          it feel approachable, visual, and fun, whether you&apos;re already hooked or just getting
          curious.
        </p>

        <p>
          Our first print run is small and ships from the US. If you want first dibs on new decks,
          fresh releases, and the other mezcal adventures we&apos;re cooking up, join our mailing
          list.
        </p>

        <div className="about-page__klaviyo">
          <div className="klaviyo-form-QWV2jK" />
        </div>

        <p>
          When your deck lands, scan the QR code to unlock our agave directory and discover even
          more: where different agaves grow across Mexico, and who&apos;s bottling them. Because
          life&apos;s too short for just one agave.
        </p>
      </div>

      {/* PLACEHOLDER — Collage band (final = agave, production, bottles, landscape; landscape crops). Max 4 images — keep these slot dimensions when swapping finals. */}
      <div
        className="about-page__collage"
        role="group"
        aria-label="Placeholder collage: up to four landscape images"
      >
        <div className="about-page__collage-slot">
          <img
            className="about-page__collage-img"
            src="/assets/photography/about-tile-1-sign.jpg"
            width={800}
            height={600}
            loading="lazy"
            alt="A roadside sign pointing the way to Oaxaca, with a dog resting beneath it."
          />
        </div>
        <div className="about-page__collage-slot">
          <img
            className="about-page__collage-img"
            src="/assets/photography/about-tile-2-pit.jpg"
            width={800}
            height={600}
            loading="lazy"
            alt="A guide explaining the stone roasting pit at a palenque in Oaxaca."
          />
        </div>
        <div className="about-page__collage-slot">
          <img
            className="about-page__collage-img"
            src="/assets/photography/about-tile-3-palenque.jpg"
            width={800}
            height={600}
            loading="lazy"
            alt="Two people working beside the stone tahona inside an open-sided palenque."
          />
        </div>
        <div className="about-page__collage-slot">
          <img
            className="about-page__collage-img"
            src="/assets/photography/about-tile-4-agave.jpg"
            width={800}
            height={600}
            loading="lazy"
            alt="Rows of agave growing on a hillside in the Oaxacan highlands."
          />
        </div>
      </div>
    </article>
  );
}
