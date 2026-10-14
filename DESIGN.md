---
name: PintDownload
description: Claim-ticket world. A Pinterest link is a ticket; the file is what you collect.
colors:
  ticket-red: "#C8281A"
  ticket-red-deep: "#A51F13"
  ticket-red-soft: "#EC8C7D"
  stock-tangerine: "#F08A3C"
  stock-canary: "#F4C531"
  stock-lilac: "#B79CE8"
  stock-mint: "#6CC79A"
  stock-sky: "#7DB7E8"
  stock-blush: "#F29BB4"
  counter: "#E4E6E9"
  paper: "#FFFFFF"
  paper-2: "#F5F6F7"
  carbon-ink: "#17191E"
  carbon-ink-2: "#4E535C"
  rule: "#C2C5CB"
  placeholder: "#6A707A"
  night-counter: "#0E0F12"
  night-paper: "#1D2026"
  night-paper-2: "#24272D"
  night-rule: "#393D45"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.875rem, 7vw, 5.75rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Big Shoulders Display, Arial Narrow, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Big Shoulders Display, Arial Narrow, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.08em"
  serial:
    fontFamily: "Big Shoulders Display, Arial Narrow, ui-sans-serif, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 800
    letterSpacing: "0.04em"
    fontFeature: "tnum"
  stub:
    fontFamily: "Big Shoulders Display, Arial Narrow, ui-sans-serif, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 900
    letterSpacing: "0.04em"
  article-title:
    fontFamily: "Big Shoulders Display, Arial Narrow, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.875rem, 9cqi, 5.75rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  article-section:
    fontFamily: "Big Shoulders Display, Arial Narrow, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.625rem, 1.1rem + 1.6vw, 2.25rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.01em"
rounded:
  sm: "2px"
  stamp: "3px"
  md: "4px"
  ticket: "6px"
  panel: "8px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  ticket-pad: "16px"
  chip-gap: "8px"
  section-y: "48px"
  section-y-lg: "64px"
  notch: "14px"
  receipt-notch: "12px"
  seam-stub: "4.25rem"
  seam-lap: "2.75rem"
  seam-ticket-lg: "28rem"
  seam-ticket-xl: "32rem"
  seam-ticket-2xl: "34rem"
  outline-rail: "11rem"
  reading-column: "43rem"
components:
  ticket-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.ticket}"
    padding: "14px 16px 20px"
  ticket-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "4px 4px 4px 12px"
  stub-button:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.stub}"
    rounded: "{rounded.ticket}"
    height: "4.25rem"
    width: "100%"
  stub-button-hover:
    backgroundColor: "#000000"
    textColor: "{colors.stock-canary}"
  stub-button-active:
    backgroundColor: "{colors.ticket-red-deep}"
    textColor: "{colors.paper}"
  button-ink:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-ink-hover:
    backgroundColor: "{colors.ticket-red}"
    textColor: "{colors.paper}"
  stamp-ok:
    backgroundColor: "{colors.stock-canary}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.serial}"
    rounded: "{rounded.stamp}"
    padding: "3px 9px 2px"
  stamp-warn:
    textColor: "{colors.ticket-red}"
    rounded: "{rounded.stamp}"
    padding: "3px 9px 2px"
  stock-chip:
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  stock-chip-current:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
  paper-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  nav-link:
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-link-current:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
  receipt-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.ticket}"
  receipt-band:
    backgroundColor: "{colors.ticket-red}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.4rem 0.75rem 0.35rem"
    height: "2.5rem"
  collect-button:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.stub}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "3.5rem"
    width: "100%"
  collect-button-hover:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.stock-canary}"
  collect-button-active:
    backgroundColor: "{colors.ticket-red-deep}"
    textColor: "{colors.paper}"
  receipt-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "0 0.875rem"
    height: "2.75rem"
  receipt-button-hover:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
  reading-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.ticket}"
    padding: "2.75rem 3rem 3rem"
    width: "{spacing.reading-column}"
  article-ticket:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.ticket}"
---

# Design System: PintDownload

## Overview

**Creative North Star: "The Claim Ticket"**

A Pinterest link is a claim ticket and the file is what you collect at the counter. Every page is printed on a roll of ticket stock: a flat, saturated field of colour owns the top of the page, a white ticket of paper sits on it, and the primary action is the tear-off stub below a dashed perforation. Below the hero the page drops onto the counter, a cool grey ground where sections are white paper slips separated by heavy ink rules.

