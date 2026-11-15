// Name prefilter for licence records (plan v3, accuracy). Drops grocery, convenience, gas, pharmacy
// and big box outlets before any crawl, unless the name itself says liquor, wine or spirits.
// Needed mostly in California, where the general off sale licence covers all of them.

const STRONG = /\b(liquor|liquors|wine|wines|spirits|spirit|bottle|cellar|cellars|package|bevmo|bev|vino|vinos|tipple|distill)/i;
const WEAK = /(7[- ]?eleven|circle k|\bam ?pm\b|\bmarket\b|\bmarkets\b|grocery|grocer|supermarket|\bfoods?\b|\bmart\b|\bgas\b|chevron|shell\b|arco\b|valero|76\b|mobil\b|exxon|speedway|pharmacy|cvs|walgreens|rite aid|walmart|target\b|costco|safeway|vons\b|ralphs|smart & final|dollar|food 4 less|albertsons|kroger|heb\b|trader joe|whole foods|sprouts|liquid(ation)?\b|convenience|mini ?mart|stop (&|and) shop|truck stop|travel center|donut|pizza|taqueria|laundromat)/i;

export function prefilterReason(name) {
  const n = String(name ?? "");
  if (STRONG.test(n)) return null;
  return WEAK.test(n) ? "grocery_or_convenience" : null;
}

/** Split records into kept and dropped (with reason). Only store records are filtered. */
export function prefilter(records) {
  const kept = [], dropped = [];
  for (const r of records) {
    const reason = r.venue_type === "store" ? prefilterReason(r.name) : null;
    (reason ? dropped : kept).push(reason ? { ...r, drop_reason: reason } : r);
  }
  return { kept, dropped };
}
