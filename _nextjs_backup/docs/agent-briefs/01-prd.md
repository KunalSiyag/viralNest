# viralNest PRD

## Purpose
viralNest is a content discovery and saving engine for viral media links. Users paste links from social platforms, the app extracts useful metadata and playable or downloadable media when available, categorizes the content, stores it, and turns the saved library into browsable SEO-friendly feeds.

This document is the product source of truth. Parallel implementation agents should use it to understand what the product is trying to become before reading implementation-specific docs.

## Product Idea
People collect useful clips, reels, pins, shorts, and posts across many platforms, but those links are scattered and hard to reuse. viralNest creates a personal and public discovery layer on top of those links:

- Paste a supported social/content URL.
- Extract metadata, thumbnail, captions, tags, and media references.
- Auto-categorize the item into useful topic feeds.
- Preview the content in-app where possible.
- Download media when a direct downloadable asset is available.
- Browse and discover similar/trending items through category and platform feeds.
- Generate SEO landing pages around platform and niche use cases.

## Target Users
- Creators saving viral examples for inspiration.
- Marketers researching hooks, trends, offers, and formats.
- Founders and builders collecting startup, design, or growth content.
- Fitness, food, travel, fashion, education, and entertainment curators.
- Casual users who want a cleaner way to preview and revisit media links.

## Core Jobs To Be Done
- As a user, I can paste a link and quickly know whether viralNest can extract it.
- As a user, I can preview saved content with caption, platform, tags, category, and stats.
- As a user, I can download media when the backend has a direct media URL.
- As a user, I can browse trending, newest, popular, platform, and category feeds.
- As a user, I can discover related content from the same category or tag family.
- As an operator, I can add new platforms and categories without rewriting the app.
- As an operator, I can grow organic traffic through focused SEO pages.

## In Scope
- Current app shell using Next App Router under `src/app`.
- Extraction endpoint at `POST /api/extract`.
- Content listing endpoint at `GET /api/content`.
- Content detail/stat endpoint at `GET/PATCH /api/content/[id]`.
- Download proxy endpoint at `GET /api/download`.
- Prisma `Content` model backed by SQLite for local development.
- Platform-specific extractor modules for Instagram, YouTube, Pinterest, TikTok, and generic OpenGraph fallback.
- Category taxonomy and tag normalization in `src/services/content-engine.ts`.
- Feed, category, preview, landing, and reusable content card/search UI.
- AdSense placeholder slots as layout positions, not full monetization integration yet.

## Out Of Scope For Current Parallel Pass
- User accounts, auth, teams, folders, or private collections.
- Creator profile pages.
- Full moderation workflow.
- Paid plans or billing.
- Native mobile apps.
- Browser extension.
- Guaranteed direct download for platforms that intentionally hide or protect media URLs.
- Circumventing platform restrictions or DRM.

## Product Principles
- Fast first success: extraction UX should feel instant even when backend fallbacks are doing heavy work.
- Honest capabilities: if direct download is unavailable, route users to preview or original source rather than pretending download works.
- Content engine first: every extracted item should become searchable, categorized, and reusable.
- SEO by design: category and platform pages should have clean metadata, crawlable content, and useful page copy.
- Modular platform support: each new platform should fit the existing extractor interface.
- Respect boundaries: frontend must not import backend-only services or Prisma into Client Components.

## Current Product Surface
- Home page at `/` with paste/extract hero and category exploration.
- Feed at `/feed` for trending content.
- Category feed at `/feed/[category]`.
- Preview page at `/preview/[id]`.
- SEO route group at `src/app/(seo)` for landing pages.
- Global layout, theme provider, header, footer, error, not-found, robots, and sitemap files.

## Supported Platforms
- Instagram: browser extraction, oEmbed, metadata service fallback, embed fallback.
- YouTube: public oEmbed and known thumbnail URL patterns.
- Pinterest: OpenGraph scraping and metadata service fallback.
- TikTok: oEmbed, noembed, metadata service fallback.
- Unknown/generic sites: OpenGraph fallback.
- X/Twitter exists in constants but does not currently have a dedicated extractor.

## Success Metrics
- Extraction completion rate by platform.
- Median extraction time by platform.
- Percentage of saved items with thumbnail.
- Percentage of saved items with direct media URL.
- Preview page visits.
- Download button clicks and successful proxy responses.
- Feed scroll depth.
- SEO landing page impressions and click-through rate.
- Database duplicate-hit rate for cached extractions.

## MVP Acceptance Criteria
- A user can paste at least one valid public URL from YouTube, Pinterest, TikTok, Instagram, or a generic OpenGraph page.
- Extraction creates or returns one `Content` record with stable `id`, `source_url`, `platform`, `caption`, `tags`, `category`, `media_type`, and thumbnail/media fields when available.
- Duplicate URLs return the existing record instead of creating duplicates.
- `/preview/[id]` renders the content, increments views, and provides original-source fallback.
- `/feed` and `/feed/[category]` render server-fetched initial content and client-side infinite scroll.
- UI handles loading, empty, error, and unavailable-preview states without breaking layout.
- Backend returns JSON errors with appropriate HTTP status codes for invalid input, rate limits, missing content, and failed extraction.

## Agent Context Strategy
Use these files as the handoff pack:

- Read this PRD first for product intent.
- Read `02-architecture.md` for shared contracts and system boundaries.
- Give `03-frontend-modules.md` to the Gemini frontend agent.
- Give `04-backend-modules.md` to the GPT backend agent.

Agents should not need the entire conversation. They should only need this PRD, the architecture doc, and their module brief.

## Coordination Rules
- Keep API response shapes compatible with the architecture doc.
- If a backend change alters a shared contract, update `02-architecture.md` and `03-frontend-modules.md` in the same PR.
- If a frontend change requires new data, add it as an explicit backend contract request instead of reading database internals client-side.
- Avoid cross-agent edits to the same files. Use the ownership tables in the module docs.
- Preserve the user's existing `prisma/dev.db` state unless explicitly asked to reset or regenerate it.
