# Mezcalómano web style guide

Drop this file into any chat or tool that designs or builds web pages, emails or digital assets for Mezcalómano. It describes the "Showcase" style used on mezcalomano.com and shop.mezcalomano.com (October 2026). Follow it exactly unless Kimber or Siona say otherwise.

## The brand in one line

Mezcalómano makes the Discovery Deck, a 56-card poker deck of 40 agave species for the mezcal curious. Tagline: **Beyond Espadín**. The tone is warm, nerdy and playful: "Espadín's great, but have you met the wild ones?"

## Copy rules

- American English for all customer-facing copy (flavor, color, favorite).
- No em dashes or en dashes anywhere. Use commas, colons, full stops or parentheses.
- Titles are short and fit on one line where possible.
- Agave names keep their accents (Espadín, Tobalá, Arroqueño) and are never translated.
- Key facts: 56 cards (40 agaves, 12 production roles, 2 pollinator jokers, 2 reference cards), poker size, $29.99, free US shipping, pre-orders ship from November 30, order by December 14 for US Christmas delivery, 30-day full refund on unopened decks. About 85% of mezcal is made from espadín.

## Colors

The site is dark. Text is white on the dark background.

| Name | Hex | Use |
|---|---|---|
| Dark | `#272926` | Page background, header, menus |
| Olive | `#84866D` | Links and actions that stay on the page, big numbers, prices, bullet dots, scrollbar |
| Yellow | `#DFB725` | Buy buttons and links that leave the page (shop, external sites). Arrow icons on outbound links |
| Terracotta | `#B86744` | Small accents only: the eyebrow dot, the "Count me in" newsletter button, "Q:" and "A:" in FAQs |
| White | `#FFFFFF` | Body text, titles, icons |
| Text on yellow | `#14150F` | Label text on yellow buttons |
| Muted | `#D4D3CB` | Secondary text, captions, footer text, placeholders |
| Soft text | `#E6E4DA` | Long body copy inside panels |
| Placeholder | `#B9B8B0` | Small print (privacy notes) |
| Card dark | `#2F322F` | Dropdown lists |
| Map panel | `#2B2D2A` | Map background |
| Bar | `#1F211E` | Announcement bar |
| Error | `#F2B8A0` | Form error text |

Panels and cards use white at low opacity on the dark background: fill `rgba(255,255,255,.05)`, border `1px solid rgba(255,255,255,.14)`. Section dividers are `1px solid rgba(255,255,255,.10)`.

**The color rule:** yellow means "buy or leave this page", olive means "go somewhere on this page or this site", terracotta is decoration. Never use yellow for an internal link, and never use more than one yellow button in the same block.

## Type

One family: **Open Sans** (Google Fonts, variable, with the width axis):
`https://fonts.googleapis.com/css2?family=Open+Sans:ital,wdth,wght@0,75..100,300..700;1,75..100,300..700&display=swap`

| Role | Weight | Width | Case | Letter spacing |
|---|---|---|---|---|
| Titles (h1, h2, card names) | 700 Bold | 75% (Condensed) | UPPERCASE | 0.04em |
| Body | 300 Light | 100% | Sentence case | 0.03em, line height 1.6 to 1.7 |
| Labels, buttons, eyebrows, nav | 400 Regular | 100% | UPPERCASE | 0.06em |
| Big numbers and prices | 700 Bold | 75% | n/a | 0.03em, olive |

Title sizes are the same on every page:

| Screen | Page title (h1) | Section title (h2) |
|---|---|---|
| Desktop (over 1200px) | 64px | 34 to 44px |
| Mid width (900 to 1200px) | 52px | 34px |
| Phone (900px and under) | 34px | 28 to 36px |

Body text is 17 to 19px on desktop and 17px on phones. Labels are 13 to 15px.

## Layout

- Content width 1320px max, side padding 48px on desktop and 16px on phones.
- Header: 88px tall on desktop, 72px on phones. Burger menu on the left, stacked logo in the center, basket on the right. Nothing else in the header.
- Home page only: a thin announcement bar above the header (`#1F211E`, 12.5px caps, muted text), with a shorter version on phones.
- Eyebrow above every page title: a 10px terracotta dot followed by a small caps label (for example "Where agaves grow").
- Footer on every page: a newsletter band ("Spot your next agave crush", email field, terracotta "Count me in" button, privacy note), then one small line with © year, "Explore agave, sip mezcal." and links (Instagram, TikTok, Press, Sources, Shipping, Returns, Privacy, Terms).
- One breakpoint does most of the work: 900px. Under 900px, grids become a single column.

## Components

- **Buttons:** pill shaped (`border-radius:999px`), 56px tall, 28px side padding, caps Regular 15px, letter spacing 0.06em. Flat, with no shadow or border ring. Primary is yellow with `#14150F` text. Secondary is outlined: transparent with `inset 0 0 0 1px rgba(255,255,255,.5)`. On product pages the yellow button runs the full width of the text column.
- **Fields:** pill shaped, 46 to 54px tall, `1px solid rgba(255,255,255,.30)`, transparent fill, white text, muted placeholder. The border turns white on focus. Textareas use a 12 to 16px radius.
- **Cards and panels:** 16px radius (12px for small thumbnails), low-opacity white fill and border as above. Agave images sit on a soft olive radial glow.
- **Playing cards:** anything shown as a card from the deck uses the poker ratio 5:7.
- **Chips and filters:** pills with `1px solid rgba(255,255,255,.26)`. Filter chips are Regular caps. Fact chips (agave names, states) are Bold Condensed caps, centered. The active filter is filled.
- **Stat tiles:** a large olive Bold Condensed number (44px or more), with a short muted line underneath, in a panel.
- **Lists:** no default bullets. Use a 10px olive dot.
- **Links in body copy:** underlined with a 3px offset. Outbound links use a yellow underline or a yellow round arrow icon.
- **Icons:** simple 2px stroke line icons, round caps, 24px, white.
- **Focus:** a 2px white outline with a 3px offset on every interactive element.
- **Scrollbar:** olive thumb on a faint track.

## Pages and where things live

- mezcalomano.com (Next.js on Vercel): Home, Map ("Find your agave"), Directory (40 agave pages, reached from the deck's QR code and not shown in the menu), About, Press, Sources, Contact.
- shop.mezcalomano.com (Shopify, Origin theme restyled to match): the shop opens straight onto the Discovery Deck product page.
- Logos live on the site at `/assets/brand/logos/`. The stacked dark lockup `mezcalomano_lockup_stacked_dark.svg` is used in the header.
- The master color list is `docs/brand-tokens.json` in the website repo. `npm run check:brand` fails on any color that is not in that list.

## Do and don't

- Do keep pages dark, calm and spacious, with one clear action per section.
- Do put photography and agave illustrations on the dark background, with rounded 16px corners.
- Don't introduce new colors, fonts, gradients or drop shadows on buttons.
- Don't use yellow for anything that isn't buying or leaving the page.
- Don't use sentence-case titles or Bold at full width for titles. Titles are always Bold Condensed caps.

## Editorial rule: agave first, no brands

Mezcalómano is an agave first company. In articles, gift guides, captions and emails we talk about taste, agave and common names (the names people see on menus and labels), and we do not name bottle brands, producers, shops or products. Describe a thing by what it is: the agave, how it tastes (the smoke, agave, fermentation compass), the region, the style (joven, reposado, ancestral) and the shape or material of an object. The only product we name is our own Discovery Deck, and we say it is ours. Agave names with accents (Espadín, Tobalá) and the official body that certifies mezcal (COMERCAM) are facts, not brands, and are fine to name and cite.
