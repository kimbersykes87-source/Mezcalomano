// Crude keyword scoring. It cannot judge meaning, so a human reads every flagged item (REVIEW_RULES.md).
export function score(result, facts) {
  const text = result.text ?? "";
  const links = result.links ?? [];
  const brand = new RegExp(facts.brandPattern, "i").test(text);
  const domainText = new RegExp(facts.domainPattern, "i").test(text);
  const domainLink = links.some((l) => new RegExp(facts.domainPattern, "i").test(l.url ?? ""));
  const factsHit = facts.facts.filter((f) => new RegExp(f.pattern, "i").test(text)).map((f) => f.id);
  const wrong = facts.wrongPatterns.filter((f) => new RegExp(f.pattern, "i").test(text)).map((f) => f.id);
  const competitors = facts.competitors.filter((c) => text.toLowerCase().includes(c.toLowerCase()));
  return { empty: text.trim().length === 0, mentioned: brand, domainLinked: domainLink, domainInText: domainText, factsHit, wrong, competitors };
}
