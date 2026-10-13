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
    height: "68px"
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
**Serif:** Charter stack is configured for long-form blog prose only.

**Character:** A tall, condensed ticket-printing gothic shouts the claim in uppercase with tabular numerals; the system sans stays out of the way so the instructions read instantly on a phone.

Root size is 100% on phones and 106.25% from 768px. The Tailwind type scale is retuned: xs 0.8125, sm 0.9375, base 1.0625, lg 1.1875, xl 1.3125, 2xl 1.5, 3xl 1.875, 4xl 2.25, 5xl 3, 6xl 3.75 (rem), with line heights tightening from 1.65 to 0.95 as size rises.

### Hierarchy
- **Display** (900, 2.875rem phone to 5.75rem xl, line-height 0.88 to 0.9, uppercase): Hero H1 only, two lines, left-aligned on the field.
- **Headline** (900, 2.25rem to 3rem, line-height 0.95, uppercase): Section H2s on the counter, always sitting under a 2px ink counter rule. Tool-body H2s clamp(1.875rem, 4vw, 2.75rem).
- **Title** (system sans 700, 1.0625rem to 1.125rem, snug): Card titles, FAQ summaries, step titles.
- **Body** (system sans 400, 1.0625rem, 1.65): Ledes and paragraphs; FAQ answers capped at 68ch, ledes at max-w-xl.
- **Body small** (0.9375rem, 1.5): Hints, table cells, footer links.
- **Label** (gothic 800, 0.875rem, 0.08em tracking, uppercase): The ticket header ("Admit one · public link"), column labels in the hero aside and dark footer, table heads.
- **Serial** (gothic 800, 0.95rem, 0.04em, tabular): The pin-ID serial "No. 1120271…" in the ticket header.

### Named Rules
**The Printer's Gothic Rule.** Big Shoulders is used only uppercase and only for display, labels, serials, stamps and the stub. Never for paragraphs, inputs, or anything longer than a line or two.

**The Real Numerals Rule.** Gothic numerals print real values only (pin ID, step number, format, size), always with tabular figures.

## Layout

Container is `max-w-7xl` with 16 / 24 / 32px gutters (phone / sm / lg). Body sections use `max-w-6xl`, 48px vertical padding (64px from sm).

Hero: one column on phones (H1, lede, ticket full width minus the 16px gutter); from lg a two-column grid `minmax(0,1fr) | minmax(0,34rem)` with the ticket in the right column. The paste box is above the fold at every width. Hero top padding is deliberately tight on phones (12px) so the ticket lands in the first viewport.

Section heads are a two-column strip from lg: headline left, a short ink-2 lede right (`minmax(0,26rem)`), bottom-aligned, sitting under the counter rule. On tool pages everything collapses to a single left edge (`.tool-body`).

Grids: related tools 1 / 2 / 3 columns, 12px gap; footer and keyword matrix 1 / 2 / 4 columns. The stock rack is a wrapping flex row with 8px gaps.

Ad slots reserve their height up front (280px phone, 250px from 640px) and render nothing until an ad client is configured, so the layout never shifts.

## Elevation & Depth

Flat. All Tailwind shadow tokens are set to `none`. Depth is conveyed only by flat paper overlap: white paper on the stock field, white slips on the counter grey, the stub z-stacked above the ticket paper, and notches that reveal the field behind the perforation. The only `box-shadow` in the system is the 5px paper-coloured halo behind the focus outline, which is a focus aid, not elevation.

### Named Rules
**The Paper Overlap Rule.** Depth is a sheet on a sheet. No drop shadows, no gradients, no blur. If something needs to stand out, change its stock or put it on paper.

**The Stub On Top Rule.** The tear-off stub is always the topmost layer of the ticket (z-index above paper; notches above both).

## Shapes

Die-cut, small-cornered stock. Radius scale is compressed: sm 2px, default 3px, md and lg 4px, xl 5px, 2xl 6px, 3xl 8px. The ticket is 6px on its outer corners only (top on the paper, bottom on the stub) with square joins at the perforation; inputs, chips, cards and nav pills are 4px; stamps 3px.

Recurring ticket geometry:
- **Perforation:** 3px dashed paper-coloured line on top of the stub; 2px dashed rule or white/20 lines divide content inside paper and on the dark footer.
- **Punched notches:** 28px circles (notch 14px) at both ends of the perforation, filled with the field colour.
- **Rules:** 2px solid ink under the ticket header and above every counter section (the counter rule).
- **Inset perforation:** stock chips carry a 2px dashed outline inset 5px inside a 2px paper border.

## Components

### Claim Ticket (signature)
The form is a two-piece ticket: paper body and tear-off stub.
- **Header strip:** gothic label "Admit one · public link" left, serial right ("No. ——————" until a link is read, then the real pin ID), 2px ink rule below, inset 12px from the paper edge.
- **Body:** label row with the stamp or an ink-2 "expecting" hint, then the input row, then an ink-2 hint line.
- **Perforation + notches** between body and stub.
- **Stub (primary action):** full-width carbon-ink button, 68px tall, gothic 900 at 1.625rem uppercase with a download icon. Hover: pure black with canary ink. Active: deep ticket red. Dark mode inverts to paper stub with carbon ink, canary on hover.
- **Tear motion:** while submitting, the stub hinges from its top-left corner and drops away (translate 6px, 18px; rotate -3.5deg; 560ms, cubic-bezier(0.16, 1, 0.3, 1)). Reduced motion: no transform, stub fades to 0.6 opacity.

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

### Don't:
- **Don't** add drop shadows, gradients, glows or blur; the shadow tokens are `none` on purpose.
- **Don't** use a stock colour for decoration or for a URL type it does not belong to.
- **Don't** set paragraphs, inputs or long text in Big Shoulders.
- **Don't** print invented counters or vanity numbers; gothic numerals carry real values only.
- **Don't** use pill shapes or large rounded cards (rounded-full, 16px+ corners) for new surfaces.
