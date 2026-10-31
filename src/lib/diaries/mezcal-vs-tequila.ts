import type { DiaryEntry } from "./types";

export const mezcalVsTequila: DiaryEntry = {
  slug: "mezcal-vs-tequila",
  title: "Mezcal vs Tequila: The Real Differences",
  description:
    "Mezcal vs tequila in two minutes: one plant or many, pit roasting or steam ovens, and why the flavor range is so different. Agave first.",
  category: "Basics",
  answer:
    "Tequila is made from one plant, the blue Weber agave, while mezcal can be made from dozens of agaves, which is why its flavors range so widely. Mezcal is also traditionally cooked in earth pits, and that is where its reputation for smoke comes from, although not every mezcal is smoky.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-tile-2-pit.jpg",
    alt: "A guide explaining the stone roasting pit at a palenque in Oaxaca.",
    width: 1200,
    height: 900,
  },
  body: [
    { type: "h2", text: "What is the main difference between mezcal and tequila?" },
    {
      type: "p",
      text: "Both are spirits distilled from cooked agave, so they are cousins. The difference starts with the plant and carries through to how it is cooked.",
    },
    {
      type: "table",
      head: ["", "Tequila", "Mezcal"],
      rows: [
        ["The plant", "One species: blue Weber agave (mixto tequila may also use other sugars)", "Many agaves. Our deck features 40"],
        ["Where", "Mostly Jalisco", "Made in a legally defined area, with Oaxaca as the heartland"],
        ["Cooking", "Steam baked in masonry ovens or pressure cookers", "Traditionally in earth pits, in some styles in masonry ovens"],
        ["Smoke", "Usually little", "From almost none to a clear campfire"],
      ],
    },
    {
      type: "p",
      text: "The blue Weber agave is Agave tequilana. It has a card in our deck (and a page in our [directory](/directory/weber_azul)) because it is the one plant that sits in both worlds: it is occasionally used in mezcal in certain regions.",
    },
    { type: "h2", text: "Why does mezcal have so many flavors?" },
    {
      type: "p",
      text: "Because there are so many plants. Mezcal can be made from dozens of agaves, from the farmed espadín to wild agaves that take years to mature, and each one brings a different character. Espadín alone is about 85% of the total: it made up 84.53% of certified mezcal production in 2025, according to [COMERCAM, the council that certifies mezcal](https://comercam-dom.org.mx/wp-content/uploads/2026/05/INFORME-2026_VERSION-PUBLICA.pdf). That leaves a great deal of variety in the rest.",
    },
    {
      type: "p",
      text: "Our flavor compass reads smoke, agave, fermentation. Weber Azul reads toasty, floral, fruity. [Madrecuixe](/directory/madrecuixe) reads clean, mineral, fruity. [Lyobaa Coyote](/directory/lyobaa_coyote) reads smoky, herbal, funky. Same family of spirit, very different glasses.",
    },
    { type: "h2", text: "Where does the smoke come from?" },
    {
      type: "p",
      text: "The traditional way to cook mezcal is in an earth pit. One account from Oaxaca [describes a pit lined with river and volcanic stones](https://oaxacaculture.com/2026/03/earth-fire-smoke-roasting-agave-pinas-to-make-mezcal/), fired with charcoal, filled with about 100 agave hearts (piñas) and covered with earth for five days. The long roast with fire in the pit is the usual explanation for the smoky notes.",
    },
    {
      type: "p",
      text: "Mexico's mezcal rules have three categories. Ancestral mezcal is the strictest and uses stone pits only. Artesanal allows pits or raised stone basins. The widest category also allows autoclaves, which are steam pressure cookers. So \"mezcal\" on a label does not guarantee smoke, and the cooking method on the label is worth a look.",
    },
    { type: "h2", text: "Is all mezcal smoky?" },
    {
      type: "p",
      text: "No. In our deck, 21 agaves are marked clean on smoke, 17 toasty and only 2 smoky. Clean means minimal smoke or ash, toasty means warm roast and browned notes, and smoky means clear campfire, char and ash. If you are a tequila drinker wary of smoke, start with a clean one.",
    },
    { type: "h2", text: "Which should you try first?" },
    {
      type: "p",
      text: "If you know tequila, a good first step is a mezcal with a clean or toasty smoke word and fruit or herbs in its compass. Ask for it by agave name, such as [Papalote](/directory/papalote) (clean, herbal, fruity) or [Tobalá](/directory/tobala) (toasty, floral, fruity), and taste it next to a tequila you know. The compass on each card in the Discovery Deck (ours) is meant for exactly that.",
    },
  ],
  faq: [
    {
      q: "Is mezcal a type of tequila?",
      a: "No. Tequila is a specific spirit made from blue Weber agave. Mezcal is a separate spirit that can be made from many agaves. Both start with cooked agave.",
    },
    {
      q: "Are mezcal and tequila made from the same plant?",
      a: "Only by exception. Tequila uses blue Weber agave (100% agave tequila uses nothing else), and mezcal is made from many agaves. Blue Weber is occasionally used in mezcal in certain regions.",
    },
    {
      q: "Which is smokier, mezcal or tequila?",
      a: "Mezcal tends to be smokier because of traditional earth pit roasting, but smoke ranges from almost none to a clear campfire. Many mezcals are not smoky at all.",
    },
  ],
  reviewNotes: [
    "Our directory and card data supplies: Weber Azul (Agave tequilana, Jalisco, occasionally used in mezcal), the compass lines, and the count of 21 clean, 17 toasty, 2 smoky agaves, rechecked 31 Oct 2026 against the live Species_Final sheet (Churique now reads clean, mineral, lactic). The Cards CSV copies are older; re-export them.",
    "Facts from outside our data: tequila is made from blue Weber agave only, and mostly in Jalisco (100% agave tequila uses nothing else; mixto tequila may add other sugars; confirm the wording against NOM-006-SCFI-2012); tequila is steam baked in masonry ovens or autoclaves; Oaxaca as mezcal's heartland. The mezcal category methods (ancestral stone pits only, artesanal pits or raised stone basins, the widest category also allows autoclaves) were checked 31 Oct 2026 against the official English translation of NOM-070-SCFI-2016 hosted by COMERCAM (sections 4.4 to 4.4.3; Spanish prevails). The tequila statements rest on a third-party WSET Level 2 study guide summary and have not been checked against the tequila standard.",
    "'Usually little' smoke for tequila is my general statement, not a sourced one. Keep or soften.",
    "The 'long roast with fire in the pit is the usual explanation' line is general knowledge. The linked account calls the roasted agave sweet and smoky but does not explain smoke levels.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
