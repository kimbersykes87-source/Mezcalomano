import type { DiaryEntry } from "./types";

export const tobalaVsEspadin: DiaryEntry = {
  slug: "tobala-vs-espadin",
  title: "Tobalá vs Espadín: What's the Difference?",
  description:
    "Tobalá vs espadín: how the two agaves grow, why one is rare, and how they taste side by side, using our three-word flavor compass.",
  category: "Agave vs agave",
  answer:
    "Espadín is the farmed, widely planted agave behind most mezcal, with a toasty, roasted, fruity profile. Tobalá is a small, mostly wild agave from rocky hillsides in Oaxaca, Puebla and Veracruz, with a toasty, floral, fruity profile. On our flavor compass the two differ by a single word, roasted versus floral, and the bigger difference is the plant itself.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-4-agave.jpg",
    alt: "Rows of agave growing on a hillside in the Oaxacan highlands.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "What is the difference between Tobalá and espadín?" },
    {
      type: "p",
      text: "Espadín is the workhorse and Tobalá is the hidden gem, which are the nicknames we gave them on their cards. Here they are side by side, with facts from our [directory](/directory).",
    },
    {
      type: "table",
      head: ["", "Espadín", "Tobalá"],
      rows: [
        ["Species", "Agave angustifolia", "Agave potatorum"],
        ["Card nickname", "Field Workhorse", "Hidden Gem"],
        ["Flavor compass", "Toasty, roasted, fruity", "Toasty, floral, fruity"],
        ["How it grows", "Cultivated and very widely planted, about 6 to 8 years to maturity", "Wild and semi managed, on rocky slopes and cliffs"],
        ["Size", "About 2.5 to 4.5 feet", "About 0.8 to 2 feet"],
        ["Where", "26 states in our directory", "Oaxaca, Puebla and Veracruz"],
        ["Share of production", "84.53% of certified mezcal in 2025", "A small fraction by comparison"],
      ],
    },
    {
      type: "p",
      text: "The production figure comes from [COMERCAM, the council that certifies mezcal](https://comercam-dom.org.mx/wp-content/uploads/2026/05/INFORME-2026_VERSION-PUBLICA.pdf). Meet the plants on their own pages: [Espadín](/directory/espadin) and [Tobalá](/directory/tobala).",
    },
    { type: "h2", text: "How do they taste different?" },
    {
      type: "p",
      text: "Our flavor compass reads smoke, agave, fermentation. Both agaves score toasty on smoke (warm roast and browned notes) and fruity on fermentation (citrus, tropical or orchard fruit). The difference sits in the middle word.",
    },
    {
      type: "list",
      items: [
        "**Espadín is roasted:** baked agave, caramel and nutty roast. Warm, rounded and familiar.",
        "**Tobalá is floral:** blossoms and perfume. Lifted and aromatic.",
      ],
    },
    {
      type: "p",
      text: "Treat that as a compass, not a promise. Region, soil and maker change every bottle, so no two taste exactly alike, even from the same agave name.",
    },
    { type: "h2", text: "Why is Tobalá harder to find?" },
    {
      type: "p",
      text: "Espadín is planted in fields and harvested in quantity. Tobalá is a small, compact plant that grows wild or semi managed on rocky slopes and cliffs, and harvesting it often means careful, hands-on work. Small plants mean fewer bottles per plant, which is part of why Tobalá is rarer and often costs more. Our directory describes it as a high value wild and semi managed mezcal agave.",
    },
    { type: "h2", text: "Is espadín the lesser mezcal?" },
    {
      type: "p",
      text: "No. A good espadín is a reliable, friendly baseline, and it is where most people start for a reason. Tobalá is not automatically better, it is different.",
    },
    {
      type: "p",
      text: "There is a bigger reason to look beyond espadín too. Most mezcal comes from that one plant, which puts a lot of pressure on it, and on the biodiversity that makes mezcal interesting in the first place. Trying other agaves helps keep that variety in the bottle.",
    },
    { type: "h2", text: "How do you taste them side by side?" },
    {
      type: "list",
      items: [
        "Pour a small amount of each into matching small cups, so the only thing that changes is the agave.",
        "Smell before you sip. Espadín should lean toward baked agave and fruit, Tobalá toward blossoms and fruit.",
        "Sip slowly, then wait. Notice what lingers.",
        "Compare notes using the compass: smoke, agave, fermentation.",
        "At a bar, ask for a half pour of each by agave name. Most bartenders are happy to help.",
      ],
    },
    { type: "h2", text: "Which should you try first?" },
    {
      type: "p",
      text: "Start with an espadín as your baseline, then make Tobalá your first step sideways. Because the compass changes by only one word, you will notice exactly what the plant adds. After that, our [map](/map) shows where each of the 40 agaves grows, and the deck gives every one its own compass.",
    },
  ],
  faq: [
    {
      q: "Is Tobalá better than espadín?",
      a: "Not automatically. Espadín is a dependable, friendly baseline. Tobalá is rarer and more aromatic. Which one you prefer is a matter of taste.",
    },
    {
      q: "Why is Tobalá more expensive?",
      a: "It grows wild or semi wild on rocky slopes, the plants are small, and harvesting is hands-on, so there is less of it. Our directory lists it as a high value mezcal agave.",
    },
    {
      q: "Is Tobalá a wild agave?",
      a: "Mostly. It is wild or semi managed, growing on rocky slopes and cliffs in Oaxaca, Puebla and Veracruz.",
    },
  ],
  reviewNotes: [
    "Every fact in the table comes from our directory data and the deck's Cards data: species names, nicknames, compass words, size, states, terrain and 'wild and semi managed'. The share of production is COMERCAM 2025 (84.53%). Please confirm they still match the cards and the species pages.",
    "'Small plants mean fewer bottles per plant' is an inference, not a directory fact. Keep it if you agree, or cut it.",
    "The one-word compass difference and the roasted vs floral descriptions use the definitions from the flavor guide card.",
    "We are agave first, so this article names no brands and should not.",
    "Swap the hero photo if you have a better one of a Tobalá plant or the two cards side by side.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
