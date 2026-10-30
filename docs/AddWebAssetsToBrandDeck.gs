/**
 * Adds a "Web Assets" section to the end of the Brand Identity [MEZCALÓMANO] deck.
 * Content matches docs/MEZCALOMANO_WEB_STYLE.md (the Showcase style on mezcalomano.com and the shop, Oct 2026).
 *
 * How to run: script.google.com > New project > paste this file > Run addWebAssets > allow access.
 * Safe to run again: it first removes any slides it added before (tagged in the speaker notes).
 */
const DECK_ID = '1HF3PshOaHtt070QFV5FPYqt_C3CrVWC0AiT-hzdpghQ';
const TAG = 'WEB-ASSETS-2026-10';

const C = {
  dark: '#272926', olive: '#84866D', yellow: '#DFB725', terra: '#B86744', white: '#FFFFFF',
  onYellow: '#14150F', muted: '#D4D3CB', soft: '#E6E4DA', panel: '#333532', line: '#4A4C48',
};
const FONT = 'Open Sans';
const TITLE_FONT = 'Open Sans Condensed'; // Bold Condensed stand-in in Slides

function addWebAssets() {
  const deck = SlidesApp.openById(DECK_ID);
  deck.getSlides().forEach(s => {
    if (s.getNotesPage().getSpeakerNotesShape().getText().asString().indexOf(TAG) !== -1) s.remove();
  });
  const W = deck.getPageWidth(), H = deck.getPageHeight();
  const u = W / 960; // design on a 960 wide grid

  // ---------- helpers ----------
  const newSlide = (kicker, title) => {
    // This deck's master has no BLANK layout: use the layout with the fewest placeholders, then clear it.
    const layout = deck.getLayouts().reduce((a, b) => (b.getPlaceholders().length < a.getPlaceholders().length ? b : a));
    const s = deck.appendSlide(layout);
    s.getPageElements().forEach(e => e.remove());
    s.getBackground().setSolidFill(C.dark);
    s.getNotesPage().getSpeakerNotesShape().getText().setText(TAG + ' (added by AddWebAssetsToBrandDeck.gs)');
    const k = text(s, kicker.toUpperCase(), 48, 34, 600, 22, 11, C.muted, false, 400, 0);
    dot(s, 36, 41, C.terra);
    text(s, title.toUpperCase(), 48, 58, 860, 50, 30, C.white, true, 700);
    return s;
  };
  function text(s, str, x, y, w, h, size, color, condensed, weight) {
    const b = s.insertTextBox(str, x * u, y * u, w * u, h * u);
    const t = b.getText().getTextStyle();
    t.setFontFamily(condensed ? TITLE_FONT : FONT).setFontSize(size).setForegroundColor(color).setBold(weight >= 700);
    if (!condensed && weight < 400) t.setFontFamilyAndWeight(FONT, 300);
    b.getText().getParagraphStyle().setLineSpacing(115).setSpaceBelow(4);
    return b;
  }
  function dot(s, x, y, color) {
    const d = s.insertShape(SlidesApp.ShapeType.ELLIPSE, x * u, y * u, 8 * u, 8 * u);
    d.getFill().setSolidFill(color); d.getBorder().setTransparent();
    return d;
  }
  function panel(s, x, y, w, h) {
    const p = s.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x * u, y * u, w * u, h * u);
    p.getFill().setSolidFill(C.panel); p.getBorder().getLineFill().setSolidFill(C.line); p.getBorder().setWeight(1);
    return p;
  }
  function pill(s, label, x, y, w, h, fill, color, outline) {
    const p = s.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x * u, y * u, w * u, h * u);
    if (fill) p.getFill().setSolidFill(fill); else p.getFill().setTransparent();
    if (outline) { p.getBorder().getLineFill().setSolidFill(outline); p.getBorder().setWeight(1); } else p.getBorder().setTransparent();
    p.getText().setText(label.toUpperCase());
    p.getText().getTextStyle().setFontFamily(FONT).setFontSize(10).setForegroundColor(color);
    p.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
    p.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
    return p;
  }
  function bullets(s, lines, x, y, w, h, size) {
    const b = text(s, lines.join('\n'), x, y, w, h, size || 12, C.white, false, 300);
    b.getText().getListStyle().applyListPreset(SlidesApp.ListPreset.DISC_CIRCLE_SQUARE);
    return b;
  }

  // ---------- 1. Section opener ----------
  let s = newSlide('Brand identity', 'Web assets');
  text(s, 'How the brand looks on mezcalomano.com and shop.mezcalomano.com. This is the "Showcase" style, live from October 2026. ' +
    'The same rules apply to emails, social graphics and anything else on a screen.', 48, 120, 560, 80, 14, C.white, false, 300);
  bullets(s, ['Color on screen', 'Typography on screen', 'Layout', 'Components', 'Do and don\'t'], 48, 210, 400, 140, 14);
  text(s, 'Source of truth: docs/MEZCALOMANO_WEB_STYLE.md and docs/brand-tokens.json in the website repo.', 48, 470, 700, 24, 10, C.muted, false, 300);

  // ---------- 2. Color ----------
  s = newSlide('Web assets', 'Color on screen');
  const sw = [
    ['Dark', '#272926', 'Background on every page'],
    ['Olive', '#84866D', 'Links within the site, big numbers, prices, bullet dots'],
    ['White', '#FFFFFF', 'Body text, titles, icons'],
    ['Yellow', '#DFB725', 'Buy buttons and links that leave the page'],
    ['Terracotta', '#B86744', 'Small accents: eyebrow dot, Count me in, Q: and A:'],
  ];
  sw.forEach((c, i) => {
    const x = 48 + i * 176;
    const r = s.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x * u, 120 * u, 160 * u, 110 * u);
    r.getFill().setSolidFill(c[1]); r.getBorder().getLineFill().setSolidFill(C.line); r.getBorder().setWeight(1);
    text(s, c[0].toUpperCase(), x, 238, 160, 22, 14, C.white, true, 700);
    text(s, c[1], x, 260, 160, 18, 11, C.muted, false, 400);
    text(s, c[2], x, 280, 160, 60, 11, C.white, false, 300);
  });
  panel(s, 48, 360, 864, 110);
  text(s, 'THE COLOR RULE', 66, 372, 400, 20, 11, C.muted, false, 400);
  text(s, 'Yellow means buy, or leave this page. Olive means go somewhere on this site. Terracotta is decoration only. ' +
    'Never use yellow for an internal link, and only one yellow button per block. Text on yellow is #14150F. ' +
    'Supporting tints: muted text #D4D3CB, soft text #E6E4DA, panels are white at 5% with a 14% white border.', 66, 394, 830, 70, 12, C.white, false, 300);

  // ---------- 3. Typography ----------
  s = newSlide('Web assets', 'Typography on screen');
  text(s, 'One family on screen: Open Sans (Google Fonts, variable, with the width axis). On the web, titles are Bold Condensed caps, ' +
    'which replaces title case headlines for web use.', 48, 112, 860, 44, 12, C.white, false, 300);
  const rows = [
    ['TITLES', 'Bold 700, width 75%, caps, tracking 0.04em', 'FIND YOUR AGAVE'],
    ['LABELS AND BUTTONS', 'Regular 400, caps, tracking 0.06em', 'PRE-ORDERS OPEN'],
    ['BODY', 'Light 300, sentence case, tracking 0.03em, line height 1.6', 'One deck. 40 agaves. Endless rabbit holes.'],
    ['NUMBERS AND PRICES', 'Bold 700, width 75%, olive', '$29.99'],
  ];
  rows.forEach((r, i) => {
    const y = 170 + i * 66;
    panel(s, 48, y, 864, 56);
    text(s, r[0], 64, y + 8, 220, 20, 10, C.muted, false, 400);
    text(s, r[1], 64, y + 26, 300, 26, 10, C.white, false, 300);
    const sample = text(s, r[2], 400, y + 10, 500, 40, i === 0 ? 26 : i === 3 ? 26 : 14, i === 3 ? C.olive : C.white, i === 0 || i === 3, i === 0 || i === 3 ? 700 : (i === 1 ? 400 : 300));
  });
  text(s, 'Title sizes, same on every page: 64px desktop, 52px mid width, 34px phone. Body 17 to 19px. Labels 13 to 15px.', 48, 444, 860, 40, 11, C.muted, false, 300);

  // ---------- 4. Layout ----------
  s = newSlide('Web assets', 'Layout');
  // mini page mock
  const mx = 48, my = 116, mw = 360, mh = 360;
  panel(s, mx, my, mw, mh);
  const hdr = s.insertShape(SlidesApp.ShapeType.RECTANGLE, mx * u, my * u, mw * u, 34 * u); hdr.getFill().setSolidFill(C.dark); hdr.getBorder().getLineFill().setSolidFill(C.line);
  text(s, '☰', mx + 8, my + 4, 30, 26, 14, C.white, false, 400);
  text(s, 'MEZCALÓMANO', mx + 120, my + 6, 140, 24, 14, C.olive, true, 700).getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  dot(s, mx + 16, my + 52, C.terra);
  text(s, 'EYEBROW', mx + 26, my + 44, 200, 18, 8, C.white, false, 400);
  text(s, 'PAGE TITLE', mx + 12, my + 62, 300, 30, 20, C.white, true, 700);
  pill(s, 'Buy the deck', mx + 14, my + 104, 130, 26, C.yellow, C.onYellow, null);
  const foot = s.insertShape(SlidesApp.ShapeType.RECTANGLE, mx * u, (my + mh - 70) * u, mw * u, 70 * u); foot.getFill().setSolidFill(C.panel); foot.getBorder().getLineFill().setSolidFill(C.line);
  text(s, 'SPOT YOUR NEXT AGAVE CRUSH', mx + 12, my + mh - 64, 220, 18, 8, C.white, false, 400);
  pill(s, 'Count me in', mx + 250, my + mh - 62, 96, 22, C.terra, C.white, null);
  text(s, '© Mezcalómano · Explore agave, sip mezcal.', mx + 12, my + mh - 30, 300, 18, 7, C.muted, false, 300);
  bullets(s, [
    'Content up to 1320px wide. Side padding 48px on desktop, 16px on phones.',
    'Header: burger left, stacked logo center, basket right. 88px tall on desktop, 72px on phones. Nothing else in it.',
    'Every page title has an eyebrow above it: a terracotta dot and a small caps label.',
    'Footer on every page: newsletter band with the terracotta Count me in button, then one small line of links.',
    'Home only: a thin announcement bar above the header (#1F211E).',
    'One breakpoint does most of the work: 900px. Below it, grids become one column.',
    'Pages stay dark, calm and spacious, with one clear action per section.',
  ], 440, 116, 472, 360, 12);

  // ---------- 5. Components ----------
  s = newSlide('Web assets', 'Components');
  text(s, 'BUTTONS', 48, 112, 200, 18, 10, C.muted, false, 400);
  pill(s, 'Add to cart', 48, 134, 190, 40, C.yellow, C.onYellow, null);
  pill(s, 'Buy it now', 252, 134, 190, 40, null, C.white, '#9A9B97');
  text(s, 'Pill shaped, 56px tall on the site, caps Regular 15px, flat with no shadow. Yellow for buying or leaving; outlined white for secondary.', 48, 180, 400, 50, 10, C.white, false, 300);
  text(s, 'FIELDS', 48, 240, 200, 18, 10, C.muted, false, 400);
  const fld = s.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, 48 * u, 262 * u, 280 * u, 34 * u);
  fld.getFill().setTransparent(); fld.getBorder().getLineFill().setSolidFill('#7A7B78'); fld.getBorder().setWeight(1);
  fld.getText().setText('   Email address'); fld.getText().getTextStyle().setFontFamily(FONT).setFontSize(10).setForegroundColor(C.muted); fld.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
  pill(s, 'Count me in', 338, 262, 104, 34, C.terra, C.white, null);
  text(s, 'Pill shaped, thin white border at 30%, white on focus.', 48, 300, 400, 20, 10, C.white, false, 300);
  text(s, 'CHIPS', 48, 334, 200, 18, 10, C.muted, false, 400);
  ['Tobalá', 'Espadín', 'Oaxaca'].forEach((c, i) => pill(s, c, 48 + i * 96, 356, 86, 26, null, C.white, '#6E6F6C'));
  text(s, 'Outlined pills. Agave and state names in Bold Condensed caps, centered.', 48, 388, 400, 20, 10, C.white, false, 300);
  // right column
  text(s, 'CARDS AND PANELS', 500, 112, 300, 18, 10, C.muted, false, 400);
  const card = panel(s, 500, 134, 100, 140);
  text(s, 'TOBALÁ', 506, 246, 90, 22, 12, C.white, true, 700);
  text(s, '16px corners, white 5% fill, white 14% border. Deck cards always use the poker ratio 5:7. Agave art sits on a soft olive glow.', 616, 134, 296, 90, 10, C.white, false, 300);
  text(s, 'STAT TILES', 500, 290, 300, 18, 10, C.muted, false, 400);
  [['40', 'agaves'], ['12', 'production roles']].forEach((t, i) => {
    panel(s, 500 + i * 140, 312, 128, 74);
    text(s, t[0], 512 + i * 140, 316, 110, 40, 28, C.olive, true, 700);
    text(s, t[1], 512 + i * 140, 356, 110, 24, 10, C.soft, false, 300);
  });
  text(s, 'Also: 10px olive dots instead of bullets, 2px line icons, a 2px white focus outline, an olive scrollbar.', 500, 400, 412, 40, 10, C.white, false, 300);

  // ---------- 6. Do and don't ----------
  s = newSlide('Web assets', 'Do and don\'t');
  panel(s, 48, 116, 420, 330); panel(s, 492, 116, 420, 330);
  text(s, 'DO', 66, 128, 200, 30, 20, C.olive, true, 700);
  bullets(s, [
    'Keep pages dark, with white text and plenty of space.',
    'Use Bold Condensed caps for every title, one line where possible.',
    'Put photography and agave illustrations on the dark background, with 16px corners.',
    'Use American English and keep agave accents (Espadín, Tobalá).',
    'Check new colors with npm run check:brand in the website repo.',
  ], 66, 164, 390, 270, 12);
  text(s, 'DON\'T', 510, 128, 200, 30, 20, C.terra, true, 700);
  bullets(s, [
    'Add new colors, fonts, gradients or button shadows.',
    'Use yellow for anything that isn\'t buying or leaving the page.',
    'Use sentence case or full-width Bold for titles.',
    'Put more than one yellow button in the same block.',
    'Use em dashes or en dashes in any copy.',
  ], 510, 164, 390, 270, 12);

  Logger.log('Added 6 Web assets slides to ' + deck.getName());
}
