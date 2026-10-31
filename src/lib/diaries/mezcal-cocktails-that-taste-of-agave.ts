import type { DiaryEntry } from "./types";

export const mezcalCocktailsThatTasteOfAgave: DiaryEntry = {
  slug: "mezcal-cocktails-that-taste-of-agave",
  title: "Mezcal Cocktails That Still Taste of the Agave",
  description:
    "Four simple mezcal cocktails with measures, matched to an agave and its flavor compass, so the plant stays in the glass.",
  category: "Drinks",
  answer:
    "A mezcal cocktail keeps the agave in the glass when you pick the mezcal to suit the drink and keep the mixers fresh and light. Here are four simple recipes, each paired with an agave by its flavor compass.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-4-agave.jpg",
    alt: "Rows of agave growing on a hillside in the Oaxacan highlands.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "What makes a mezcal cocktail taste of the agave?" },
    {
      type: "p",
      text: "Three things: a mezcal chosen for the drink, fresh citrus, and not too much sweetener. Our flavor compass reads smoke, agave, fermentation, so you can match a mezcal to the drink by those words instead of guessing.",
    },
    { type: "h2", text: "Which agave suits which drink?" },
    {
      type: "table",
      head: ["Drink", "Look for"],
      rows: [
        ["Simple Margarita", "Clean, herbal, fruity: [Papalote](/directory/papalote) or [Alto](/directory/alto)"],
        ["Paloma", "Clean, green, spicy: [Salmiana](/directory/salmiana) or [Verde](/directory/verde)"],
        ["Old Fashioned", "Toasty, roasted, fruity: [Espadín](/directory/espadin), or toasty, mineral, fruity: [Arroqueño](/directory/arroqueno)"],
        ["Mezcal and Soda", "Clean, mineral, fruity: [Madrecuixe](/directory/madrecuixe)"],
      ],
    },
    {
      type: "p",
      text: "These are starting points, not rules. Region, soil and the maker change every bottle, so taste first and adjust.",
    },
    { type: "h2", text: "What are four simple recipes?" },
    {
      type: "list",
      items: [
        "**Simple Margarita.** 2 oz mezcal, 1 oz fresh lime juice, 1/2 oz agave nectar. Shake with ice, strain over fresh ice, add a pinch of salt on the rim if you like. The clean, herbal, fruity compass lets the lime and the agave sing together.",
        "**Paloma.** 2 oz mezcal, 1/2 oz fresh lime juice, a pinch of salt. Build over ice, top with about 3 oz grapefruit soda (or fresh grapefruit juice and soda water), stir gently and add a grapefruit wedge. The green, spicy compass suits the bitter citrus.",
        "**Old Fashioned.** 2 oz mezcal, 1 teaspoon agave nectar, 2 dashes aromatic bitters. Stir with ice for 20 to 30 seconds, strain over one large cube and twist an orange peel over the top. A toasty agave brings warmth without needing much else.",
        "**Mezcal and Soda.** 1 1/2 oz mezcal, 4 oz chilled soda water, a squeeze of lime. Stir once in a tall glass over ice. It is the simplest way to taste the agave and the compass at work.",
      ],
    },
    { type: "h2", text: "How do you keep smoke in balance?" },
    {
      type: "list",
      items: [
        "Use clean agaves for bright, citrus-led drinks, and toasty ones for stirred drinks.",
        "Save a smoky agave such as [Lyobaa Coyote](/directory/lyobaa_coyote) or [Henequén](/directory/henequen) for people who ask for it, and keep the measure small.",
        "Go easy on sweetener. Start with less and add a little at a time.",
        "Use fresh citrus, not bottled, and keep the ice clean and cold.",
        "Taste the mezcal on its own first. If you like it neat, you will like it in the drink.",
      ],
    },
    {
      type: "p",
      text: "Not sure which agave to pick? Every card in the Discovery Deck (ours) carries a flavor compass, and our [directory](/directory) shows where each of the 40 agaves grows.",
    },
  ],
  faq: [
    {
      q: "What is the best mezcal for cocktails?",
      a: "It depends on the drink. Clean, fruity or herbal mezcals suit bright, citrus-led drinks, and toasty ones suit stirred drinks. Use the flavor compass to match.",
    },
    {
      q: "Can you use any mezcal in a cocktail?",
      a: "Yes, but agave-forward drinks work best with a mezcal you also like neat. A very smoky one can overpower a light drink, so use less of it.",
    },
    {
      q: "How much mezcal goes in a cocktail?",
      a: "Most of the recipes here use 1 1/2 to 2 oz. Start there and adjust to taste.",
    },
  ],
  reviewNotes: [
    "The recipes are standard cocktail templates (margarita-style sour, paloma, old fashioned, highball) written without brands. They have not been tested. Please taste each one and adjust the measures before publishing.",
    "The agave pairings come from the compass lines in the Cards CSV (Papalote, Alto, Salmiana, Verde, Espadín, Arroqueño, Madrecuixe, Lyobaa Coyote, Henequén). The idea of matching clean agaves to citrus drinks is my judgment, not a sourced fact.",
    "Add a responsible drinking line if you want one.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
