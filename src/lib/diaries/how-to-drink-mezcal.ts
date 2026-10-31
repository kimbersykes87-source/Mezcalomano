import type { DiaryEntry } from "./types";

export const howToDrinkMezcal: DiaryEntry = {
  slug: "how-to-drink-mezcal",
  title: "How to Drink Mezcal: Sip, Don't Shoot",
  description:
    "How to drink mezcal: sip it neat from a small cup, smell first, keep water close, and try it with orange and sal de gusano. A simple guide for beginners.",
  category: "Basics",
  answer:
    "Drink mezcal neat, in small pours, at room temperature, and sip it slowly from a small cup. Smell it first, take a small sip, wait, and keep a glass of water close by.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-hero-2026-10-20-1200.jpg",
    alt: "The Mezcalómano Discovery Deck box beside four agave cards laid out in a row on a wood table.",
    width: 1200,
    height: 504,
  },
  body: [
    { type: "h2", text: "What is the best way to drink mezcal?" },
    {
      type: "p",
      text: "Neat, slowly, and in a small pour. Mezcal is made to be sipped, the way you would sip a good whiskey or a good tequila. No ice is needed, and it is usually best at room temperature, because cold mutes the aroma, which is half of the experience.",
    },
    {
      type: "p",
      text: "You do not need to shoot it, and you do not need to rush. Shooting is the fastest way to miss everything the agave has to say.",
    },
    { type: "h2", text: "What do you drink mezcal from?" },
    {
      type: "p",
      text: "A **copita** is the traditional small cup: wide, shallow and made of clay or glass. Its shape lets the aroma gather so you can smell the spirit before you sip. In Oaxaca you will also see the **jícara**, a cup made from a dried gourd. If you do not have either, a small, wide glass works well, and a tall, narrow shot glass does not.",
    },
    { type: "h2", text: "How do you taste mezcal, step by step?" },
    {
      type: "list",
      items: [
        "**Pour small.** An ounce or less is plenty. You can always have another.",
        "**Look.** Notice the color and how it moves in the cup.",
        "**Smell.** Bring the cup toward your nose gently, rather than pushing in, so the alcohol does not overwhelm the aroma.",
        "**Sip small.** Let it sit on your tongue for a moment before you swallow.",
        "**Wait.** Notice what lingers. Smoke, fruit or minerals often show up after you swallow.",
        "**Drink water.** A glass of water on the side cleans your palate between sips.",
      ],
    },
    { type: "h2", text: "What about orange and sal de gusano?" },
    {
      type: "p",
      text: "This is the traditional way to serve mezcal in Oaxaca: slices of orange sprinkled with sal de gusano, a salt made from dried, ground agave larvae and chile. You alternate between a sip and a bite of the fruit. It refreshes your palate, and it plays against the spirit's smoke and fruit.",
    },
    { type: "h2", text: "What goes well with which mezcal?" },
    {
      type: "p",
      text: "Use the three-word flavor compass on our cards (smoke, agave, fermentation) as a guide. These are our suggestions, not rules, so treat them as a starting point and trust your palate.",
    },
    {
      type: "table",
      head: ["The compass says", "Try alongside"],
      rows: [
        ["Clean and fruity, like [Madrecuixe](/directory/madrecuixe)", "A slice of fresh orange or other citrus."],
        ["Toasty and roasted, like [Espadín](/directory/espadin)", "Something toasted or lightly sweet, like nuts."],
        ["Smoky and herbal, like [Lyobaa Coyote](/directory/lyobaa_coyote)", "Something salty or savory."],
      ],
    },
    { type: "h2", text: "Can you mix mezcal?" },
    {
      type: "p",
      text: "Yes, and many people do. A good rule is to taste a mezcal neat first, so you know what the agave is doing before anything else joins it. Our [directory](/directory) shows what each of the 40 agaves tastes like, and the Discovery Deck (ours) turns it into a game for the table.",
    },
  ],
  faq: [
    {
      q: "Should you drink mezcal cold or at room temperature?",
      a: "Room temperature is best for sipping. Cold dulls the aroma. Ice is fine in a cocktail, but a neat pour is where the agave shows.",
    },
    {
      q: "Do you drink mezcal with salt and orange?",
      a: "Traditionally, yes. In Oaxaca it is often served with orange slices and sal de gusano, a salt made with ground agave larvae and chile. You alternate sips and bites.",
    },
    {
      q: "How much mezcal should you pour for tasting?",
      a: "An ounce or less is plenty. Small pours let you taste several agaves in one evening without overdoing it.",
    },
  ],
  reviewNotes: [
    "Sources: general tradition and practice (copitas, jícaras, orange with sal de gusano, sipping neat) cross-checked against Cocktail Society on sal de gusano (https://cocktail-society.com/barkeeping/sal-de-gusano/) and several how-to-drink guides. Most of this is common practice, not law, so please sanity check it against your own experience.",
    "The pairing table is our suggestion built on the flavor compass. It is inference, not fact. Please taste before publishing and change any you disagree with.",
    "The line that cold dulls aroma, and the 'ounce or less' pour, are general guidance. Please confirm you are comfortable with them.",
    "We are agave first, so this article names no brands and should not.",
    "Swap the hero photo for a copita or a jícara with a poured mezcal and an orange slice if you can shoot one.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