The world is printed, not rendered. Depth comes only from paper lying on paper; there are no drop shadows and no gradients. Corners are small and die-cut, holes are punched, perforations are dashed. Type is a condensed printing gothic (Big Shoulders Display, 800/900, uppercase) for headlines, serials, stamps and the stub, set against a plain system sans for everything a person actually reads. Each Pinterest URL type has its own stock colour, and that colour means only that URL type wherever it appears.

Honesty is part of the material: the only numerals on a ticket are real ones (the pin ID read from the pasted link, the format, the size). No invented counters.

**Key Characteristics:**
- Full-bleed stock field behind the hero and header; counter grey below.
- White ticket paper, 6px die-cut corners, punched 14px notches at the perforation.
- Tear-off stub in carbon ink as the single primary action on the page.
- On desktop the ticket lies across the seam: it starts on the field and its stub ends on the counter, where every result prints.
- Condensed gothic uppercase for display, labels, serials, stamps; system sans for reading.
- One stock colour per URL type, read from `src/lib/stocks.ts`.
- Flat paper overlap only: no shadows, no gradients.

## Colors

A committed single-stock field per page on a cool carbon-and-counter neutral system, with a rack of six secondary stocks that each belong to one URL type.

### Primary
- **Ticket Red** (`ticket-red`): The house stock. Field of the homepage and the pin tool, the brand's `theme-color`, focus ring on the ticket input, caret colour, active-press colour family. Every legacy `red-*`, `rose-*`, `pink-*`, `brand-*` utility is remapped onto the ticket-red ramp (50 to 950 in `tailwind.config.mjs`) so old accents land on the same roll.
- **Deep Ticket Red** (`ticket-red-deep`): Pressed state of the stub; warning text on paper.
- **Soft Ticket Red** (`ticket-red-soft`): Warning stamp ink in dark mode only.

### Secondary (the stock rack)
Each is one URL type and nothing else. Ink on all of them is carbon (`#17191E`); only ticket red takes white ink.
- **Tangerine Stock** (`stock-tangerine`): Video / MP4.
- **Canary Stock** (`stock-canary`): Image / HD photo. Also doubles as the house highlight: text selection, stub hover ink, column labels on dark footer, dark-mode focus ring.
- **Lilac Stock** (`stock-lilac`): GIF.
- **Mint Stock** (`stock-mint`): Board ZIP.
- **Sky Stock** (`stock-sky`): Profile ZIP.
- **Blush Stock** (`stock-blush`): Avatar / profile picture.

Tools that are not a URL type (device guides, audio, browser tools) print on plain carbon ink (`INK_STOCK`).

### Neutral
- **Counter Grey** (`counter`): Page ground below the hero; the "counter" field option.
- **Ticket Paper** (`paper`): Ticket body, section slips, FAQ items, cards.
- **Paper Tint** (`paper-2`): Reserved ad slot fill, image wells.
- **Carbon Ink** (`carbon-ink`): Body text, ticket header rule, input stroke, stub, current nav/chip, selection background.
- **Carbon Ink 2** (`carbon-ink-2`): Secondary text, hints, ledes on paper.
- **Rule Grey** (`rule`): Dashed dividers inside paper (FAQ, tables), ad-slot border.
- **Placeholder Grey** (`placeholder`): Input placeholder on paper.
- **Night Counter / Night Paper / Night Paper 2 / Night Rule**: The `.dark` swap of counter, paper, paper-2 and rule. Ink and ink-2 swap to `#F5F6F7` / `#C2C5CB`. Footer and keyword matrix sit on night counter in both modes.

### Named Rules
**The One Stock, One Link Rule.** A stock colour identifies exactly one Pinterest URL type, everywhere: page field, stamp, rack chip, related-tool stub. Never use a stock colour decoratively or for a different meaning.

**The Field Swap Rule.** A page sets its field with one class (`field-red`, `field-tangerine`, ...) which redefines `--field`, `--on-field`, `--on-field-2`. Components read those variables; never hard-code hero colours. A chip in the page's own stock prints on paper with a stock-coloured perforation so it does not vanish into the field.

**The Carbon Ink Rule.** On every stock except ticket red, text is carbon ink, not white.

## Typography

**Display Font:** Big Shoulders Display 800/900, self-hosted woff2, preloaded (fallback Arial Narrow, ui-sans-serif)
**Body Font:** System sans stack (ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial)
**Serif:** none in use. A Charter stack is still defined in `tailwind.config.mjs`, but no surface applies it; article prose is the system sans.

**Character:** A tall, condensed ticket-printing gothic shouts the claim in uppercase with tabular numerals; the system sans stays out of the way so the instructions read instantly on a phone.

