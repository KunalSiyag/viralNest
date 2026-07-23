# Frontend Anime Poster Brief

## Purpose
This brief is the visual and UX direction for the frontend agent. The goal is to turn viralNest from a clean SaaS-style tool into an anime-poster-style content destination without losing extraction clarity. Pair this with `03-frontend-modules.md`.

## Core Creative Direction
The site should feel like a streaming poster wall, collector archive, and season-launch key visual all at once.

Target mood:
- cinematic
- high-contrast
- dramatic
- youthful
- collectible
- slightly obsessive in a good way

This is not:
- a generic startup landing page
- a flat dashboard
- pastel productivity UI
- a standard card grid with purple gradients

## What In The Current Repo Must Change
Current repo feel:
- rounded SaaS cards
- generic hero gradient
- utility-first trust badges
- standard category tiles
- preview page reads like a product details page

Needed shift:
- stronger art direction in `src/app/globals.css`
- more editorial home page composition in `src/app/page.tsx`
- poster-like feed cards in `src/components/ui/ContentCard.tsx`
- a more dramatic preview page in `src/app/preview/[id]/PreviewClient.tsx`
- consistent visual language across header, footer, skeletons, and SEO pages

## Visual Language

### Color System
Move away from the current purple-led default.

Preferred palette behavior:
- paper or off-white base, or deep ink base, but with warm contrast
- red, amber, black, ivory, and electric blue as primary accents
- category colors should feel like genre banners, not random gradients
- keep each platform badge legible but integrated into the larger poster palette

Suggested token direction:
- `--brand`: crimson or vermilion, not violet
- `--accent`: amber, gold, or electric cyan
- `--bg-*`: poster-paper tones or cinema-dark tones
- `--text-*`: high-contrast ink/ivory pairings

### Typography
Avoid default modern SaaS typography.

Direction:
- display type should feel like a title card or manga volume cover
- body type can stay readable, but the headline system must carry attitude
- strong uppercase labels
- tighter, more intentional line breaks on hero headings

Implementation note:
- if custom fonts are added later, keep fallback stacks intentional and expressive

### Composition
Think in poster layers:
- foreground title
- supporting subtitle
- diagonal or stacked supporting elements
- framed artwork/media area
- badges and metadata as stamped labels, not chips floating in whitespace

Avoid:
- too much centered floating whitespace
- bland evenly spaced modules with no hierarchy

### Motion
Motion should feel like reveal and spotlight, not generic hover polish.

Use:
- staggered poster reveal on home/feed
- image parallax or slight scale drift on cards
- masked title reveals
- subtle light sweep or grain shimmer

Avoid:
- overusing bounce
- tiny micro-animations on every element

## Page-Specific Needs

### Home Page
Files:
- `src/app/page.tsx`
- `src/components/ui/SearchBar.tsx`

Needs:
- hero should feel like a feature poster or launch banner
- search bar should look like a command console stamped into the poster, not a normal rounded form field
- categories should feel like genre panels or season tags
- add a stronger art/collector narrative:
  - "extract"
  - "archive"
  - "screen"
  - "download where available"

Layout direction:
- split composition is acceptable
- asymmetry is welcome
- include one dominant focal region instead of equally weighted blocks

### Feed
Files:
- `src/app/feed/page.tsx`
- `src/app/feed/[category]/page.tsx`
- `src/components/ui/ContentGrid.tsx`
- `src/components/ui/ContentCard.tsx`

Needs:
- cards should feel like anime or film posters pinned to a wall
- maintain readable metadata while emphasizing imagery
- allow title overlay, grain, edge borders, genre ribbons, ranking stamps
- preserve infinite scroll but make loading feel like "next posters loading in"

Card behavior:
- portrait ratio is already useful and should be kept or emphasized
- hover state should intensify focus, not merely add a soft shadow
- missing images should still feel designed, like a placeholder poster frame

### Preview Page
Files:
- `src/app/preview/[id]/PreviewClient.tsx`

Needs:
- treat the media preview as the centerpiece
- make side metadata feel like credits, tags, and collector annotations
- platform/category pills should become stronger labels or stamps
- stats should look like poster metadata or issue details, not dashboard rows
- similar content should feel like "more from this arc" or "related posters"

Important UX note:
- the page must still communicate when download is unavailable
- that state should feel intentional, not like a failure

### SEO Pages
Files:
- `src/app/(seo)/**/page.tsx`
- `src/app/(seo)/layout.tsx`

Needs:
- maintain the same art direction at a lighter weight
- avoid template-looking SEO pages
- each page should have a clear visual hook tied to its niche:
  - Instagram reels
  - Pinterest downloads
  - Fitness reels
  - Startup reels

## Component-Level Requirements

### SearchBar
Current issue:
- looks like a polished SaaS input

Needed:
- stronger frame
- sharper silhouette or inset panel treatment
- platform indicator feels like a badge/lightbox marker
- error states look like alert banners, not plain red text

### ContentCard
Current issue:
- standard rounded hover card

Needed:
- poster framing
- stronger image dominance
- compressed metadata
- top-corner badges that feel like classification labels
- a designed fallback when thumbnail is missing

### Header And Footer
Current issue:
- likely utility shell behavior

Needed:
- header should feel like a masthead
- footer should feel like end credits or archive notes
- less generic nav bar, more branded frame

### Skeletons
Needed:
- loading state should resemble masked poster placeholders
- shimmer should feel like light passing across print or film

## Functional Constraints
- Keep desktop and mobile both first-class.
- Do not hurt extraction flow clarity for the sake of style.
- Do not bury the main CTA.
- Do not require frontend to guess backend download capability.
- Keep iframes/video embeds contained inside strong frames.
- Ensure text contrast stays readable over media-heavy backgrounds.

## Frontend-Backend Coordination Needs
The anime-poster UI benefits from a few backend fields if available:
- `download_available`
- `preview_mode`
- `platform_metrics` or parsed engagement counts
- cleaner distinction between thumbnail, preview asset, and downloadable asset

If these are not available yet:
- design the UI to degrade gracefully
- use `source_url` as the original-destination action
- use `thumbnail_url` and embed-first preview modes heavily

## Acceptance Criteria
- Home page no longer reads like a generic SaaS landing page.
- Feed cards feel collectible and image-led.
- Preview page feels like a hero poster detail view.
- The new style still supports loading, empty, error, and unavailable-download states.
- Mobile layout keeps the poster drama without becoming cramped or unreadable.
- The main extraction action remains obvious above the fold.

## Done When
- A frontend agent can redesign the site with this brief alone plus `03-frontend-modules.md`.
- The design direction is distinct, repeatable, and tied to real repo files.
- The resulting site can still plug into the current backend contract while being ready for richer asset-state fields later.
