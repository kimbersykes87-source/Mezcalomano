import type { PostEntry } from "./types";
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
import { whatIsMezcal } from "./what-is-mezcal";
import { typesOfAgave } from "./types-of-agave";
import { whatDoesMezcalTasteLike } from "./what-does-mezcal-taste-like";
import { jovenReposadoAnejoMezcal } from "./joven-reposado-anejo-mezcal";
import { raicillaBacanoraSotol } from "./raicilla-bacanora-sotol";
import { canMezcalBeMadeOutsideMexico } from "./can-mezcal-be-made-outside-mexico";

export const SMALL_POURS_NAME = "Small Pours";

/** Add new articles to this list, newest first. */
const ALL: PostEntry[] = [
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
  whatIsMezcal,
  typesOfAgave,
  whatDoesMezcalTasteLike,
  jovenReposadoAnejoMezcal,
  raicillaBacanoraSotol,
  canMezcalBeMadeOutsideMexico,
];

export const allPosts = (): PostEntry[] => ALL;
/** Shown on the contents page: everything except drafts, so a batch can be walked before sign off. */
export const listedPosts = (): PostEntry[] => ALL.filter((e) => e.status !== "draft");
export const publishedPosts = (): PostEntry[] => ALL.filter((e) => e.status === "published");
export const getPost = (slug: string): PostEntry | undefined => ALL.find((e) => e.slug === slug);
/** The menu link and sitemap entries appear only once there is something to read. */
/**
 * Holds the menu link, sitemap entries and contents page indexing back while the batch is reviewed.
 * Approved posts are live at their own URL; flip this to true once Kimber has signed off the whole batch.
 */
export const LIST_SITE_WIDE = true;
export const hasPublishedPosts = (): boolean => LIST_SITE_WIDE && publishedPosts().length > 0;