Root size is 100% on phones and 106.25% from 768px. The Tailwind type scale is retuned: xs 0.8125, sm 0.9375, base 1.0625, lg 1.1875, xl 1.3125, 2xl 1.5, 3xl 1.875, 4xl 2.25, 5xl 3, 6xl 3.75 (rem), with line heights tightening from 1.65 to 0.95 as size rises.

### Hierarchy
- **Display** (900, line-height 0.88 to 0.9, uppercase): Page H1s, left-aligned on the field. Tool and error heroes print at 2.875rem on phones and 3.75rem from 640px; in the desktop hero seam at 3.75rem, and 4.25rem from 1440px, which keeps the copy column no taller than the ticket. The full `display` ramp (up to 5.75rem) is the blog index title; article titles use `article-title`.
- **Headline** (900, 2.25rem to 3rem, line-height 0.95, uppercase): Section H2s on the counter, always sitting under a 2px ink counter rule. Tool-body H2s clamp(1.875rem, 4vw, 2.75rem).
- **Title** (system sans 700, 1.0625rem to 1.125rem, snug): Card titles, FAQ summaries, step titles.
- **Body** (system sans 400, 1.0625rem, 1.65): Ledes and paragraphs; FAQ answers capped at 68ch, ledes at max-w-xl.
- **Body small** (0.9375rem, 1.5): Hints, table cells, footer links.
- **Label** (gothic 800, 0.875rem, 0.08em tracking, uppercase): The ticket header ("Admit one · public link"), column labels in the hero aside and dark footer, table heads.
- **Serial** (gothic 800, 0.95rem, 0.04em, tabular): The pin-ID serial "No. 1120271…" in the ticket header, repeated on the receipt band; the article serial strip and article-ticket stubs use the same voice.

### Reading (blog articles)
`src/styles/blog.css`. Selectors that restyle authored article HTML are scoped `.blog .blog-prose` so they outrank the Tailwind utilities baked into post content.
- **Article title** (`article-title`, uppercase): One per article, on the field. It is sized against the masthead text column (container units), not the viewport. The blog index title uses the display ramp instead (clamp(2.875rem, 7vw, 5.75rem), line-height 0.9).
- **Prose** (`body`: system sans 400, 1.0625rem, 1.65): Every sentence of the article, capped at 68ch; blocks are spaced 1.125rem. Measured line on desktop: 612 to 629px, 67 to 69 characters.
- **Section opener** (`article-section`, uppercase): Article H2s, 3.25rem above, under a 2px ink rule with 0.625rem between rule and cap; the following block starts 0.75rem below. The "More in…" head after the article uses the same size; "Keep reading" uses the headline size.
- **Subhead** (system sans 700, 1.0625rem, 1.35): Article H3s, 2.25rem above.
- **Links:** ticket red (soft ticket red in dark mode), 600, underlined at 0.08em thickness and 0.18em offset; hover prints a canary highlight behind carbon text.
- **Lists:** square bullets in ticket red. Ordered lists drop the browser numeral for a gothic 900 1.625rem tabular numeral in ticket red, hung in a 2.25rem indent.
- **Code:** ui-monospace at 0.875em on paper tint with a 1px rule border and 3px corners; code blocks are carbon panels with paper text.
- **Tables:** gothic label heads (0.875rem, 0.08em) under a 2px ink rule, rows split by 2px dashed rule lines, a sticky bold first column on paper, 2px ink rules above and below the scroller. Tables keep a 34rem minimum and scroll sideways; on phones the scroller bleeds to the screen edges.
- **Quotes, rules, figures:** blockquotes are 600 weight between dashed rules; `hr` is a 2px dashed rule; figures have 4px corners, a 1px rule border and a left-aligned ink-2 caption.
- **Authored call-to-action boxes** become ink panels: first line gothic 900 at 1.625rem, body in rule grey, links in canary with 44px targets, a dashed white/25 rule above the links.

### Named Rules
**The Printer's Gothic Rule.** Big Shoulders is used uppercase (the serial's "No." aside) and only for display and headlines, labels, serials and numerals, stamps, and the stub and collect buttons. Never for paragraphs, inputs, or anything longer than a line or two.

**The Plain Reading Rule.** In an article the gothic only frames the text: title, section openers, labels, table heads, list numerals. Every sentence a reader reads is system sans at 1.0625rem / 1.65, no wider than 68ch, on paper.

**The Real Numerals Rule.** Gothic numerals print real values only (pin ID, step number, format, size), always with tabular figures.

## Layout

