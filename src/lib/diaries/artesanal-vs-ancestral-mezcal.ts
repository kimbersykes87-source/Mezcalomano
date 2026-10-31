import type { DiaryEntry } from "./types";

export const artesanalVsAncestralMezcal: DiaryEntry = {
  slug: "artesanal-vs-ancestral-mezcal",
  title: "Artesanal vs Ancestral Mezcal Explained",
  description:
    "Artesanal vs ancestral mezcal: the three legal categories, how each is made, and what the words mean in the glass. Plain English, from the official standard.",
  category: "Basics",
  answer:
    "Mexico's mezcal standard has three categories: mezcal, mezcal artesanal and mezcal ancestral, ordered from most flexible to most traditional in how they are made. Ancestral is the strictest, with pit-oven cooking and distillation in clay pots over direct fire, and artesanal sits in the middle.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-2-pit.jpg",
    alt: "A guide explaining the stone roasting pit at a palenque in Oaxaca.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "What are the three categories of mezcal?" },
    {
      type: "p",
      text: "Mezcal is a legal label, and the official standard, [NOM-070-SCFI-2016](https://comercam-dom.org.mx/wp-content/uploads/2022/04/DOF-2017.02.23-NOM-070-SCFI-2016-Alcoholic-Beverages-Mezcal-Specifications.pdf), sorts it into three categories by how it is made. You will see the category on a label as **Mezcal**, **Mezcal Artesanal** or **Mezcal Ancestral**.",
    },
    {
      type: "table",
      head: ["Category", "How it is made, in short"],
      rows: [
        ["Mezcal", "The widest category. Cooking in underground ovens, stone basins or an autoclave, milling with a tahona, mills, a shredder or a diffuser, and a broad range of stills."],
        ["Mezcal Artesanal", "Traditional methods with some flexibility: pits or raised stone basins for cooking, mauls, tahona, mills or a shredder for crushing, and direct fire in copper or clay stills."],
        ["Mezcal Ancestral", "The strictest. Stone pits only for cooking, mauls, tahona or mills for crushing, and distillation in a clay pot over direct fire."],
      ],
    },
    {
      type: "p",
      text: "Read the table as a spectrum, not a ranking. Each category is a set of allowed methods, and the label tells you which set the maker chose.",
    },
    { type: "h2", text: "What makes a mezcal ancestral?" },
    {
      type: "list",
      items: [
        "**Cooking:** the agave is baked in stone pits only.",
        "**Milling:** the cooked agave is crushed with mauls, a stone wheel called a tahona, or an Egyptian or Chilean mill.",
        "**Fermentation:** in vessels such as wooden tanks, stone, clay or even animal hides, and agave fiber may stay in.",
        "**Distillation:** in a clay pot heated over direct fire, with clay or wooden coils.",
      ],
    },
    {
      type: "p",
      text: "It is the most hands-on way to make mezcal, and the one closest to how it was made for generations. Our [directory](/directory) shows which agaves grow wild.",
    },
    { type: "h2", text: "What makes a mezcal artesanal?" },
    {
      type: "p",
      text: "Artesanal keeps traditional methods but allows more choice of tools. A maker might cook in a pit or a raised stone basin, crush with mauls, a tahona, a mill or a shredder, and distill over direct fire in a copper or clay still. It sits between the widest category and the strict ancestral one.",
    },
    {
      type: "p",
      text: "All three categories are 100% agave spirits. Because the exact rules are detailed, look for the category printed on the label rather than inferring it from a marketing phrase.",
    },
    { type: "h2", text: "Does the category change how mezcal tastes?" },
    {
      type: "p",
      text: "It can, but the agave usually matters more. Pit-oven cooking is where much of mezcal's toasty and smoky character comes from, and clay pots and wild fermentation can add their own notes. Two bottles from the same category can still taste very different, and so can two bottles of the same agave.",
    },
    {
      type: "p",
      text: "A good way to see the effect is to taste with our flavor compass (smoke, agave, fermentation). Compare a clean, mineral agave such as [Madrecuixe](/directory/madrecuixe) with a toasty, mineral, fruity one such as [Arroqueño](/directory/arroqueno), then notice how maker and method nudge each.",
    },
    { type: "h2", text: "Is ancestral better than artesanal?" },
    {
      type: "p",
      text: "Not automatically. Ancestral is the most traditional, and artesanal is traditional with flexibility. Both can be excellent, and both can be forgettable. Taste decides, not the word on the bottle. Our Discovery Deck (ours) can help you compare agaves side by side.",
    },
  ],
  faq: [
    {
      q: "What is the difference between artesanal and ancestral mezcal?",
      a: "Both are traditional categories. Ancestral is stricter: pit-oven cooking, hand or stone milling and distillation in clay pots over direct fire. Artesanal allows more tools and sits between ancestral and the widest category.",
    },
    {
      q: "Is ancestral mezcal more expensive?",
      a: "Often, because it is slower and smaller scale, but that is an inference rather than a rule. Price depends on the agave, the batch size and the maker.",
    },
    {
      q: "Where does the standard come from?",
      a: "Mexico's official standard for mezcal is NOM-070-SCFI-2016, and the certifying council is COMERCAM, the Consejo Mexicano Regulador de la Calidad del Mezcal.",
    },
  ],
  reviewNotes: [
    "Legal definitions checked 31 Oct 2026 against the official English translation of NOM-070-SCFI-2016 hosted by COMERCAM (sections 4.4, 4.4.2 and 4.4.3). Spanish prevails in disputes, so have the Spanish text, or COMERCAM, confirm once if you can.",
    "The earlier line about restricted additives was removed: the standard text does not tie it to a category in a way I could confirm. The article now says only that all three are 100% agave.",
    "'Often more expensive because slower and smaller scale' and 'pit ovens give much of the toasty and smoky character' are inferences or general knowledge, flagged as such.",
    "We are agave first, so this article names no brands and should not.",
    "Swap the hero photo if you have a better palenque or pit shot.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
