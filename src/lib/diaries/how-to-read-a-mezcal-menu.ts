import type { DiaryEntry } from "./types";

export const howToReadAMezcalMenu: DiaryEntry = {
  slug: "how-to-read-a-mezcal-menu",
  title: "How to Read a Mezcal Menu: A Bar Decoder",
  description:
    "How to read a mezcal menu: decode the agave, the label words and our three-word flavor compass so you can order with confidence at any bar.",
  category: "Menu decoder",
  answer:
    "To read a mezcal menu, find three things: the agave (the plant), the label words (mezcal or destilado de agave, plus style terms like artesanal or ancestral) and where it was made. Then use a three-word flavor compass, smoke, agave and fermentation, to guess what is in the glass before you order.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-hero-2026-10-20-1200.jpg",
    alt: "The Mezcalómano Discovery Deck box beside four agave cards laid out in a row on a wood table.",
    width: 1200,
    height: 504,
  },
  body: [
    { type: "h2", text: "What is on a mezcal menu line?" },
    {
      type: "p",
      text: "A single line packs in a lot. Here is an invented example, to show the parts: **Tobalá, Oaxaca, ancestral, 47%, 2 oz**.",
    },
    {
      type: "table",
      head: ["Part of the line", "What it tells you"],
      rows: [
        ["Tobalá", "The agave. Different plants make different flavors, so this is the most useful word on the line."],
        ["Oaxaca", "Where it was made. Our [map](/map) shows which agaves grow in which states."],
        ["Ancestral", "A style of production. More on the label words below."],
        ["47%", "Strength. Higher numbers tend to taste bigger and warmer."],
        ["2 oz", "The pour size. Ask for a half pour if you want to compare two."],
      ],
    },
    { type: "h2", text: "What do the label words mean?" },
    {
      type: "list",
      items: [
        "**Mezcal.** A spirit made inside Mexico's Denomination of Origin, the legal area and rule book for mezcal, and certified. Certified bottles often show a producer code and a batch or lot number.",
        "**Destilado de agave, or agave spirit.** Made outside that area, or without certification. It can be made with just as much tradition and care, but it can't say mezcal on the label.",
        "**Artesanal and ancestral.** Terms for hand-made production. Ancestral is the most traditional of the two, with distillation in clay pots.",
        "**Joven, reposado, añejo.** Joven is unaged and the most common. Reposado and añejo have rested in wood.",
      ],
    },
    { type: "h2", text: "How do you read the flavor compass?" },
    {
      type: "p",
      text: "Every agave card in the Discovery Deck carries a three-word compass, always in the same order: smoke, agave, fermentation. Pick one word from each row and you have a quick picture of a mezcal.",
    },
    {
      type: "table",
      head: ["Step", "The choices"],
      rows: [
        ["Smoke", "**Clean:** little or no smoke or ash. **Toasty:** warm roast and browned notes. **Smoky:** campfire, char and ash."],
        ["Agave", "**Green:** vegetal, aloe, cucumber. **Roasted:** baked agave, caramel, nutty roast. **Floral:** blossoms and perfume. **Herbal:** mint, anise, botanical. **Mineral:** chalky, salty, stone and clay."],
        ["Fermentation", "**Fruity:** citrus, tropical, orchard fruit. **Funky:** overripe, cheesy, barnyard, wild. **Lactic:** yogurt, cream, buttery tang. **Savory:** umami, olive, brine. **Spicy:** pepper, chile, warming spice."],
      ],
    },
    {
      type: "p",
      text: "Read it left to right. \"Clean, mineral, fruity\" means little smoke, a chalky and stony core, and fruit on top.",
    },
    { type: "h2", text: "What do common menu names taste like?" },
    {
      type: "p",
      text: "Here are eight names you are likely to meet, with their compass from our cards.",
    },
    {
      type: "table",
      head: ["On the menu", "Compass", "In the glass, roughly"],
      rows: [
        ["[Espadín](/directory/espadin)", "Toasty, roasted, fruity", "Warm roast, baked agave and fruit. The friendly all-rounder."],
        ["[Tobalá](/directory/tobala)", "Toasty, floral, fruity", "Warm roast with blossoms and fruit."],
        ["[Tepextate](/directory/tepextate)", "Toasty, herbal, spicy", "Warm roast with herbs and a peppery lift."],
        ["[Madrecuixe](/directory/madrecuixe)", "Clean, mineral, fruity", "Little smoke, chalky and stony, with fruit."],
        ["[Arroqueño](/directory/arroqueno)", "Toasty, mineral, fruity", "Warm roast, stony, with fruit."],
        ["[Cenizo](/directory/cenizo)", "Clean, mineral, lactic", "Little smoke, stony, with a creamy tang."],
        ["[Jabalí](/directory/jabali)", "Toasty, herbal, funky", "Roast and herbs with a wild, overripe edge."],
        ["[Lyobaa Coyote](/directory/lyobaa_coyote)", "Smoky, herbal, funky", "Campfire and char with herbs and wildness."],
      ],
    },
    {
      type: "p",
      text: "Treat this as a compass, not a promise. Region, soil and maker change a bottle, so no two taste exactly alike, even from the same agave name. All 40 are in our [directory](/directory).",
    },
    { type: "h2", text: "Why doesn't the menu name match the plant?" },
    {
      type: "p",
      text: "The name on a menu might be a species name, a local name or both, and they don't always match one to one. In our deck, five different menu names (Cuishe, Barril, Madrecuixe, Bicuixe and Tobaziche) all sit under one species, Agave karwinskii. Botanists still debate where one species ends and another begins, which is why the same word can mean slightly different things in different places.",
    },
    { type: "h2", text: "What should you ask the bartender?" },
    {
      type: "list",
      items: [
        "Which agave is this, and is it wild or cultivated?",
        "Is it certified mezcal, or destilado de agave?",
        "Where was it made, and by whom?",
        "How smoky is it? Is it more roasty, or more fruity?",
        "Can I try a taste or a half pour before I commit?",
      ],
    },
    { type: "h2", text: "How do you pick something you'll like?" },
    {
      type: "list",
      items: [
        "**Not keen on smoke?** Look for \"clean\" in the first word, like Madrecuixe or Cenizo.",
        "**Love a campfire?** Look for \"smoky\", like Lyobaa Coyote.",
        "**Like fruit?** Try Tobalá, Madrecuixe or Arroqueño.",
        "**Curious about wild and funky?** Try Jabalí.",
        "**Not sure?** Start with an espadín as your baseline, then change one thing at a time: less smoke, more fruit, more herbs.",
      ],
    },
    {
      type: "p",
      text: "Want the whole vocabulary in your pocket? Every card in the Discovery Deck carries this compass, and a flavor guide card explains each word. Pull one when you pour.",
    },
  ],
  faq: [
    {
      q: "How do you order mezcal if you know nothing about it?",
      a: "Tell the bartender what you usually like: smoky or not, fruity or herbal. Ask which agave fits, and start with an espadín as your baseline.",
    },
    {
      q: "What is the difference between mezcal and destilado de agave on a menu?",
      a: "Mezcal is made inside Mexico's Denomination of Origin and certified. Destilado de agave is made outside it, or without certification, and can't use the word mezcal. Quality can be just as high.",
    },
    {
      q: "Why do two bottles of the same agave taste different?",
      a: "Region, soil and the maker all shape the spirit, and agave names are not always exact. Treat the agave as a guide, not a guarantee.",
    },
  ],
  reviewNotes: [
    "The flavor compass words and the eight compass lines come straight from the deck's flavor guide card and Species_Final cards data. Please check they match the printed cards.",
    "The 'What do the label words mean' list is written from the Introduction card plus general knowledge (artesanal, ancestral, joven, reposado, añejo). Check each against the Sources page and your own experience before publishing.",
    "The menu line (Tobalá, Oaxaca, ancestral, 47%, 2 oz) is invented for illustration and the article says so.",
    "Ask a bartender friend to read the 'What should you ask' list and say whether they would answer those questions happily.",
    "Swap the hero photo for something at a bar, with a menu in shot if you can.",
    "Idea for later: a one-page printable pocket decoder (PDF) with the compass table, linked from the article and from the deck's QR page.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
