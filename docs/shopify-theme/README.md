# Shopify theme restyle (October 2026)

Copies of the files Claude wrote to the Shopify theme **"Origin, Showcase 2026-10"**
(theme ID 189745529056, a duplicate of the live Origin theme 157010526432). Shopify is the
source of truth; these are kept here for history and to rebuild the theme if needed.

| File here | Theme file |
| --- | --- |
| `mezcalomano.css` | `assets/mezcalomano.css` |
| `header-group.json` | `sections/header-group.json` (adds the `mm-styles` custom liquid section that loads Open Sans and `mezcalomano.css`, the new announcement text, no selectors or account icon) |
| `footer-group.json` | `sections/footer-group.json` ("Spot your next agave crush", no Follow on Shop or selectors) |
| `product.json` | `templates/product.json` (eyebrow, lede and key points, "When it lands" box; related products removed) |

`config/settings_data.json` and `layout/theme.liquid` were not changed; radius and color
settings are overridden in the CSS. The Cloudflare analytics line in `layout/theme.liquid`
came across with the duplicate. Plan: Claude Docs "Shopify Shop Restyle Plan".
