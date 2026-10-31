import type { DiaryEntry } from "./types";

export const mezcalTastingGames: DiaryEntry = {
  slug: "mezcal-tasting-games",
  title: "Mezcal Tasting Games for a Dinner Party",
  description:
    "Five easy tasting games for a dinner party, played with agave cards: a blind compass round, nickname guessing, face card roles and more.",
  category: "Tasting nights",
  answer:
    "The easiest mezcal tasting games turn the flavor compass into a score: guests name the smoke, the agave and the fermentation in the glass, then check their guesses against a card. Here are five ideas, with the rules left loose on purpose so you can bend them to your table.",
  status: "draft",
  updated: "2026-10-31",
  image: {
    src: "/assets/photography/about-hero-2026-10-20-1200.jpg",
    alt: "The Mezcalómano Discovery Deck box beside four agave cards laid out in a row on a wood table.",
    width: 1200,
    height: 504,
  },
  body: [
    { type: "h2", text: "What do you need to play?" },
    {
      type: "p",
      text: "A few small pours of mezcal, small cups, water, some snacks and a deck of cards that carries the flavor compass. We use the Discovery Deck (our own, so weigh that accordingly): 40 agave cards with a nickname and a three-word compass in the same order every time, smoke, agave and fermentation, plus 12 face cards for the people who make mezcal, two bat jokers and two reference cards. If you don't have it, any list of agaves and their flavor notes will do.",
    },
    {
      type: "p",
      text: "These are our ideas, not official rules. Change anything you like.",
    },
    { type: "h2", text: "Which tasting games work for a dinner party?" },
    {
      type: "list",
      items: [
        "**Blind compass.** The host pours one mezcal into numbered cups without saying which agave it is. Each guest writes three words from the flavor guide: one for smoke (clean, toasty or smoky), one for agave (green, roasted, floral, herbal or mineral) and one for fermentation (fruity, funky, lactic, savory or spicy). Reveal the agave card, then score a point for each word that matches the card. Remember the card is a compass, not a promise, so give a bonus point for any word the table agrees on.",
        "**Agave of the night.** Deal one agave card to each guest. They read out the nickname, the one-liner and the compass, then say what food or season the agave makes them think of. The table votes on the best story, and the winner picks the next pour.",
        "**Nickname guess.** One person reads only a nickname, such as Hidden Gem or Field Workhorse. Everyone else writes down which agave they think it is, then the reader gives the one-liner as a clue. Score a point for the right agave before the clue, half a point after.",
        "**Face card roles.** Deal the jack, queen and king of any suit to three guests. The jack is the jimador and pours. The queen is the maestra and tastes first, calling out notes. The king is the maestro and keeps time and tops up the water. Swap roles every round.",
        "**Pollen pass.** Shuffle the two bat jokers into the agave cards. When a bat appears, every guest passes their cup one seat to the left, takes a sniff and describes what the last person was drinking. It spreads the notes around the table the way the bats spread pollen.",
      ],
    },
    { type: "h2", text: "Which agaves make good game cards?" },
    {
      type: "p",
      text: "Pick agaves with clearly different compasses, so guests can tell them apart. Here are six from the deck, with the host's answers. Keep this part of the page to yourself.",
    },
    {
      type: "table",
      head: ["Card nickname", "Agave and compass"],
      rows: [
        ["Field Workhorse", "[Espadín](/directory/espadin): toasty, roasted, fruity"],
        ["Hidden Gem", "[Tobalá](/directory/tobala): toasty, floral, fruity"],
        ["Wise Old Wizard", "[Tepextate](/directory/tepextate): toasty, herbal, spicy"],
        ["Delicate Gymnast", "[Madrecuixe](/directory/madrecuixe): clean, mineral, fruity"],
        ["Thorny Titan", "[Sierra Negra](/directory/sierra_negra): toasty, mineral, spicy"],
        ["Ashy Ghost", "[Cenizo](/directory/cenizo): clean, mineral, lactic"],
      ],
    },
    { type: "h2", text: "How do you keep a tasting night fun and safe?" },
    {
      type: "list",
      items: [
        "**Keep pours small,** a few sips per round, and sip rather than shoot.",
        "**Serve water and food** all night, and give everyone a glass of water per pour.",
        "**Make sure everyone has a safe way home,** and make it easy to skip a round.",
        "**Offer a non-alcoholic round.** The compass works on teas, juices and herbs too.",
      ],
    },
    {
      type: "p",
      text: "Want to find agaves to play with? Our [directory](/directory) has all 40, and the [map](/map) shows where each one grows.",
    },
  ],
  faq: [
    {
      q: "How many people can play a mezcal tasting game?",
      a: "Anything from two to a dozen works. For bigger groups, play in teams so each team shares a cup and a score sheet.",
    },
    {
      q: "How much mezcal do you need for a tasting night?",
      a: "Very little. A small pour per round is plenty, and a few different mezcals make the games more interesting than one large bottle.",
    },
    {
      q: "Do you need to know about mezcal to play?",
      a: "No. The flavor guide gives everyone the same words, so beginners and experts can play together.",
    },
  ],
  reviewNotes: [
    "All five games are Claude's ideas, not rules you have tested. Please play-test each one at a real table and fix the rules, scoring and any steps that don't work before publishing.",
    "Deck facts used: 40 agave cards with nickname and compass, 12 face cards, two bat jokers, two reference cards. Compass lines and nicknames for the six agaves come from Species_Final Cards data. Please check them against the printed cards.",
    "The face card roles (jack is the jimador, queen is the maestra, king is the maestro) come from the Cards data. Confirm that is how the printed cards read.",
    "The responsible drinking list is general good practice, not a source. Add anything you would normally say at a tasting.",
    "We are agave first, so this article names no brands and should not.",
    "Siona has final sign-off on customer-facing copy.",
  ],
};
