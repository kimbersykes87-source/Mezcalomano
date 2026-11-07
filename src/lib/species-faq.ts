import faqData from "../../data/species-faq.json";

export type SpeciesFaq = { q: string; a: string };

type Row = { slug: string; question: string; answer: string; approved?: boolean | string };

/**
 * FAQ rows exported from the Species_Final FAQ tab into data/species-faq.json.
 * Only rows Siona has approved ("approved (Si)" filled) are used. Text lives in the sheet, not in code.
 */
export function faqForSlug(slug: string): SpeciesFaq[] {
  return (faqData as Row[])
    .filter((r) => r.slug === slug && r.approved && r.question?.trim() && r.answer?.trim())
    .map((r) => ({ q: r.question.trim(), a: r.answer.trim() }));
}