Container is `max-w-7xl` with 16 / 24 / 32px gutters (phone / sm / lg). Body sections use `max-w-6xl`, 48px vertical padding (64px from sm).

Section heads are a two-column strip from lg: headline left, a short ink-2 lede right (`minmax(0,26rem)`), bottom-aligned, sitting under the counter rule. On tool pages everything collapses to a single left edge (`.tool-body`).

Grids: related tools 1 / 2 / 3 columns, 12px gap; footer and keyword matrix 1 / 2 / 4 columns. The stock rack is a wrapping flex row with 8px gaps.

Ad slots reserve their height up front (280px phone, 250px from 640px) and render nothing until an ad client is configured, so the layout never shifts.

### Hero seam
`TicketHero.astro`, and "Hero seam" in `src/styles/ticket.css`. The paste box is above the fold at every width.

- **Phones and tablets (below 1024px):** one column on the field: H1, lede, the page's aside (the homepage hides its aside below 640px), the ticket at full width minus the gutter, then the rack. Whatever the form prints afterwards follows on the field, and receipt notches take the field colour. Hero top padding is 12px on phones so the ticket lands in the first viewport.
- **Desktop columns (1024px+):** the hero becomes a grid of a `minmax(0,1fr)` copy column and a ticket column of `--seam-ticket` (`seam-ticket-lg` at 1024px, `seam-ticket-xl` at 1280px, `seam-ticket-2xl` from 1440px), with a 2.5rem column gap (3.5rem from 1280px). The form island is unwrapped (`display: contents`) so the ticket and the rack are grid items of the hero itself.
- **Alignment:** the ticket spans the first two grid rows from the top of the copy column, so its top edge sits on the H1's cap line (measured within 1px at 1024, 1280 and 1440). The desktop H1 is set smaller than the display ramp, 3.75rem and 4.25rem from 1440px at line-height 0.9, so the copy column stays no taller than the ticket. The rack sits in the copy column's second row, bottom-aligned, its bottom edge level with the perforation.
- **Overlap geometry:** the stub is `seam-stub` tall and the ticket runs `seam-lap` past the end of the field (a negative bottom margin). The field therefore ends 1.5rem (stub minus lap) below the perforation: the top 1.5rem of the stub (about a third) prints on the field, the rest on the counter, and both 14px notches stay on the field. The rack's bottom margin is the same 1.5rem ledge, which is what puts its bottom on the perforation line.
- **The counter under the copy:** from the third row a lip paints the counter full-bleed under the copy column (the hero clips it at its own edge), and the page's aside prints there in carbon ink.
- **Desktop ticket face:** the face prints roomier than on phones (header inset 1.25rem, body padding 1.75rem 1.5rem, a taller input) so the ticket is about as tall as the copy column. When the copy column is still taller, the paper grows to meet the seam and the spare stock collects above the perforation, never as a gap under the header rule.
- **Results:** everything the form prints after a claim lands on the counter. Void receipts, the compact void slip, the batch receipt and recent links stay in the ticket column, starting 4.25rem below the ticket (lap plus 1.5rem), with their ink pointed back to carbon and their notches filled with the counter. Single-pin, avatar, carousel, board and profile receipts, and the loading slip, are wide (`.rc--wide`): they span both columns below the aside, 1.5rem down.

### Reading pages (blog)
`src/pages/blog/[slug].astro`, `src/pages/blog/index.astro`, `src/styles/blog.css`.

- **Article masthead (field):** breadcrumbs (44px targets), title, lede (max 40rem), and a serial strip under a 2px on-field rule: the byline with a 36px white logo tile, then category · date · read time · word count in the serial voice. The cover is a photo print on paper (0.375rem paper margin, 6px corners, 16:9). Below 1024px the cover follows the text and hangs 3rem over the field's edge onto the reading sheet. From 1024px the masthead is `minmax(0,1fr) | minmax(0,28rem)` with a 3.5rem gap and the cover beside the title.
- **Reading sheet:** below 640px the paper sheet is full-bleed (it cancels the gutter) with 1rem side padding; from 640px it is inset with 2.5rem side padding and 6px bottom corners. From 1024px the body is a grid of `outline-rail` | `minmax(0, reading-column)` with a 2.5rem gap; the sheet takes all four 6px corners and 2.75rem 3rem 3rem padding, and the tool ticket follows it in the same column. From 1344px (84rem) a third column `minmax(15rem,18rem)` holds the tool ticket, sticky 1.5rem from the top, and the sheet column narrows to 42rem.
- **Outline:** printed only when an article has three or more H2s. From 1024px it is a sticky rail (1.5rem from the top, scrolling inside itself) with a gothic label over a 2px ink rule, dashed dividers, ink-2 links, and the current section in bold ink with an 8px ticket-red square, set as `aria-current` by an IntersectionObserver. Below 1024px it is a folded `details` at the top of the sheet between 2px ink rules, with a 48px summary whose chevron turns 180° in 200ms; following a link closes it.
- **After the article:** author slip, newer / older slips (two columns from 640px), a "More in …" paper ledger with dashed rows, a "Keep reading" rack of article tickets (four columns from 1024px), then the exit links.
- **Blog index:** masthead on the field (title and lede side by side from 1024px, `minmax(0,1fr) | minmax(0,26rem)`, bottom-aligned), category chips, then the featured article ticket pulled 3.5rem up across the field's edge, the rack (1 / 2 / 3 columns at 0 / 640 / 1024px, 1rem gap), and an ink back-channel panel.

