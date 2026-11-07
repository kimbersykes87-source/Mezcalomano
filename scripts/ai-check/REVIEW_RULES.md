# AI answer check: review rules

Owner: Siona reviews flagged facts monthly. Kimber reads the five line summary.

## What counts as "mentioned us"
- The answer text contains "Mezcalómano" (any spelling without accent) or "Discovery Deck".
- A false positive is possible (a cruise ship "Discovery Deck"). If the surrounding sentence is not about our playing cards, do not count it.
- A link to mezcalomano.com or shop.mezcalomano.com in the sources counts as "domain linked", even if the text does not name us.
- Google AI Overview links are read from the search result data and are real destinations.

## What counts as a wrong fact
Compare with MAP_00_INDEX key facts (stored in `facts.json`):
- Wrong: a price other than $29.99, a weight other than 99 g, a partner or kit we do not have, a ship date other than from 2026-11-30, saying we ship outside the US.
- Unverified: a claim not in the maps (paper stock, "56 cards", "casino-grade"). Do not call it wrong. Siona checks it, then it goes into the maps or stays flagged.
- Missing: a correct fact that never appears. Not an error, but a list for the facts block on the site.

## What goes to Siona
1. Every row in the report under "possible wrong facts".
2. Any answer that names us with a claim not in `facts.json`.
3. Anything about the brand story, founders or partners.
Nobody edits the site, press page or llms.txt because of an AI answer until Siona has said whether the answer is wrong or the site is unclear.

## When a change counts as real
- Each question is asked 2 or 3 times per source, so the report shows a share (for example 2/3), not yes or no.
- A change counts only if it holds in two monthly checks in a row and is not explained by a different model name in the report.
- If the model name changed, note it and treat that month as a new baseline.

## Limits to remember
- Models with web search differ from the chat apps people use, and chat apps personalize. Results show direction, not exact rankings.
- Question list is frozen for six months. Change it only with Siona, and note the date.
- Placeholder questions (starting "PLACEHOLDER") never count as a baseline.
