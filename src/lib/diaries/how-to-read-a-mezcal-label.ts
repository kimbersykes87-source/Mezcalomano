import type { DiaryEntry } from "./types";

export const howToReadAMezcalLabel: DiaryEntry = {
  slug: "how-to-read-a-mezcal-label",
  title: "How to Read a Mezcal Label",
  description:
    "How to read a mezcal label: what mezcal vs destilado de agave means, where to find the agave, batch, producer code and strength, and what to look for.",
  category: "Basics",
  answer:
    "A mezcal label tells you the category (mezcal or destilado de agave), the agave, how it was made, and who made it. Look for the agave name first, then the certification details (producer code and batch or lot number) on the back, and use our flavor compass to guess what is in the bottle.",
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
        ["The agave name", "The plant, such as Espadín or Tobalá. The most useful clue to flavor."],
        ["Artesanal or ancestral", "A style of traditional production. Not every bottle shows one."],
        ["ABV (percent alcohol)", "Strength. Higher numbers tend to taste bigger and warmer."],
        ["Region or state", "Where it was made. Our [map](/map) shows where each agave grows."],
      ],
    },
    {
      type: "p",
      text: "Not sure what artesanal or ancestral mean? They are production categories in the official mezcal standard, and the words you see on the label describe how the bottle was made.",
    },
    { type: "h2", text: "What is on the back label?" },
    {
      type: "p",
      text: "The back is where a bottle shows its paperwork. On certified mezcal you will often see official certification details such as a producer code, a batch or lot number, and sometimes the name of the maker.",
    },
    {
      type: "list",
      items: [
        "**Batch or lot number.** Mezcal is often made in small runs, and a batch number shows that this bottle came from one of them. It is a sign of traceability.",
        "**Producer code.** An identifier that links the bottle to the registered producer. It is an identifier, not a quality score, and several labels can come from the same distillery.",
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
        "A batch or lot number and certification details on the back.",
        "A region or state, and ideally a maker.",
        "A strength you are comfortable with. Most bottles fall somewhere around 40 to 50 percent.",
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
    "The mezcal vs destilado de agave wording and 'producer code, batch or lot, artesanal or ancestral' come from the deck's Introduction card. The karwinskii example comes from our Cards CSV.",
    "The list of what appears on the back label (batch, producer code, maker) is general industry knowledge from sources like Mezcalistas (https://www.mezcalistas.com/nom/) and The Tasting Alliance. I could not retrieve the full official labeling rules. Please check the label requirements in NOM-070-SCFI-2016 and with COMERCAM before publishing.",
    "'Producer code is an identifier, not a quality score, and several labels can come from the same distillery' is from Mezcalistas. Please confirm.",
    "'Most bottles fall around 40 to 50 percent' is a loose generalization. Check or soften.",
    "We are agave first, so this article names no brands and should not.",
    "Swap the hero photo for a bottle label shot (no brand visible) if you can.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