### Named Rules
**The Fixed Seam Rule.** On desktop the ticket sets the seam at first paint and nothing moves it. Whatever the form prints after a claim (loading slip, receipts, voids, history) prints on the counter below the seam, never on the field.

## Elevation & Depth

Flat. All Tailwind shadow tokens are set to `none`. Depth is conveyed only by flat paper overlap: white paper on the stock field, white slips on the counter grey, the stub z-stacked above the ticket paper, and notches that reveal the field behind the perforation. The only `box-shadow` in the system is the 5px paper-coloured halo behind the focus outline, which is a focus aid, not elevation.

The strongest depth move is one sheet lying across the edge of the field: the desktop hero ticket crossing the seam onto the counter, the article cover hanging 3rem over the field onto the reading sheet on phones, and the featured article ticket pulled 3.5rem up onto the blog masthead. Punched notches show whatever ground the paper lies on (`--notch-fill`), so a receipt on the counter has counter-coloured holes. On a receipt the only scrim is the 28% carbon wash (45% on hover) over a video preview behind its "Play preview" tile.

### Named Rules
**The Paper Overlap Rule.** Depth is a sheet on a sheet. No drop shadows, no gradients, no blur. If something needs to stand out, change its stock or put it on paper.

**The Stub On Top Rule.** The tear-off stub is always the topmost layer of the ticket (z-index above paper; notches above both).

## Shapes

Die-cut, small-cornered stock. Radius scale is compressed: sm 2px, default 3px, md and lg 4px, xl 5px, 2xl 6px, 3xl 8px. The ticket is 6px on its outer corners only (top on the paper, bottom on the stub) with square joins at the perforation; inputs, chips, cards and nav pills are 4px; stamps 3px.

Recurring ticket geometry:
- **Perforation:** 3px dashed paper-coloured line on top of the stub; 2px dashed rule or white/20 lines divide content inside paper and on the dark footer. Wide receipts on desktop also split vertically at a 2px dashed rule, without notches.
- **Punched notches:** circles at both ends of a perforation, filled with the ground the paper lies on (`--notch-fill`, defaulting to the field): 28px (`notch`, 14px) on the claim ticket, 24px (`receipt-notch`, 12px) on receipts and the blog tool ticket, 20px on article tickets.
- **Rules:** 2px solid ink under the ticket header and above every counter section (the counter rule).
- **Inset perforation:** stock chips carry a 2px dashed outline inset 5px inside a 2px paper border.

## Components

### Claim Ticket (signature)
The form is a two-piece ticket: paper body and tear-off stub.
- **Header strip:** gothic label "Admit one · public link" left, serial right ("No. ——————" until a link is read, then the real pin ID), 2px ink rule below, inset 0.75rem from the paper edge (1.25rem in the desktop hero).
- **Body:** label row with the stamp or an ink-2 "expecting" hint, then the input row, then an ink-2 hint line. In the desktop hero the face is roomier (see Layout, Hero seam).
- **Perforation + notches** between body and stub.
- **Stub (primary action):** full-width carbon-ink button, `seam-stub` tall, gothic 900 at 1.625rem uppercase with a download icon. Hover: pure black with canary ink. Active: deep ticket red. Dark mode inverts to paper stub with carbon ink, canary on hover.
- **Tear motion:** while submitting, the stub hinges from its top-left corner and drops away (translate 6px, 18px; rotate -3.5deg; 560ms, cubic-bezier(0.16, 1, 0.3, 1)). Reduced motion: no transform, stub fades to 0.6 opacity.

