import type { DiaryEntry } from "./types";

export const howToReadAMezcalLabel: DiaryEntry = {
  slug: "how-to-read-a-mezcal-label",
  title: "How to Read a Mezcal Label",
  description:
    "How to read a mezcal label: what mezcal vs destilado de agave means, where to find the agave, the lot number, the seal and the strength, and what to look for.",
  category: "Basics",
  answer:
    "A mezcal label tells you the category (mezcal or destilado de agave), the agave, how it was made, and who made it. Look for the agave name first, then the lot number and the numbered certification seal, and use our flavor compass to guess what is in the bottle.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-1-sign.jpg",
    alt: "A roadside sign pointing the way to Oaxaca, with a dog resting beneath it.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "What does \"mezcal\" on a label actually mean?" },
    {
      type: "p",
      text: "Mezcal is also a legal label. Mexico's Mezcal Denomination of Origin (known as the DOM) defines where mezcal can be made and the rules it must follow. If a bottle is produced inside the DOM and certified, it can say mezcal on the label.",
    },
    {
      type: "p",
      text: "If it is made outside the DOM, or made without certification, you will often see **destilado de agave** or **agave spirit** instead, even when it is made with mezcal tradition and care. So \"destilado de agave\" is not a warning sign. It is a legal distinction, and some thoughtful, traditional spirits sit on that side of the line.",
    },
    { type: "h2", text: "What is on the front of the bottle?" },
    {
      type: "table",
      head: ["On the label", "What it tells you"],
      rows: [
        ["Mezcal or destilado de agave", "The legal category (see above)."],
        ["The agave name", "The plant, by its common or scientific name, such as Espadín or Tobalá. If more than one agave is used, they are listed by amount. The most useful clue to flavor."],
        ["Artesanal or ancestral", "A style of traditional production. Not every bottle shows one."],
        ["ABV (% Alc. Vol.)", "Strength. The standard allows 35 to 55 percent. Higher numbers tend to taste bigger and warmer."],
        ["State of production", "The label must name the Mexican state where it was made. Our [map](/map) shows where each agave grows."],
        ["100% Agave", "Required wording. Mezcal is a 100% agave spirit."],
      ],
    },
    {
      type: "p",
      text: "Not sure what artesanal or ancestral mean? They are production categories in the [official mezcal standard](https://comercam-dom.org.mx/wp-content/uploads/2022/04/DOF-2017.02.23-NOM-070-SCFI-2016-Alcoholic-Beverages-Mezcal-Specifications.pdf), and the words you see on the label describe how the bottle was made.",
    },
    { type: "h2", text: "What is on the back label?" },
    {
      type: "p",
      text: "The back is where a bottle shows its paperwork. On certified mezcal the standard requires a lot identification and a numbered certification seal, along with the name and address of the producer, bottler or brand holder. Some labels add the name of the person who made it.",
    },
    {
      type: "list",
      items: [
        "**Lot number.** Required on the label and marked on the bottle. It shows which production run this bottle came from, which makes it traceable.",
        "**Certification seal.** A numbered seal from the certifying body, with a unique code for each bottle. It shows the bottle is certified. It is not a quality score.",
        "**Maker or maestro.** Some labels name the person who made it, and some tell you the village. It is a nice detail, and it tells you where to look the plant up.",
        "**Production notes.** Some labels list the agave, how it was cooked and distilled, and the vintage. More detail is usually a good sign.",
      ],
    },
    { type: "h2", text: "Why doesn't the agave name always match the plant?" },
    {
      type: "p",
      text: "The name on a label might be a species name, a local name or both, and they do not always match one to one. In our deck, five local names (Cuishe, Barril, Madrecuixe, Bicuixe and Tobaziche) all sit under one species, Agave karwinskii. Botanists still debate where one species ends and another begins, and the same name can mean slightly different things in different regions.",
    },
    {
      type: "p",
      text: "So treat the agave name as a guide to flavor, not a guarantee. Look it up in the [directory](/directory), where each of the 40 agaves has its own page, and use our three-word compass (smoke, agave, fermentation) as a starting point. For example, [Madrecuixe](/directory/madrecuixe) reads clean, mineral, fruity, and [Lyobaa Coyote](/directory/lyobaa_coyote) reads smoky, herbal, funky.",
    },
    { type: "h2", text: "What should you look for in a good label?" },
    {
      type: "list",
      items: [
        "The agave is named, not just \"agave\".",
        "A lot number and the certification seal.",
        "A region or state, and ideally a maker.",
        "A strength you are comfortable with. The standard allows 35 to 55 percent.",
      ],
    },
    {
      type: "p",
      text: "A pretty label says nothing about the spirit. A clear one tells you what is inside, and a bottle that tells you the agave, the maker and the batch is telling you something about itself.",
    },
    {
      type: "p",
      text: "Want the vocabulary in your pocket? Every card in the Discovery Deck (ours) carries the flavor compass, and a reference card explains each word.",
    },
  ],
  faq: [
    {
      q: "What is the difference between mezcal and destilado de agave on a label?",
      a: "Mezcal is made inside Mexico's Denomination of Origin and certified. Destilado de agave, or agave spirit, is made outside it or without certification. The quality can be just as high.",
    },
    {
      q: "What does a batch or lot number tell you?",
      a: "That the bottle came from one specific production run. Because mezcal is often made in small batches, it helps trace where your bottle came from.",
    },
    {
      q: "Does a higher ABV mean better mezcal?",
      a: "No. Strength changes how a mezcal feels (bigger, warmer) but not whether it is good. Choose the strength you enjoy sipping.",
    },
  ],
  reviewNotes: [
    "The mezcal vs destilado de agave wording comes from the deck's Introduction card. The card says 'producer code, batch or lot number'; the standard text I read names the producer's name, address and tax ID, a lot identification and a numbered certification seal, and does not define a 'producer code'. Check whether the card wording should change, or whether the producer NOM number on bottles is what the card means.",
    "Label requirements checked 31 Oct 2026 against section 6.1 of the official English translation of NOM-070-SCFI-2016 hosted by COMERCAM (Spanish prevails in disputes): category word, class word, 100% agave, ABV as % Alc. Vol., agave name, 'Protected Denomination of Origin', state, producer details and lot. ABV range 35 to 55 percent is Table 2.",
    "The 'Maker or maestro' and 'Production notes' bullets are optional extras that appear on some labels, not requirements.",
    "The 40 to 50 percent claim was replaced with the standard's allowed range, 35 to 55 percent.",
    "We are agave first, so this article names no brands and should not.",
    "Swap the hero photo for a bottle label shot (no brand visible) if you can.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
