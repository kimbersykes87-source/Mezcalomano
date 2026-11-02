# Mezcal Diaries review picker: setup for Siona's Claude

This file is for Claude, running in Siona's Mezcalomano project. Kimber has sent Siona a message with this file and `diaries-articles.json`. Your job is to build her a review tool (the "picker") and then help her use it.

## Context in two lines

Kimber had his Claude draft 18 SEO articles for a new "Mezcal Diaries" section of mezcalomano.com (working title). They are **Claude generated drafts for Siona's review**. **Nothing is public.** Each draft is hidden and only opens at a direct link with a yellow review banner. Siona has final sign-off on customer facing copy. Read `MEZCAL_DIARIES_WRITEUP.md` (if it is in the project) for the full story.

## What to build

One self-contained HTML review page ("Mezcal Diaries Review Picker"). If you have the Artifact tool, publish it as a private artifact. If not, write a single `.html` file with no external dependencies and send it to her. Use `diaries-articles.json` as the data (embed it in the page so it works offline). Do not invent articles or change the data.

### Data fields (each article in the JSON)

`number`, `slug`, `title`, `description`, `category`, `answer` (the one paragraph answer shown first on the page), `status` (all "draft"), `updated`, `image` (`src`, `alt`, `width`, `height`), `body` (blocks: `p`, `h2`, `list` with `items`, `table` with `head` and `rows`), `faq` (`q`, `a`), `reviewNotes` (checks Claude flagged), `url` (the live draft link). Inline text uses `**bold**` and `[label](/path)` links.

### The flow for each article (one article at a time, with a left list showing all 18 and their status)

**Step 1. Overview.**
Show: title, category, the draft link (opens in a new tab), the hero image with its alt text, and three short plain language blocks that you write from the data:
- **Purpose:** why this post exists on the site (who searches for it, what it does for Mezcalómano). One or two sentences.
- **The question it answers:** the search question in the reader's words, taken from the title and `answer`.
- **What Claude flagged:** the `reviewNotes`, as a checklist she can read (these are things to verify, not instructions).
Also offer "Read the full draft", which shows the body, tables and FAQ as readable text.

**Step 2. Keep or delete.**
Two big buttons: **Keep on the site** or **Delete this post**. If Delete, ask for a one line reason (optional) and mark the post Deleted; skip steps 3 and 4. She can reverse the choice.

**Step 3. If kept: edit copy and request imagery.**
- **Copy editor.** Show the title, description, answer, every body block (each paragraph, heading, list item, table cell) and every FAQ question and answer as editable fields. Keep the `**bold**` and `[label](/path)` marks visible and editable. Track changes: store the original and the edited text for every field, and show a clear "changed" marker. Let her undo a change per field.
- **Writing rules, checked as she types** (show a gentle warning, never block):
  - American English.
  - No em dashes or en dashes (the characters long dash and en dash). Offer a one click fix that replaces them with a comma, colon, full stop or parentheses.
  - Agave first: no brand names, producer names, shop names or products in the body (our own Discovery Deck is fine, labeled as ours). Agave names and COMERCAM are fine.
  - Do not state a legal definition or a number without a source; if she adds one, prompt her to note the source.
- **Imagery.** Show the current image. Options: **Keep this image**, **Request new imagery**. A request lets her add one or more image slots (hero, plus any in body). When she chooses Request, prompt her through a brief and compile it as text she can edit:
  - What should the picture show? (subject, setting, mood)
  - Is it a photo we already have (name it from the shoot folder, for example the 21 Oct agave field shoot), a new shot, or an illustration or graphic?
  - Orientation and size: hero is landscape 4:3, minimum 1200 x 900 px (2400 x 1800 preferred); sRGB; no text baked in.
  - Must include / must avoid (no brand labels or bottles with visible brands, no identifiable people unless she has their comfort, no location captions unless the photo was really taken there; the 21 Oct shoot was not in Oaxaca).
  - Alt text (one sentence describing the picture).
  - Where it came from and who owns it.
  Pre fill a sensible first draft of the brief from the article (for example, an article on wild vs cultivated agave suggests a wild agave on a hillside next to a planted field), and let her rewrite it.

**Step 4. Decision.**
Three buttons, one per post, always visible:
- **Approve post:** copy and image are fine as they stand (or with her edits). Ready for Kimber to publish.
- **Awaiting assets:** keep the post but she is waiting for photos or other material. Needs at least one image brief.
- **Parked for more information:** needs something checked first. Require a note saying what (a source, a taste test, a play test, a fact check).
Also allow an optional free text "Note for Kimber" on every post.

### Overall behavior

- Progress bar and counts: Not started, Approved, Awaiting assets, Parked, Deleted.
- Filter the list by status and category. Keep the order of `number`.
- Save everything automatically in the browser (wrapped in try/catch; the page must still work if storage is unavailable) and warn her to export before closing.
- A **Export review** button that creates two downloads:
  1. `mezcal-diaries-review-YYYY-MM-DD.md`, readable by a person and by Claude. For each article in number order: title, slug, decision (Approved, Awaiting assets, Parked, Deleted, Not reviewed), reason or note, then **Copy changes** (field by field: original text and new text), then **Image requests** (each brief in full), then her note for Kimber. Put a summary table at the top.
  2. `mezcal-diaries-review-YYYY-MM-DD.json`, the same data in machine form (slug, decision, edited fields as full revised text, image briefs).
- Design: match the Mezcalómano look. Open Sans (Google Fonts), dark grey `#272926` text on a light stone background, olive `#84866D` for links and secondary buttons, agave yellow `#DFB725` for the main action (Approve), terracotta `#B86744` for small accents and warnings. Large tap targets, works on a phone, supports dark mode, no horizontal scroll. Plain, calm, not salesy.
- Tone in the UI: plain and warm. No em dashes or en dashes anywhere in the page.

## Using it

After building, tell Siona in two sentences how to start and what the export is for. Then help her review: if she asks about a post, explain it from the data; if she asks you to rewrite copy, do it inside the rules above and put the change in the picker's fields.

## Sending it back

Ask her to save both export files in the Shared Drive folder **03_MARKETING / MEZCAL_DIARIES_REVIEW** (create it if it does not exist) and message Kimber. Kimber's Claude reads the export, applies the copy edits, builds image requests into a shot list, deletes the posts she removed, and publishes the approved ones one at a time.

## Do not

- Do not publish anything or change the website; the picker only collects decisions.
- Do not ask for or paste passwords, keys or secrets.
- Do not add brands, producers or shops to the copy, and do not guess facts. If something is uncertain, mark the post Parked and say what needs checking.