### Claim Receipt (results)
What you collect at the counter: every extraction prints a paper receipt that visibly matches the ticket. Styles in `src/styles/results.css`; the shared parts (`Receipt`, `Specs`, `Perf`, `LineItem`, `Fill`) in `src/components/results/parts.tsx`; states in `DownloaderForm.tsx`.
- **Paper:** `receipt-paper`, no border, no shadow. It is a size container (`rc`), so container queries, not the viewport, lay out its inside and it reads in any column width.
- **Band:** `receipt-band`, inset 0.625rem inside the paper with its own 4px corners so it never melts into a same-stock field. It prints in the stock of what was collected, with that stock's ink: a gothic label with a 16px Lucide icon ("Ready · Video pin", "Ready · Carousel") on the left, and the ticket's own serial on the right (the pin ID, or `@username` for profiles).
- **Body:** title (system sans 700, 1.0625rem, clamped to 3 lines) and an ink-2 description (2 lines). The preview well is paper tint with 4px corners, 3:2 when narrow; from a 28rem container it moves beside the title at 3:4 in an 11.5rem column (15rem in wide receipts from 1280px). Avatars print square, at most 18rem.
- **Spec fields:** printed like a boarding pass under a 2px ink rule: gothic ink-2 labels, bold tabular values, fields split by 2px dashed rule dividers. `Specs` drops any field without a known value.
- **Quality:** radio chips (44px, 2px ink border, 4px corners), the checked one printed in ink, pixel sizes in tabular figures; label and radio share one hit target.
- **Collect button:** `collect-button`, the receipt's one primary action in the stub's voice, with a Lucide icon. Hover turns the ink canary; active is deep ticket red; dark mode prints it on paper with carbon ink, canary fill on hover. Under it an ink-2 note: "Saves as" and the filename (truncated with an ellipsis), or the live progress text.
- **Perforation:** a 2px dashed rule inset 1rem with `receipt-notch` notches at both paper edges, filled with whatever ground the receipt lies on.
- **Line items ("Also in this pin"):** a format block (gothic 900 in a 2px ink box with 3px corners, 3.25rem column), the file name with an ink-2 note, and an outlined Download button; dashed dividers between items. A failure for one file prints across the full width under that item.
- **Tools:** `receipt-button` outlined secondary buttons (Copy file link, Send to phone, Crop / resize, Trim sound), two up when narrow and a wrapping row from 28rem; the quiet "Download another" takes its own row when narrow and is pushed right from 28rem. The phone QR prints on a paper-tint well.
- **Extras:** one folded panel, "Colours, tags and repost captions" (48px summary, chevron turns in 200ms): palette swatches with tabular hex, tag chips on paper tint, a three-way segmented switch for the caption platform, and the caption on a paper-tint well.
- **Grids (carousel, board, profile):** tiles with 3:4 thumbnails (1:1 in the dense board/profile grid), a paper number tag ("01/05") top-left in tabular gothic, a kind stamp in the video or GIF stock bottom-right, a one-line title and a full-width "Save JPG / MP4" button. Columns follow the container: 2, then 3 from 28rem, 4 from 44rem, 5 from 62rem (dense: 3, 4, 5, 6). A profile's boards print as a ledger of 48px rows with dashed rules.
- **Wide receipts on the desktop counter:** a single pin splits 7fr / 5fr at a vertical dashed perforation: preview, title, specs and the collect button on the left; line items, tools, QR and extras on the right. Grid receipts put the title and specs on the left and the collect button on the right (`minmax(18rem,26rem)`), with the grid across the full width below.

