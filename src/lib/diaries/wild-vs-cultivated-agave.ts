import type { DiaryEntry } from "./types";

export const wildVsCultivatedAgave: DiaryEntry = {
  slug: "wild-vs-cultivated-agave",
  title: "Wild vs Cultivated Agave: Flavor and Price",
  description:
    "Wild vs cultivated agave: what each means for mezcal flavor, price and supply, with real examples from our 40 agaves.",
  category: "Agave",
  answer:
    "Cultivated agave is planted in fields and harvested in quantity, like espadín, which made up about 85% of certified mezcal in 2025. Wild and semi wild agaves grow on hillsides, take longer and are harvested by hand, which is why they are scarcer, often cost more and can taste more varied.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-hero-2026-10-20-1200.jpg",
    alt: "The Mezcalómano Discovery Deck box beside four agave cards laid out in a row on a wood table.",
    width: 1200,
    height: 504,
  },
  body: [
    { type: "h2", text: "What is the difference between wild and cultivated agave?" },
    {
      type: "p",
      text: "A cultivated agave is planted and farmed. Espadín is the main example: our directory calls it the main cultivated mezcal agave, very widely planted, and [COMERCAM, the council that certifies mezcal](https://comercam-dom.org.mx/wp-content/uploads/2026/05/INFORME-2026_VERSION-PUBLICA.pdf), reports that it made up 84.53% of certified mezcal production in 2025.",
    },
    {
      type: "p",
      text: "A wild agave grows on its own, often on steep, rocky ground, and is harvested from the hills. Semi wild, or semi managed, sits in between. In practice that usually means a plant of wild origin that people tend or replant in semi-wild conditions, such as on a hillside they look after.",
    },
    {
      type: "p",
      text: "Across our 40 agaves, the directory's mezcal-use notes call 15 wild, feral or semi wild, and describe 6 as cultivated or as plantation crops (Mexicano is described both ways). The other 20 do not say either way.",
    },
    {
      type: "table",
      head: ["Agave", "What our directory says"],
      rows: [
        ["[Espadín](/directory/espadin)", "Main cultivated mezcal agave, very widely planted"],
        ["[Manso Sahuayo](/directory/manso_sahuayo)", "Cultivated mezcal crop"],
        ["[Mexicano](/directory/mexicano)", "Wild and semi cultivated"],
        ["[Tobalá](/directory/tobala)", "High value, wild and semi managed"],
        ["[Tepextate](/directory/tepextate)", "Long maturing and wild"],
        ["[Papalote](/directory/papalote)", "Flagship wild mezcal agave of Guerrero and Michoacán"],
        ["[Jabalí](/directory/jabali)", "Wild harvested, and notoriously difficult"],
      ],
    },
    { type: "h2", text: "Does wild agave taste different?" },
    {
      type: "p",
      text: "Often, but not by rule. The clearest pattern in our own data is on the fermentation word of the compass. Among the 15 agaves our directory calls wild, five have funky or lactic on their cards (Jabalí, Tepemete, Chuparrosa, Chahuiqui and Espadilla). None of the six cultivated ones do: they read fruity, savory or spicy. Funky means overripe, cheesy, barnyard and wildness, and lactic means yogurt, cream and buttery tang.",
    },
    {
      type: "p",
      text: "Wild is not automatically better, and cultivated is not automatically simple. Espadín, the cultivated workhorse, reads toasty, roasted and fruity, and plenty of drinkers love it. It also has wild kin: [Tepemete](/directory/tepemete) is described as a wild form of Agave angustifolia, the same species as espadín, and it reads toasty, fruity and funky. It is a small sample, and every bottle varies by region and maker, so use it as a compass, not a promise.",
    },
    { type: "h2", text: "Why does wild mezcal cost more?" },
    {
      type: "list",
      items: [
        "**Time.** Wild agaves can take decades to mature. Our deck notes that tepextate needs up to twenty five years, and public radio reporting on mezcal cites roughly 20 to 30 years for wild plants.",
        "**Supply.** You cannot quickly plant more of a plant that takes that long, so supply cannot rise fast to meet demand.",
        "**Hard work.** Several of our wild agaves grow in remote or rocky places, and some are difficult plants. [Chahuiqui](/directory/chahuiqui) is wild harvested sparingly because of its remote habitat, and Jabalí is described as notoriously difficult because of its saponins.",
      ],
    },
    { type: "h2", text: "Is wild agave more sustainable?" },
    {
      type: "p",
      text: "Not automatically. It is a trade-off. Wild harvesting can strip hillsides if plants are cut faster than they regrow, and a [public radio report](https://www.kaxe.org/2024-02-04/mexicos-wild-agave-plants-are-disappearing-will-mezcal-follow) described eight wild mezcal agaves as disappearing and a \"gold rush\" in some parts of Oaxaca, with producers banking seeds and some reserves limiting how many plants are cut so that others can flower.",
    },
    {
      type: "p",
      text: "Cultivation can meet demand, but when most mezcal comes from one plant, that plant carries a lot of pressure, and the variety that makes mezcal interesting is at risk. That is the reason our deck exists: to help people try the other agaves, and ask about the plant behind the bottle.",
    },
    { type: "h2", text: "What should you ask the bartender?" },
    {
      type: "list",
      items: [
        "Which agave is this, and is it wild, semi wild or cultivated?",
        "Where did it grow?",
        "How would you describe it in smoke, agave and fermentation terms?",
      ],
    },
    {
      type: "p",
      text: "Our [directory](/directory) notes this for each of the 40 agaves, and the Discovery Deck, our own deck of 56 cards, puts each plant and its compass in your hand.",
    },
  ],
  faq: [
    {
      q: "Is espadín a wild agave?",
      a: "Mostly no. Espadín is the main cultivated mezcal agave, very widely planted. Some wild forms of the same species exist, such as Tepemete, which our directory describes as a wild form of Agave angustifolia.",
    },
    {
      q: "What does semi wild agave mean?",
      a: "Usually a plant of wild origin that people tend or replant in semi-wild conditions, rather than farming it in rows. The term can be used loosely, so ask the maker how they do it.",
    },
    {
      q: "Why is wild agave mezcal more expensive?",
      a: "Wild agaves can take decades to mature, grow in rocky or remote places and are harvested by hand, so there is less of it and it takes more work.",
    },
  ],
  reviewNotes: [
    "Counts (15 wild, 6 cultivated, 20 unspecified) come from keyword matching on the mezcal_use column of the Website CSV (wild or feral; cultivated, plantation, planted or crop). Mexicano is in both groups. Please sanity check the wording against the 40 species pages before publishing.",
    "The funky and lactic pattern (5 of 15 wild have them, 0 of 6 cultivated) is from our Cards CSV. It is a small sample, flagged as such in the text.",
    "'Semi wild usually means a plant of wild origin that people tend or replant' is my plain-language reading, supported loosely by the reporting that producers are building seed banks to grow plants in semi-wild conditions and by a species guide noting projects to semi-cultivate wild varieties. It is not an official definition. Check it with a maker if you can.",
    "Outside sources: COMERCAM, Informe Estadístico 2026 (84.53%); public radio piece (https://www.kaxe.org/2024-02-04/mexicos-wild-agave-plants-are-disappearing-will-mezcal-follow) for the 20 to 30 years, eight species disappearing and the seed banks and reserves. The 700% demand rise in that piece is not used here, as I could not verify it against COMERCAM.",
    "The Tepemete link to espadín uses our directory text (wild form of angustifolia). I did not verify botanical details beyond that.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
