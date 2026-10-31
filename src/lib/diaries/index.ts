import type { DiaryEntry } from "./types";
import { giftsForMezcalLovers } from "./gifts-for-mezcal-lovers";
import { giftsForTequilaLovers } from "./gifts-for-tequila-lovers";
import { howToReadAMezcalMenu } from "./how-to-read-a-mezcal-menu";
import { tobalaVsEspadin } from "./tobala-vs-espadin";
import { artesanalVsAncestralMezcal } from "./artesanal-vs-ancestral-mezcal";
import { batsAndAgave } from "./bats-and-agave";
import { howLongDoesAgaveTakeToGrow } from "./how-long-does-agave-take-to-grow";
import { howToDrinkMezcal } from "./how-to-drink-mezcal";
import { howToReadAMezcalLabel } from "./how-to-read-a-mezcal-label";
import { isMezcalSmoky } from "./is-mezcal-smoky";
import { karwinskiiFamilyExplained } from "./karwinskii-family-explained";
import { mezcalCocktailsThatTasteOfAgave } from "./mezcal-cocktails-that-taste-of-agave";
import { mezcalGlossary } from "./mezcal-glossary";
import { mezcalTastingGames } from "./mezcal-tasting-games";
import { mezcalVsTequila } from "./mezcal-vs-tequila";
import { whoMakesMezcal } from "./who-makes-mezcal";
import { wildVsCultivatedAgave } from "./wild-vs-cultivated-agave";
import { wormInMezcal } from "./worm-in-mezcal";

export const DIARIES_NAME = "Mezcal Diaries"; // working title

/** Add new articles to this list, newest first. */
const ALL: DiaryEntry[] = [
  giftsForMezcalLovers,
  tobalaVsEspadin,
  giftsForTequilaLovers,
  howToReadAMezcalMenu,
  artesanalVsAncestralMezcal,
  batsAndAgave,
  howLongDoesAgaveTakeToGrow,
  howToDrinkMezcal,
  howToReadAMezcalLabel,
  isMezcalSmoky,
  karwinskiiFamilyExplained,
  mezcalCocktailsThatTasteOfAgave,
  mezcalGlossary,
  mezcalTastingGames,
  mezcalVsTequila,
  whoMakesMezcal,
  wildVsCultivatedAgave,
  wormInMezcal,
];

export const allDiaries = (): DiaryEntry[] => ALL;
export const publishedDiaries = (): DiaryEntry[] => ALL.filter((e) => e.status === "published");
export const getDiary = (slug: string): DiaryEntry | undefined => ALL.find((e) => e.slug === slug);
/** The menu link and sitemap entries appear only once there is something to read. */
export const hasPublishedDiaries = (): boolean => publishedDiaries().length > 0;
