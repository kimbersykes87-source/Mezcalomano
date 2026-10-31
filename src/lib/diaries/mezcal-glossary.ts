import type { DiaryEntry } from "./types";

export const mezcalGlossary: DiaryEntry = {
  slug: "mezcal-glossary",
  title: "Mezcal Words Every Drinker Should Know",
  description:
    "A plain glossary of mezcal words: jimador, palenque, artesanal, ancestral, joven, reposado and the flavor compass, explained in a line or two.",
  category: "Glossary",
  answer:
    "Mezcal has its own vocabulary for the people, the process, the label and the taste. This glossary explains the words you are most likely to meet, each in a line or two.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-2-pit.jpg",
    alt: "A guide explaining the stone roasting pit at a palenque in Oaxaca.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "Which words describe the people and places?" },
    {
      type: "table",
      head: ["Term", "Meaning"],
      rows: [
        ["**Jimador**", "The farmer who harvests agave. They use a long-handled blade called a coa to trim the plant and cut out the piña."],
        ["**Maestro or maestra mezcalero**", "The master maker who leads the making of mezcal, from cooking to distilling."],
        ["**Palenque**", "A small, traditional mezcal distillery, where the agave is cooked, crushed, fermented and distilled."],
        ["**Piña**", "The heart of the agave, left after the leaves are cut away. This is what gets cooked."],
        ["**Tahona**", "A big stone wheel used to crush cooked agave. Also called a Chilean or Egyptian mill."],
      ],
    },
    { type: "h2", text: "Which words describe the making?" },
    {
      type: "table",
      head: ["Term", "Meaning"],
      rows: [
        ["**Pit oven**", "A cone-shaped earth oven lined with stone and heated with wood, the traditional way to cook agave. It is one reason some mezcal tastes of smoke."],
        ["**Fermentation**", "Natural yeasts turn the sugars in the crushed agave into alcohol, in vessels of wood, stone, clay, masonry or steel."],
        ["**Distillation**", "Heating the fermented mash and capturing the vapor as spirit. Traditional production distills twice."],
        ["**Ordinario**", "The first, weaker spirit from the first distillation, which goes back into the still for the second run."],
        ["**Heads and tails**", "The first and last parts of the second run, which the maker cuts away to keep the middle."],
      ],
    },
    { type: "h2", text: "Which words appear on the label?" },
    {
      type: "table",
      head: ["Term", "Meaning"],
      rows: [
        ["**Mezcal**", "A certified agave spirit made inside Mexico's Denomination of Origin. The broadest category, which allows more modern equipment."],
        ["**Mezcal artesanal**", "Made in pits or raised stone basins, crushed with mauls, a tahona, mills or a shredder, and distilled over direct fire in copper or clay stills."],
        ["**Mezcal ancestral**", "The most traditional category: stone pits only, and distillation in a clay pot over direct fire."],
        ["**Destilado de agave**", "An agave spirit made outside the rules or without certification. It cannot say mezcal, even when it is made with great care."],
        ["**DOM (Denomination of Origin)**", "The legal area and rule book that define where mezcal can be made and how."],
        ["**Joven**", "Young and unaged, bottled soon after distillation."],
        ["**Reposado**", "Rested in wood for at least two months and less than a year."],
        ["**Añejo**", "Aged more than a year in wood, in containers under 1,000 liters."],
        ["**Madurado en vidrio**", "Rested in glass for at least a year, with no wood."],
        ["**Abocado**", "Flavored after distillation, with ingredients such as fruit, herbs or spices."],
        ["**Ensamble**", "Mezcal made from more than one agave. Check whether they were made together or blended afterward."],
        ["**ABV**", "Alcohol by volume, the strength of the spirit."],
      ],
    },
    { type: "h2", text: "Which words describe the taste?" },
    {
      type: "p",
      text: "These are the words on the deck's flavor guide card. Every agave card uses three of them in the same order: smoke, agave and fermentation.",
    },
    {
      type: "table",
      head: ["Step", "The words"],
      rows: [
        ["**Smoke**", "**Clean:** minimal smoke or ash. **Toasty:** warm roast and browned notes. **Smoky:** clear campfire, char and ash."],
        ["**Agave**", "**Green:** vegetal, aloe, cucumber. **Roasted:** baked agave, caramel, nutty roast. **Floral:** blossoms and perfume. **Herbal:** mint, anise, chaparral, botanical. **Mineral:** chalky, saline, stone, clay."],
        ["**Fermentation**", "**Fruity:** citrus, tropical, orchard fruit. **Funky:** overripe, cheesy, barnyard, wildness. **Lactic:** yogurt, cream, buttery tang. **Savory:** umami, olive, brine, stock. **Spicy:** pepper, chile, warming spice."],
      ],
    },
    {
      type: "p",
      text: "Use them as a compass, then trust your palate. Every card in the Discovery Deck (our own, so weigh that accordingly) carries the compass, and our [directory](/directory) shows the agaves behind it. Sources for the production words: this [study of mezcal production](https://www.frontiersin.org/articles/10.3389/fsufs.2022.832532/full).",
    },
  ],
  faq: [
    {
      q: "What is the difference between mezcal, artesanal and ancestral?",
      a: "Mezcal is the broadest category and allows more modern equipment. Artesanal uses pits or raised stone basins and copper or clay stills. Ancestral is the most traditional, with stone pits only and a clay distilling pot.",
    },
    {
      q: "What does destilado de agave mean?",
      a: "It means agave spirit. It is used for spirits made outside the mezcal rules or without certification, which cannot be labeled mezcal.",
    },
    {
      q: "What does joven mean on a mezcal label?",
      a: "Joven means young. It is unaged mezcal, bottled soon after distillation.",
    },
  ],
  reviewNotes: [
    "Sources used: a study of mezcal production in Mexico (Frontiers in Sustainable Food Systems, 2022) for the categories (mezcal, artesanal, ancestral), pit ovens, native yeasts, two-step distillation and cutting heads and tails; a general mezcal styles guide for joven, reposado, añejo, madurado en vidrio, abocado and ensamble; a general jimador overview for coa and piña; a mezcal guide for the tahona. Please check each against the Sources page or the NOM-070 text itself.",
    "Less certain: 'Palenque', 'Ordinario' and 'Piña' are general knowledge and not defined in our sources. 'Maestro mezcalero' is a plain description. 'A pit oven is one reason some mezcal tastes of smoke' is general knowledge too.",
    "Aging and the categories were checked 31 Oct 2026 against the official English translation of NOM-070-SCFI-2016 hosted by COMERCAM: reposado is 2 to 12 months in wood, añejo is more than 12 months in wood in containers under 1,000 liters, and madurado en vidrio is more than 12 months in glass (sections 4.5 and 4.4.2 to 4.4.3). The standard says wood, not oak. Spanish prevails in disputes.",
    "Ensamble definitions differ. One source says it is made from two or more species processed together. Others say it is a blend of finished spirits. The article tells readers to check.",
    "The compass definitions are the deck's flavor guide card wording.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