States:
- **Loading:** an unprinted receipt in the wide footprint: band in paper tint with ink-2 "Fetching from Pinterest…" and the ticket's serial, and paper-tint blocks laid out like the single-pin receipt, pulsing from full to half opacity (900ms, alternating; static under reduced motion).
- **Ready:** the band prints in stock and the receipt feeds out of the printer top edge first (clip-path opening from 55% while it drops 10px, 520ms, cubic-bezier(0.16, 1, 0.3, 1)); focus moves to the receipt title. Reduced motion shows it at rest.
- **Saving:** the button keeps its label, swaps its icon for a spinner and prints a 5px progress strip in the receipt's stock along its bottom edge (each step eased over 240ms; when the size is unknown, a 30% strip sweeps back and forth over 1100ms, held still under reduced motion). The note under it becomes a progress bar. ZIP packing reads "Packing n of N files…" with a quiet Cancel.
- **Done, Packed, Partial:** a notice row led by a stamp. "Done" and "Packed" are OK stamps (Packed in the receipt's stock); "Partial" is a warn stamp, with the real packed and missing counts.
- **Failed download:** a "Void" warn-stamp notice beside the button that failed, announced as an alert.
- **Void receipt:** a failed extraction prints a warn "Void" stamp (1.0625rem, -3deg) beside a title for the error kind, the error message, an ink-2 hint, then "Try another link" (focus returns to the ticket) and, for wrong or private links, a quiet link to the guide. An empty submit prints a compact void slip: stamp plus one line.
- **Recent links:** only while idle: a paper slip with a gothic label over a grid (12rem minimum tracks) of 48px buttons, each with a 36px thumbnail and a 2px rule border that turns ink on hover.
- **Batch:** a receipt in the pin stock ("Ready · 3 pins") with a "Download all" collect button, then one row per file: 64px thumbnail, title, a kind tag in that file's stock, and its Download button.

### Step Illustrations
The three how-to illustrations on the homepage (copy the link, paste it into the ticket, tear the stub and collect the file).
- **Style:** flat miniatures of the live interface in the house palette: ticket-red field, paper, counter grey, carbon ink, canary as the pressed-state ink. Every label is Big Shoulders 800/900 uppercase; system sans appears only where the live UI uses it (the URL in the input, the "Pinterest link" label). Icons are Lucide paths, the set the UI uses. The drawn components match the real ones: header strip with its ink rule, focused input with the red stroke and a flat 25% ring, stamp at a slight tilt, dashed perforation with punched notches, carbon stub; in step 3 the stub hangs torn from its top-left corner like the live tear, with half-holes along both torn edges. Dashed carbon leads with arrowheads carry the action from one object to the next. The same flat two-tone pin print (arched mirror, vase, branch) is the pin copied in step 1 and the file collected in step 3, and the serial in step 2 is the example pin ID printed beside the section. No gradients, shadows or blur; in steps 1 and 3 the phone and the ticket bleed off the frame edge.
- **Source and render:** SVG sources in `src/assets/steps/step1.svg`, `step2.svg`, `step3.svg` (900 by 600 viewBox, cropped to fill). Render with `node scripts/render_step_art.mjs [--out <dir>] [--max-kb 40]`; it needs Playwright with Chromium, which is not a project dependency, so install it where Node can resolve it or set `PLAYWRIGHT_DIR` to a folder whose `node_modules` has it. The script embeds Big Shoulders from `public/fonts`, screenshots each SVG at exactly its target size at 1x, encodes WebP in Chromium (lossless when it fits the budget, otherwise the highest lossy quality that does) and checks the output dimensions. Outputs are `public/images/step1.webp` (859 by 573), `step2.webp` (881 by 575) and `step3.webp` (883 by 574). The sans text renders in the render machine's UI sans (the committed files were rendered on Linux).
- **Frame:** `HowToSteps.astro` prints the steps on one paper slip split by 2px dashed rules, each with a gothic 3rem step numeral in ticket red, and shows each illustration in a 3:2 well with 3px corners (`object-fit: cover`) on a ticket-red ground so a lazy load never flashes grey. The wells share one bottom edge whatever the step text length.

### Article Ticket (blog)
Each article in a rack prints as one linked ticket (`ArticleTicket.astro`): `article-ticket` paper, a cover inset 0.5rem (16:10, 3px corners), a header strip with the category label and the read time over a 2px ink rule, the title, a 3-line ink-2 excerpt, a dashed perforation with counter-coloured notches, and a stub row with the date and author in the serial voice. Hover lifts 2px and underlines the title (no lift under reduced motion). Below 640px it prints compact: a 6.25rem square thumbnail beside the title, no excerpt. The featured ticket on the blog index puts the cover beside the paper from 768px (1.35fr / 1fr) and sets its title in the headline size.

### Tool Ticket (blog)
The article's way back to the product (`ToolTicket.astro`): a small claim ticket (max 34rem, 24px notches) with "Try it on PintDownload" in the header and a stamp in the tool's stock, a short blurb on the face, and the tool name on a carbon stub with an arrow. Under it, an ink-2 hint and stock chips for the other core tools.

### Void Ticket (404 / 500)
Error pages print a voided claim ticket on the red field beside the H1: the status code as the ticket's serial and as a large gothic numeral on the face, a warn stamp naming the error, secondary links as outlined ink buttons on the face, and the way out ("Go home", "Try again") on the stub. Tool links below use the related-tool ticket.

### Stamp
A rubber stamp applied when a link is recognised: gothic 900 uppercase, 2px border, 3px corners, set at -2deg. **OK** stamps print in the detected URL type's stock with its on-colour ink and a carbon border. **Warn** stamps are transparent with ticket-red ink ("Void" on errors). Entry: scales from 1.35 and -6deg to rest in 380ms; reduced motion shows it at rest.

### Buttons
- **Primary:** the stub (above). There is one primary action per ticket.
- **Ink button:** carbon-ink fill, paper text, 4px corners, 44px minimum height, bold system sans 0.875rem with an optional inline icon (Paste, Copy). Hover goes to ticket red with white text.
- **Clear / icon buttons:** 44 by 44 minimum, ink-2 icon, hover to ink with a 5% black wash.
- **Segmented mode switch:** 2px ink border, 4px corners; pressed segment is ink fill with paper text.

### Stock Chips (the rack)
Links to each tool printed as small tickets in their own stock: 44px tall, 4px corners, bold 0.875rem system sans, 2px paper border, inset 2px dashed perforation at 35% ink. Hover lifts 2px (200ms). Current page prints in carbon ink with a white perforation. A chip matching the page's own stock prints on paper.

### Cards / Containers
- **Paper slip:** white paper on the counter, 4px corners, no border, no shadow, 16 to 24px padding. Used for FAQ items, embed panel, compare table wrapper.
- **Related-tool ticket:** paper slip with a 68px stub on the left in the tool's stock, separated by a 2px dashed paper perforation; the stub carries a short gothic badge rotated -90deg. Hover lifts 2px and underlines the title.
- **Ink panel:** carbon-ink panel with white text and 4px corners (bookmarklet), with dashed white/25 internal rules and a canary call-to-action.

### Inputs / Fields
- **Style:** 2px solid ink stroke, 4px corners, paper fill, 17px text (iOS zoom safe), the action button nested inside on the right.
- **Focus:** stroke turns ticket red plus a 3px 25%-red outline ring (focus-within on the row).
- **Placeholder:** placeholder grey on paper, `#8D929B` in dark.

### Navigation
- **Header:** sits on the page's field (or counter with a 2px ink bottom rule on counter pages), 64px / 72px tall. Logo is the image in a 40px white 4px-cornered tile plus a gothic wordmark.
- **Desktop links:** bold 0.95rem system sans, 4px corners, 8 by 12px padding; hover is a 10% black wash; current is ink fill with white text.
- **Mobile panel:** carbon-ink sheet under the header, 52px rows divided by dashed white/20 rules, hover to canary.
- **Footer + keyword matrix:** night counter ground, slate-300 links that go white and underline on hover, canary gothic column labels, dashed white/20 dividers.

### Ad Slot
Reserved, CLS-safe: paper-2 fill, 2px dashed rule border, 6px corners, a tiny uppercase "Advertisement" label; height fixed per breakpoint. Absent until configured.

## Do's and Don'ts

### Do:
- **Do** print every hero on a stock field via `field-*` and read `--field` / `--on-field` in components.
- **Do** take stock colours from `src/lib/stocks.ts`; one stock means one URL type.
- **Do** keep depth flat: paper on field, paper on counter, stub over paper.
- **Do** use carbon ink text on every stock except ticket red.
- **Do** keep radii at 2 to 6px; 4px is the default for controls and slips.
- **Do** keep the stub as the single primary action on a ticket, with 44px minimum targets elsewhere.
- **Do** honour reduced motion: the tear becomes a fade, the stamp appears at rest.
- **Do** print everything the form returns on desktop onto the counter below the seam: narrow results in the ticket column, wide receipts (`.rc--wide`) across both columns under the aside.
- **Do** give every receipt the ticket's serial and a band in the stock of what was collected, and keep its one primary action in the stub's voice.
- **Do** lay a receipt out with container queries so it reads the same in the ticket column, across the counter, or on a phone.
- **Do** re-render the step art from `src/assets/steps/*.svg` with `node scripts/render_step_art.mjs`, keeping the WebP names and pixel sizes.
- **Do** keep article prose in the system sans at 1.0625rem / 1.65, no wider than 68ch, on a paper sheet; the gothic frames it.

### Don't:
- **Don't** add drop shadows, gradients, glows or blur; the shadow tokens are `none` on purpose.
- **Don't** use a stock colour for decoration or for a URL type it does not belong to.
- **Don't** set paragraphs, inputs or long text in Big Shoulders.
- **Don't** print invented counters or vanity numbers; gothic numerals carry real values only.
- **Don't** use pill shapes or large rounded cards (rounded-full, 16px+ corners) for new surfaces.
- **Don't** let a result, notice or loading slip move the desktop seam or print on the field above it.
- **Don't** print a spec field whose value is not known; leave it out.
- **Don't** edit the step WebP files by hand; change the SVG source and re-render.
