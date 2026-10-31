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
      text: "Mezcal is a legal label, and the official standard, NOM-070-SCFI-2016, sorts it into three categories by how it is made. You will see the category on a label as **Mezcal**, **Mezcal Artesanal** or **Mezcal Ancestral**.",
    },
    {
      type: "table",
      head: ["Category", "How it is made, in short"],
      rows: [
        ["Mezcal", "The widest category. Allows modern methods such as autoclave cooking, diffusers, industrial mills and a broad range of stills."],
        ["Mezcal Artesanal", "Traditional methods with some flexibility, for example masonry or pit ovens, mechanical shredders and alembic stills."],
        ["Mezcal Ancestral", "The strictest. Pit-oven cooking, hand or stone milling, and distillation in clay pot stills over direct fire."],
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
        "**Cooking:** the agave is baked in earthen pit ovens.",
        "**Milling:** the cooked agave is crushed by hand with a mallet or with a stone wheel called a tahona.",
        "**Fermentation:** in vessels such as wooden tanks, stone, clay or even animal hides, and agave fiber may stay in.",
        "**Distillation:** in clay pot stills heated over direct fire, sometimes with a clay or wooden top (a montera).",
      ],
    },
    {
      type: "p",
      text: "It is the most hands-on way to make mezcal, and the one closest to how it was made for generations. Ancestral producers also work with wild and cultivated agaves, and the [directory](/directory) shows which agaves grow wild.",
    },
    { type: "h2", text: "What makes a mezcal artesanal?" },
    {
      type: "p",
      text: "Artesanal covers traditional, small-scale production with more room to choose tools. A maker might cook in a pit or a masonry oven, mill with a tahona or a mechanical shredder, and distill in an alembic still of copper or clay. It sits between the industrial category and the strict ancestral one, and most bottles that mention a traditional method fall here.",
    },
    {
      type: "p",
      text: "The standard also restricts additives in the two traditional categories, which is part of what the words promise. Because the exact rules are detailed, always look for the category printed on the label rather than inferring it from a marketing phrase.",
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
    "IMPORTANT: legal definitions. I could not retrieve the full official text of NOM-070-SCFI-2016. The ancestral details (pit oven, mallet or tahona, fermentation vessels including hides, clay pot stills over direct fire) match two secondary sources (Mezcalistas https://www.mezcalistas.com/what-is-ancestral-mezcal/ and a summary of the standard at https://www.normasoficiales.mx/nom/nom-070-scfi-2016). The artesanal and 'mezcal' (industrial) rows are looser: please verify the exact permitted cooking, milling and still types for each category against the official text or COMERCAM before publishing.",
    "The line that additives are restricted in the two traditional categories comes from one summary of the standard. Verify.",
    "'Often more expensive because slower and smaller scale' and 'pit ovens give much of the toasty and smoky character' are inferences or general knowledge, flagged as such.",
    "We are agave first, so this article names no brands and should not.",
    "Swap the hero photo if you have a better palenque or pit shot.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
