import type { DiaryEntry } from "./types";

export const batsAndAgave: DiaryEntry = {
  slug: "bats-and-agave",
  title: "Bats and Agave: Why the Pollinators Matter",
  description:
    "Why bats matter to agave: how they pollinate, why most mezcal agaves are harvested before they flower, and what that means for biodiversity.",
  category: "Culture",
  answer:
    "Bats pollinate agaves by feeding on nectar from the tall flower stalks and carrying pollen from plant to plant. Most agaves grown for mezcal are harvested before they flower, so letting some plants bloom is one way to keep the genetic variety that makes mezcal interesting.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-4-agave.jpg",
    alt: "Rows of agave growing on a hillside in the Oaxacan highlands.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "How do bats pollinate agave?" },
    {
      type: "p",
      text: "Many agaves send up a tall flower stalk once, late in life. At night, nectar-feeding bats visit the flowers, and pollen sticks to their fur and carries on to the next plant. The U.S. Fish and Wildlife Service describes the lesser long-nosed bat as an important pollinator of Mexico's tequila-producing agave, and says agaves in Mexico rely on bats for pollination in a symbiotic partnership. The bats follow a seasonal \"nectar trail\" of blooming agaves and cacti, and can travel up to 40 miles a night to feed. You can read the [Fish and Wildlife Service's account](https://www.fws.gov/press-release/2018-04/bi-national-success-lesser-long-nosed-bat-has-recovered-0).",
    },
    {
      type: "p",
      text: "That is why the Discovery Deck (our own, so weigh that accordingly) has two bat jokers. Each one is a pollinator that spreads agave pollen, a nod to the animals that keep the tradition alive.",
    },
    { type: "h2", text: "Why are most mezcal agaves harvested before they flower?" },
    {
      type: "p",
      text: "Because the plant stores its sugar in the piña, and that sugar is what becomes spirit. Producers often cut the flower stalk and wait a further six to 12 months before harvesting, since the sugar content peaks then. A [study of mezcal production](https://www.frontiersin.org/articles/10.3389/fsufs.2022.832532/full) notes that this early cutting interrupts the plant's sexual reproduction cycle.",
    },
    { type: "h2", text: "What does that mean for biodiversity?" },
    {
      type: "p",
      text: "Plants grown from seed are all slightly different. Plants grown from offshoots are clones. The same study notes that cultivated agaves are often propagated vegetatively from a few clones, which lowers genetic variety, while natural cross-pollination helps maintain it. Wild plants matter too: the study warns that wild populations of Tobalá face heavy pressure, and it suggests that at least 30% of adult plants, wild and cultivated, be allowed to produce seeds.",
    },
    {
      type: "p",
      text: "Then there is the scale of one plant. About 85% of mezcal is made from a single agave, [Espadín](/directory/espadin): it made up 84.53% of certified mezcal production in 2025, according to [COMERCAM](https://comercam-dom.org.mx/wp-content/uploads/2026/05/INFORME-2026_VERSION-PUBLICA.pdf), the council that certifies mezcal. The deck's introduction puts it plainly: that is a lot of pressure on one plant, and a real risk to the biodiversity that makes mezcal so fascinating.",
    },
    { type: "h2", text: "Are the bats doing okay?" },
    {
      type: "p",
      text: "The lesser long-nosed bat is a recovery story. It was protected in the United States in 1988, when fewer than 1,000 bats were known at 14 roosts. By 2018 an estimated 200,000 bats used 75 roosts, and it was removed from the U.S. endangered species list as the first bat to recover. Mexico had removed it from its own list in 2015. Recovery depends on the nectar trail staying intact, which means agaves still need to be allowed to flower.",
    },
    { type: "h2", text: "What can a drinker do?" },
    {
      type: "list",
      items: [
        "**Try agaves beyond espadín.** Every other agave you ask for spreads demand across the family. Our [directory](/directory) has all 40.",
        "**Ask the bartender** whether the agave was wild or cultivated, and whether any plants were left to flower.",
        "**Pull a bat joker** when you play, and pass it on. It is a small reminder of who does the pollinating.",
      ],
    },
  ],
  faq: [
    {
      q: "Do bats really pollinate agave?",
      a: "Yes. The U.S. Fish and Wildlife Service says agaves in Mexico rely on bats for pollination, and names the lesser long-nosed bat as an important pollinator of Mexico's tequila-producing agave.",
    },
    {
      q: "Why are agave plants cut before they flower?",
      a: "The plant stores sugar in its heart before flowering. Producers cut the flower stalk and harvest when the sugar peaks, which stops the plant from producing seed.",
    },
    {
      q: "Is mezcal bad for bats?",
      a: "It can be if no agave is ever allowed to flower, because bats rely on the blooms for nectar. Allowing some plants to flower, and enjoying a wider range of agaves, helps.",
    },
  ],
  reviewNotes: [
    "Our sources name the lesser long-nosed bat as a pollinator of agaves in Mexico (Fish and Wildlife Service) and describe the tequila agave. They do not say which mezcal agaves depend on which bats. The article says 'agaves in Mexico', not 'every mezcal agave'. Please keep it that way unless you find a source.",
    "'Many agaves send up a tall flower stalk once, late in life' is general botany, not from the sources above. Please confirm or soften.",
    "The study (Frontiers in Sustainable Food Systems, 2022) supports: early cutting of the flower stalk, 6 to 12 months before harvest, cultivated agaves often propagated from a few clones, the 30% of adult plants producing seeds recommendation, and heavy pressure on wild Tobalá. It does not say espadín specifically is propagated by clones, so the article avoids saying that.",
    "Bat recovery facts (1988 listing, under 1,000 bats at 14 roosts, about 200,000 at 75 roosts in 2018, Mexico delisting 2015) come from the Fish and Wildlife Service press release of April 2018. Check for newer monitoring data.",
    "The deck introduction line about biodiversity is paraphrased from the Introduction card.",
    "'Ask whether any plants were left to flower' is our suggestion, not a standard bartender question. Check you are comfortable with it.",
    "The FAQ answer to 'Is mezcal bad for bats?' is our own inference, not from a source. Keep it, soften it or cut it.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
