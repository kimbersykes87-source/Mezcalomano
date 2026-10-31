import type { DiaryEntry } from "./types";
import { giftsForMezcalLovers } from "./gifts-for-mezcal-lovers";

export const DIARIES_NAME = "Mezcal Diaries"; // working title

/** Add new articles to this list, newest first. */
const ALL: DiaryEntry[] = [giftsForMezcalLovers];

export const allDiaries = (): DiaryEntry[] => ALL;
export const publishedDiaries = (): DiaryEntry[] => ALL.filter((e) => e.status === "published");
export const getDiary = (slug: string): DiaryEntry | undefined => ALL.find((e) => e.slug === slug);
/** The menu link and sitemap entries appear only once there is something to read. */
export const hasPublishedDiaries = (): boolean => publishedDiaries().length > 0;
