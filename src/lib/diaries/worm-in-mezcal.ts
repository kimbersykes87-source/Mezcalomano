import type { DiaryEntry } from "./types";

export const wormInMezcal: DiaryEntry = {
  slug: "worm-in-mezcal",
  title: "The Worm in Mezcal: Myth, Marketing and Truth",
  description:
    "Why is there a worm in some mezcal bottles? The history is murky, the worm is a larva, and the real tradition is sal de gusano with orange.",
  category: "Myths",
  answer:
    "The worm in some mezcal bottles is a larva that lives in agave, and nobody can point to a clear ancient tradition behind putting it in the bottle: the habit looks more like twentieth century marketing. The real tradition is sal de gusano, a salt made from dried, ground agave larvae and chile, served with orange slices alongside mezcal.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-4-agave.jpg",
    alt: "Rows of agave growing on a hillside in the Oaxacan highlands.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "Why is there a worm in some mezcal?" },
    {
      type: "p",
      text: "Nobody knows for certain. A tidy story circulates that the worm was invented in the 1950s as a marketing gimmick, but one careful history, [a long look at the question by a drinks writer](https://www.insidehook.com/drinks/reason-mezcal-worm-history), calls that a false narrative: worm mezcals were already being trademarked in the 1940s, and earlier references treat mezcal and the larvae as separate foods.",
    },
    {
      type: "p",
      text: "There are several theories and no documented answer. Some point to post-Revolution town celebrations, some to workers dropping an insect into a drink, some to marketing, and some to medicinal or aphrodisiac claims, which are speculative. What is clear is that the habit is tied to Oaxaca, and that it was once very widespread in bottles exported to the US.",
    },
    { type: "h2", text: "What is the worm, really?" },
    {
      type: "p",
      text: "It is not a worm. It is the larva of a moth or a related insect that feeds on agave. Two kinds are commonly used: a red one, Comadia redtenbacheri, and a white one, Aegiale hesperiaris. They live inside agave plants and eat them, which is why they are called maguey worms (gusanos de maguey).",
    },
    { type: "h2", text: "Is a worm a sign of good mezcal?" },
    {
      type: "p",
      text: "No. A worm tells you about the marketing, not the spirit. Many thoughtful makers leave it out, and a bottle that leads with a worm usually tells you less about the agave, the maker and the batch than a plain label would. A good rule is to read the label: the agave, the maker, the batch and the region are what matter.",
    },
    {
      type: "p",
      text: "Under the standard, extra ingredients such as a worm are meant to be declared on the label, and bottles with a worm are generally sold as a flavored style rather than as a pure spirit. The exact label wording is worth checking on any bottle you pick up.",
    },
    { type: "h2", text: "Will the worm get you drunk or high?" },
    {
      type: "p",
      text: "No. The worm is just a preserved larva. The idea that it makes you hallucinate comes from mixing up mezcal with mescaline, a different substance that has nothing to do with agave.",
    },
    { type: "h2", text: "What is the real tradition? Sal de gusano" },
    {
      type: "p",
      text: "The tradition that has stuck around in Oaxaca is **sal de gusano**, or worm salt. It is made from dried, ground maguey larvae, salt and dried chile, and it is usually sprinkled on orange slices. You alternate between a sip of mezcal and a bite of the fruit, which refreshes the palate between sips. Insects have been part of Mexican cooking for centuries, and this is a savory, salty, spicy condiment more than a gimmick.",
    },
    {
      type: "p",
      text: "If you want to taste what worm salt does, try it with a mezcal described as clean and fruity in our flavor compass, such as [Madrecuixe](/directory/madrecuixe), where the orange and salt play against the fruit. The Discovery Deck (ours) shows the compass for all 40 agaves.",
    },
  ],
  faq: [
    {
      q: "Is the worm in mezcal real?",
      a: "Yes. It is a preserved larva of an insect that lives in agave, not a true worm. Two kinds are used: a red one and a white one.",
    },
    {
      q: "Do you eat the worm in mezcal?",
      a: "You can, but it is not a requirement of drinking mezcal, and many good mezcals have no worm. The longstanding tradition is the salt, not the bottle worm.",
    },
    {
      q: "What is sal de gusano?",
      a: "A traditional Oaxacan condiment made from dried, ground maguey larvae, salt and chile, served with orange slices alongside mezcal.",
    },
  ],
  reviewNotes: [
    "Sources: InsideHook, 'Uncovering the Real Reason Behind the Mexican Mezcal Worm' (history, 1940s trademarks, theories, red and white larva species, Oaxaca link) and Cocktail Society on sal de gusano (https://cocktail-society.com/barkeeping/sal-de-gusano/). Second check 31 Oct 2026: Wikipedia's Mezcal worm page credits a 1950 introduction of larvae to mezcal by one named producer, which conflicts with InsideHook's 1940s trademark evidence; the body therefore says nobody knows for certain and names no date or person. Wikipedia also confirms the red larva, Comadia redtenbacheri, and says the white one is a separate larva, so the species wording in the body is fine but the exact white species should be confirmed by a specialist.",
    "Claims I am less than certain about: that bottles with a worm are generally sold as a flavored style ('abocado con') and must declare it (the standard summary I could read only says such ingredients must be on the label); that the worm is a moth larva (the white one may be a skipper butterfly larva); and the mescaline mix-up (general knowledge). Please verify or soften.",
    "I left out the 'less than 8% of the market' and '1994 export' figures from the source because they come from one article.",
    "No brands are named. The source article names brands, which I deliberately did not repeat. We are agave first, so this article names no brands and should not.",
    "Swap the hero photo for something of agave larvae or sal de gusano if you can shoot it.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
