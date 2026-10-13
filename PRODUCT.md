# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: people on a phone who arrive from a Google search with one public Pinterest link and want a real file (MP4, JPG/PNG, GIF, or ZIP) saved to their camera roll or Downloads in seconds, then leave. Confirmed mobile-first.
Secondary: creators, students, DIY makers and travelers who keep offline references, and readers of the blog's how-to and creator-money guides.

## Product Purpose
PintDownload is a free web tool that turns a public Pinterest URL into a downloadable file. Success: paste → preview → saved file on the first try, with no account, no install, and no dead end when a link type is wrong or unsupported.

## Positioning
Accurate per-URL-type tools instead of one generic box: single pin (image / video / GIF / carousel), HD video to MP4, board → ZIP, profile → ZIP, profile picture (PFP/DP) in HD, plus audio extraction and a bookmarklet. Public content only, honestly stated; no fake "4K".

## Operating Context
- Visitors land on keyword-specific tool pages from search far more than on the homepage; every tool page must work as a landing page with the paste box above the fold.
- Copy-link-from-Pinterest-app → paste → save is the core ritual (Share → Copy link; `pin.it` short links).
- Bookmarklet for desktop browsers; embeddable widget (`/embed`) for third-party sites.
- Blog (Medium-style long-form guides) and an `llms.txt` serve discovery.

## Capabilities and Constraints
- Astro 5 static output + React islands, Tailwind 3, deployed as a Cloudflare Worker. API routes: `/api/extract`, `/api/download`, `/api/extract-caption`, `/api/generate-seo`.
- i18n via client-side language selector (`src/lib/i18n*`).
- Private/secret boards and pins are out of scope.
- SEO is the primary acquisition channel: canonical URLs (no trailing slash), JSON-LD, sitemap, RSS, IndexNow, `seo_health_check.py` runs after every build and `tests/seo-invariants.test.mjs` guards invariants.
- Monetization: ad placements must be reservable without layout shift. No ad network is wired up yet.

## Brand Commitments
- Name: **PintDownload**, domain `pintdownload.app`. Keep.
- Logo mark: `public/images/logo.svg` / `logo.png` (pin-shaped download mark). Keep.
- Palette and typography: open (user released the rose `#E11D48` accent for redesign).
- Voice: plain, honest, practical; "public only", "credit creators", "not affiliated with Pinterest Inc."

## Evidence on Hand
- Product screenshots/step art: `public/images/step1–3.webp`, bookmarklet art `bookmark.webp`, sample pin photos `side_pin_*.webp`, OG cards.
- Blog covers in `public/images/blog/`.
- No testimonials, user counts, ratings, press, or benchmarks exist. Do not fabricate any.

## Product Principles
1. The paste box is the product: first viewport, every tool page, every device.
2. Match the URL to the right tool; explain wrong-link cases instead of failing silently.
3. Honest scope: public only, real quality, credit creators.
4. Fast and light beats decorative: mobile networks, Core Web Vitals, no layout shift (including ads).
5. Every page leaves a next step: related tool, guide, or retry path.

## Accessibility & Inclusion
WCAG 2.2 AA minimum; project AGENTS.md rules (visible focus, ≥44px touch targets, 16px inputs, reduced motion, skip link) are binding.
