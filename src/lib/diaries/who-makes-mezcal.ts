import type { DiaryEntry } from "./types";

export const whoMakesMezcal: DiaryEntry = {
  slug: "who-makes-mezcal",
  title: "Who Makes Mezcal? Jimador, Maestro, Palenque",
  description:
    "Who makes mezcal? Meet the jimador who harvests the agave, the maestro who leads the making and the palenque where it all happens.",
  category: "Culture",
  answer:
    "Mezcal is made by people working in a palenque, a small traditional distillery: the jimador harvests the agave, and the maestro or maestra mezcalero leads the cooking, grinding, fermenting and distilling. Their choices shape what ends up in the glass as much as the plant does.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-3-palenque.jpg",
    alt: "Two people working beside the stone tahona inside an open-sided palenque.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "What does a jimador do?" },
    {
      type: "p",
      text: "The jimador is the farmer who harvests the agave. The skill is in spotting a ripe plant, because unripe agave can make the spirit taste bitter or overly sweet. The main tool is a coa, a flat blade on a long pole. A jimador uses it to cut away the flower stalk, which makes the central core swell, and later to strip off the outer leaves, leaving the piña (the heart of the plant) ready to be cooked. You can read more about the job in this [overview of the jimador](https://en.wikipedia.org/wiki/Jimador).",
    },
    { type: "h2", text: "What does a maestro mezcalero do?" },
    {
      type: "p",
      text: "The maestro mezcalero, or maestra, is the master maker. They lead the steps that turn a piña into a spirit. In traditional production that means cooking the agave in a pit oven, crushing it with a mallet or a stone wheel, letting it ferment and distilling it, usually twice. The distiller also cuts away the first and last parts of the second run, so only the heart of it makes the bottle.",
    },
    {
      type: "p",
      text: "A [study of mezcal production in Mexico](https://www.frontiersin.org/articles/10.3389/fsufs.2022.832532/full) lists the authorized producer and the mezcal master among the factors that shape a mezcal's character. That is why two spirits from the same agave can taste so different.",
    },
    { type: "h2", text: "What is a palenque?" },
    {
      type: "p",
      text: "A palenque is a small, traditional mezcal distillery, often open sided and often family run. It is where the pit oven, the stone mill, the fermentation vats and the stills sit together. The photo above shows two people working beside a stone wheel in one in Oaxaca.",
    },
    { type: "h2", text: "Why does the deck give them face cards?" },
    {
      type: "p",
      text: "In the Discovery Deck (our own, so weigh that accordingly), the face cards tip their hats to the people who keep the tradition alive. There are 12 of them: the jack is the jimador, the queen is the maestra and the king is the maestro, in each of the four suits. Each card carries a different job in the making of mezcal.",
    },
    {
      type: "table",
      head: ["Card", "What the four suits do"],
      rows: [
        ["Jack, the jimador", "Harvests ripe piñas, splits the agave hearts, removes the leaves and shears the leaves"],
        ["Queen, the maestra", "Tests the mix, tastes the spirit, distills the essence and strains the liquid"],
        ["King, the maestro", "Lights the hearth, fuels the roast, stirs the mash and grinds the fibers"],
      ],
    },
    {
      type: "p",
      text: "Those are the cards' own one-line descriptions, rephrased. Together they walk through the whole process, from field to still.",
    },
    { type: "h2", text: "Why does it matter who made it?" },
    {
      type: "p",
      text: "Because mezcal is a handmade spirit. The plant, the place and the people all show up in the glass, and no two bottles taste exactly alike, even from the same agave name. Asking who made it, and where, is one of the best questions you can put to a bartender. Our [directory](/directory) and [map](/map) show where each of the 40 agaves grows.",
    },
  ],
  faq: [
    {
      q: "What does jimador mean?",
      a: "A jimador is a farmer who harvests agave. They use a long-handled blade called a coa to trim the plant and cut out the piña.",
    },
    {
      q: "What is the difference between a maestro and a jimador?",
      a: "The jimador harvests the agave in the field. The maestro or maestra mezcalero leads the making of the spirit, from cooking to distilling.",
    },
    {
      q: "What does palenque mean?",
      a: "A palenque is a small, traditional mezcal distillery, where the agave is cooked, crushed, fermented and distilled.",
    },
  ],
  reviewNotes: [
    "Jimador and coa facts are from a general jimador overview (Wikipedia), which is not a primary source. Check them against someone who has worked in a field or palenque, or against your Oaxaca notes.",
    "Palenque definition ('small, traditional mezcal distillery, often open sided and often family run') is general knowledge. Our sources did not define it. Please confirm or soften.",
    "Maestro mezcalero 'leads the steps' is a plain description. The production research paper only lists 'authorized producer, mezcal master' among factors that shape character, and gives the production steps. It does not define the role.",
    "The deck's Cards CSV spells the face cards 'Jimedor' (and one line reads 'Yeilds ripe piñas'). This article uses 'jimador' and rephrases the lines. Check what the printed deck says, and fix the CSV if it has the typo.",
    "The photo is from the Oaxaca trip and shows identifiable people. Confirm you are comfortable using it here.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
