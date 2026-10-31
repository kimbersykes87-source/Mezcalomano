import type { DiaryEntry } from "./types";

export const howLongDoesAgaveTakeToGrow: DiaryEntry = {
  slug: "how-long-does-agave-take-to-grow",
  title: "How Long Does Agave Take to Grow?",
  description:
    "How long does agave take to grow? From about 6 to 8 years for espadín to 20 years or more for slow wild agaves, with real numbers from our 40 agaves.",
  category: "Agave",
  answer:
    "It depends on the species: roughly 6 to 8 years for espadín, and 20 years or more for slow agaves like arroqueño and tepextate (up to 25 years). Most agaves flower once and then die, so growers harvest the plant for mezcal at or just before that point.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-4-agave.jpg",
    alt: "Rows of agave growing on a hillside in the Oaxacan highlands.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "How many years does an agave take to mature?" },
    {
      type: "p",
      text: "There is no single answer, because the number depends on the species. These are the figures in our directory and on our cards:",
    },
    {
      type: "table",
      head: ["Agave", "Years to maturity"],
      rows: [
        ["[Espadín](/directory/espadin)", "6 to 8"],
        ["[Lumbre](/directory/lumbre)", "About 7"],
        ["[Warash](/directory/warash)", "Often 8 to 11"],
        ["[Verde](/directory/verde)", "10 to 20 to reach full height"],
        ["[Arroqueño](/directory/arroqueno)", "Around 20, longer in the wild"],
        ["[Cenizo](/directory/cenizo)", "Up to 20 to reach full size"],
        ["[Tepextate](/directory/tepextate)", "Up to 25"],
      ],
    },
    {
      type: "p",
      text: "Other published ranges differ. One drinks reference gives 5 to 9 years for espadín, 10 to 15 for Tobalá and 12 to 15 for Barril, with Barril up to 30 in the wild ([a drinks reference guide](https://www.diffordsguide.com/bws/1264/mezcal/agave-varieties)). Treat every number as a range, not a promise.",
    },
    { type: "h2", text: "Why is the range so wide?" },
    {
      type: "p",
      text: "Time to maturity depends on the plant's vigor, the richness of the soil and the climate, and it also varies from species to species. Some agaves are small and quick. Others are large rosettes that spend most of their life storing water and sugars in thick, fleshy leaves. A wild plant on a dry, rocky slope generally grows more slowly than a farmed one in a field.",
    },
    { type: "h2", text: "What happens when an agave flowers?" },
    {
      type: "p",
      text: "Most agaves are monocarpic, which means they flower once and then die. The plant sends up a tall stalk, the quiote, which in some species can reach about 40 feet and carries many small flowers. After that, the original rosette dies, and young plants, called pups, can grow from its base and carry on. The century plant nickname comes from this long wait before the single flowering, which in some agaves can take decades.",
    },
    {
      type: "p",
      text: "For mezcal, the part that matters is the piña, the core or head of the plant. Harvesters generally cut it when the plant is mature and before it flowers, which also stops it reproducing by seed. Compare two plants on our pages: [Espadín](/directory/espadin), the farmed workhorse, and [Tobalá](/directory/tobala), a small wild agave from rocky slopes.",
    },
    { type: "h2", text: "Why does the wait matter?" },
    {
      type: "list",
      items: [
        "**Supply cannot rise quickly.** A plant that takes 7 years or 25 cannot be ramped up in a season. Public radio reporting noted that agaves planted when the mezcal boom began would not yet be ready to harvest.",
        "**Slow plants cost more.** Years of land, care and risk go into every bottle, and the slowest agaves are the scarcest.",
        "**It is why variety matters.** Almost all mezcal comes from one fast-growing plant, so the slow agaves are the ones at risk.",
      ],
    },
    {
      type: "p",
      text: "Think of it as time in the glass: a tepextate that goes into the ground today might not be ready until the 2050s. Our deck shows the plants and their flavor compass, and our [directory](/directory) and [map](/map) show where each one grows.",
    },
  ],
  faq: [
    {
      q: "How long does it take for agave to mature for mezcal?",
      a: "Anywhere from about 6 to 8 years for espadín to 20 years or more for slower agaves like arroqueño, and up to 25 years for tepextate. Soil, climate and whether the plant is wild or farmed all change the number.",
    },
    {
      q: "Do agave plants die after flowering?",
      a: "Most do. They flower once and then the main plant dies, though pups can grow from its base. For mezcal, the plant is usually harvested before it flowers.",
    },
    {
      q: "Why do some agaves take 20 years or more?",
      a: "Slow agaves are often wild and grow on dry, rocky slopes, where they store water and sugars in their leaves for many years before they are ready.",
    },
  ],
  reviewNotes: [
    "From our data: espadín 6 to 8 years, Lumbre about 7, Warash often 8 to 11, Verde 10 to 20 (time to ultimate height), Arroqueño around 20 (longer in the wild), Cenizo up to 20 (climb to full size), Tepextate up to 25 (the card). Warash, Verde, Arroqueño and Cenizo come from the Website CSV description column. Please check them against the cards and species pages.",
    "Outside sources: Difford's Guide agave varieties (https://www.diffordsguide.com/bws/1264/mezcal/agave-varieties) for the other ranges and for 'harvest before flowering'; Wikipedia's Agave article for monocarpic, quiote up to about 40 feet, pups and 'depends on vigor, soil and climate'; a public radio piece (https://www.kaxe.org/2024-02-04/mexicos-wild-agave-plants-are-disappearing-will-mezcal-follow) for plants started in the boom not being ready. Our deck's espadín 6 to 8 and Difford's 5 to 9 differ, as the article says.",
    "Less certain: 'wild plants on dry rocky slopes generally grow more slowly than farmed ones' is general reasoning, not a sourced fact. The 'tepextate planted today might be ready in the 2050s' is arithmetic on the 'up to 25 years' figure. The 'almost all mezcal comes from one plant' line uses the roughly 85% espadín fact.",
    "I did not use the pollinator or bat angle; add it if you want to nod to the deck's jokers.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
