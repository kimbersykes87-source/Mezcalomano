import type { DiaryEntry } from "./types";

export const isMezcalSmoky: DiaryEntry = {
  slug: "is-mezcal-smoky",
  title: "Does All Mezcal Taste Smoky?",
  description:
    "Is mezcal smoky? Not always. Learn where smoke comes from, which agaves are clean, toasty or smoky, and how to find a low-smoke mezcal.",
  category: "Flavor",
  answer:
    "No. Smoke in mezcal ranges from almost none to a clear campfire, and in our deck 20 agaves are marked clean on smoke, 17 toasty and only 2 smoky. Smoke mostly comes from how the agave is cooked, so it depends on the maker and the method as well as the plant.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-hero-2026-10-20-1200.jpg",
    alt: "The Mezcalómano Discovery Deck box beside four agave cards laid out in a row on a wood table.",
    width: 1200,
    height: 504,
  },
  body: [
    { type: "h2", text: "Why do some mezcals taste smoky?" },
    {
      type: "p",
      text: "Traditional mezcal is cooked in an earth pit. One account from Oaxaca [describes a pit lined with river and volcanic stones](https://oaxacaculture.com/2026/03/earth-fire-smoke-roasting-agave-pinas-to-make-mezcal/), fired with charcoal, filled with about 100 agave hearts (piñas) and covered with earth for five days. A long roast over fire in a pit is the usual reason mezcal has a smoky reputation.",
    },
    {
      type: "p",
      text: "But not all mezcal is cooked the same way, and not all agaves carry smoke the same way. That is why the answer to \"is mezcal smoky?\" is \"it depends\", and why we put smoke first on every card.",
    },
    { type: "h2", text: "How does our flavor compass describe smoke?" },
    {
      type: "p",
      text: "Every agave card has a three-word compass: smoke, agave, fermentation. The first word has three levels.",
    },
    {
      type: "table",
      head: ["Level", "What it means"],
      rows: [
        ["Clean", "Minimal smoke or ash. Example: [Madrecuixe](/directory/madrecuixe)."],
        ["Toasty", "Warm roast and browned notes. Example: [Espadín](/directory/espadin)."],
        ["Smoky", "Clear campfire, char and ash. Example: [Lyobaa Coyote](/directory/lyobaa_coyote)."],
      ],
    },
    { type: "h2", text: "Which agaves are clean, and which are smoky?" },
    {
      type: "p",
      text: "Count the cards and you find 20 clean, 17 toasty and 2 smoky. A few examples from the deck:",
    },
    {
      type: "list",
      items: [
        "**Clean:** [Madrecuixe](/directory/madrecuixe) (clean, mineral, fruity), [Papalote](/directory/papalote) (clean, herbal, fruity), [Alto](/directory/alto) (clean, herbal, fruity), [Cenizo](/directory/cenizo) (clean, mineral, lactic) and [Verde](/directory/verde) (clean, green, spicy).",
        "**Toasty:** [Espadín](/directory/espadin) (toasty, roasted, fruity), [Tobalá](/directory/tobala) (toasty, floral, fruity) and [Sierra Negra](/directory/sierra_negra) (toasty, mineral, spicy).",
        "**Smoky:** [Lyobaa Coyote](/directory/lyobaa_coyote) (smoky, herbal, funky) and [Henequén](/directory/henequen) (smoky, mineral, spicy).",
      ],
    },
    {
      type: "p",
      text: "Remember that espadín, the agave behind about 85% of mezcal (84.53% of certified production in 2025, according to [COMERCAM](https://comercam-dom.org.mx/wp-content/uploads/2026/05/INFORME-2026_VERSION-PUBLICA.pdf)), sits in the middle: toasty rather than smoky. That is a good reason to stop worrying that every mezcal will taste like a campfire.",
    },
    { type: "h2", text: "Why can the same agave taste different?" },
    {
      type: "p",
      text: "Region, soil, how the agave is cooked and who makes it all change what ends up in the glass. The compass on a card is a starting point, and our taxonomy notes card says it plainly: no two bottles taste exactly alike, even from the same agave name.",
    },
    { type: "h2", text: "How do you find a mezcal with less smoke?" },
    {
      type: "list",
      items: [
        "Order by agave and look for \"clean\" or \"toasty\" in the compass.",
        "Ask the bartender how smoky it is on a scale of one to three.",
        "Ask for a half pour or a taste before you commit.",
        "Check the production style on the label: ancestral and artesanal mezcal are cooked in ways that can include pit ovens, while industrial mezcal can use other methods.",
        "Taste with fruit or herbs in mind. Clean mezcals with fruity or herbal compass words tend to feel lifted rather than heavy.",
      ],
    },
    {
      type: "p",
      text: "Smoke is a matter of style, not quality. Some people love a campfire in the glass and some prefer none, and the compass is there so you can find your own. Every card in the Discovery Deck (ours) carries it, and our [directory](/directory) has all 40 agaves.",
    },
  ],
  faq: [
    {
      q: "Why is mezcal smoky?",
      a: "Traditional mezcal is cooked in earth pits with fire, and that long roast is the usual source of smoky notes. How smoky a bottle is depends on the agave, the method and the maker.",
    },
    {
      q: "Is there mezcal with no smoke at all?",
      a: "There are mezcals with minimal smoke or ash. On our cards, 20 agaves are marked clean on smoke, and many drinkers find those the easiest place to start.",
    },
    {
      q: "Does more smoke mean better mezcal?",
      a: "No. Smoke is a style, not a measure of quality. Which level you prefer is a matter of taste.",
    },
  ],
  reviewNotes: [
    "The counts (20 clean, 17 toasty, 2 smoky) come from the smoke word of every compass in Species_Final Cards. One agave, Churique, has 'funky' in its smoke slot in the CSV, which looks like a data slip. Please check and fix the sheet, and tell me if the counts change.",
    "Compass examples come straight from the Cards CSV. Definitions of clean, toasty and smoky are from the deck's flavor guide card.",
    "From outside our data: the pit-roast description (an Oaxaca culture article) and the idea that pit roasting is 'the usual reason' for smoky reputation. The article does not state what sets the smoke level, so the 'it depends on the maker and method' line is general knowledge. Please verify with a producer if you can.",
    "'Clean mezcals with fruity or herbal compass words tend to feel lifted rather than heavy' is my inference, not a sourced fact. Keep or cut.",
    "The label tip (ancestral and artesanal can include pit ovens, industrial can use other methods) comes from a WSET Level 2 study guide summary of NOM-070 (third party). Please verify against the standard.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
