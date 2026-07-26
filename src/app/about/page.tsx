export const metadata = {
  title: "About",
  description:
    "Mezcalómano celebrates agave through the Discovery Deck playing cards and a free species directory for mezcal lovers and the curious.",
};

export default function AboutPage() {
  return (
    <article className="about-page">
      {/* PLACEHOLDER — Hero image (final = cards + copitas shot, product in use). Replace grey block with final landscape asset. */}
      <div
        className="about-page__hero-placeholder"
        role="img"
        aria-label="Placeholder for About hero image: cards and copitas, product in use"
      >
        <span className="about-page__placeholder-label">
          Hero image
          <br />
          Cards + copitas (product in use)
        </span>
      </div>

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
          <span className="about-page__placeholder-label">Agave</span>
        </div>
        <div className="about-page__collage-slot">
          <span className="about-page__placeholder-label">Production</span>
        </div>
        <div className="about-page__collage-slot">
          <span className="about-page__placeholder-label">Bottles</span>
        </div>
        <div className="about-page__collage-slot">
          <span className="about-page__placeholder-label">Landscape</span>
        </div>
      </div>
    </article>
  );
}
