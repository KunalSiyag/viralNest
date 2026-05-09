# Backend Agent Brief

## Audience
This brief is designed for the backend agent, planned as GPT. It should be paired with `01-prd.md`, `02-architecture.md`, `05-youtube-backend.md`, `06-instagram-backend.md`, and `07-pinterest-backend.md`. The backend agent should not need the full project conversation.

## Mission
Make viralNest extraction, categorization, persistence, listing, recommendations, and downloads reliable while preserving the frontend contract. The backend should return useful best-effort content records even when direct media extraction is impossible.

## Primary Ownership
Backend owns:

- `src/app/api/extract/route.ts`
- `src/app/api/content/route.ts`
- `src/app/api/content/[id]/route.ts`
- `src/app/api/download/route.ts`
- `src/services/extractor.ts`
- `src/services/extractors/*`
- `src/services/content-engine.ts`
- `src/services/recommendation.ts`
- `src/lib/db/prisma.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`

Coordinate before editing:

- `src/lib/constants.ts`
- `src/app/**/page.tsx`
- `src/components/**`
- Serialized prop shapes passed into Client Components

Do not edit unless explicitly asked:

- `prisma/dev.db`
- Frontend visual files for unrelated backend work

## Current Backend Surface
- `POST /api/extract`: validates a URL, rate limits by IP, deduplicates by cleaned source URL, runs extractor pipeline, categorizes, and stores content.
- `GET /api/content`: paginated listing with category, platform, search, and sort filters.
- `GET /api/content/[id]`: returns one content item and increments views.
- `PATCH /api/content/[id]`: increments stats for `download` or `view`.
- `GET /api/download`: fetches remote media and streams as an attachment.
- `src/services/extractor.ts`: detects platform and dispatches to registry.
- `src/services/extractors/*`: Instagram, YouTube, Pinterest, TikTok, generic, metadata, browser helpers.
- `src/services/content-engine.ts`: normalizes tags and maps to categories.
- `src/services/recommendation.ts`: finds similar content.

Platform-specific deep dives:
- `05-youtube-backend.md`: downloader and canonical URL handling.
- `06-instagram-backend.md`: engagement metadata, usable media URLs, and reel reliability.
- `07-pinterest-backend.md`: hydrated media discovery and login-wall-safe fallback behavior.

## Next Route Handler Rules
- Route handlers live in `src/app/api/**/route.ts`.
- Supported methods are exported as uppercase functions such as `GET`, `POST`, and `PATCH`.
- Use `NextRequest` and `NextResponse` where helpful.
- Route handlers are not cached by default.
- Context params are async in current project style: `{ params }: { params: Promise<{ id: string }> }`.
- Do not place a `route.ts` beside a `page.tsx` for the same segment.

## Data Model Contract
Current Prisma model:

```prisma
model Content {
  id               String   @id @default(uuid())
  platform         String
  source_url       String   @unique
  media_url        String?
  thumbnail_url    String?
  caption          String?
  tags             String
  category         String   @default("uncategorized")
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  popularity_score Int      @default(0)
  download_count   Int      @default(0)
  view_count       Int      @default(0)
  media_type       String   @default("video")
}
```

Backend rules:
- Keep `source_url` unique.
- Store `tags` as JSON string unless schema migration is coordinated.
- Prefer nullable `media_url` and `thumbnail_url` over fake URLs.
- Keep `platform`, `category`, and `media_type` stable enough for frontend filters.
- Add migrations/schema changes only with frontend and architecture updates.

## Extractor Module Contract
Every extractor returns:

```ts
type ExtractedData = {
  platform: string;
  source_url: string;
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  tags: string[];
  media_type: "video" | "image" | "carousel";
};
```

Extractor behavior:
- Normalize/clean the URL as appropriate for duplicate detection and storage.
- Prefer public, stable metadata sources.
- Use layered fallbacks.
- Return partial metadata when direct media is blocked.
- Throw only when no useful extraction is possible and the caller should fallback.
- Log platform-specific failures without leaking secrets.

## Module Breakdown

### Module B1: Extraction API
Files:

- `src/app/api/extract/route.ts`
- `src/services/extractor.ts`

Responsibilities:
- Validate request with Zod.
- Apply rate limiting.
- Normalize source URL consistently.
- Check duplicate content.
- Detect platform.
- Run extractor with fallback.
- Normalize tags and categorize.
- Persist content.
- Return stable JSON response.

Acceptance criteria:
- Invalid URL returns `400`.
- Too many requests returns `429`.
- Duplicate URL returns existing record with `cached: true`.
- New URL returns saved content with `cached: false`.
- Extractor failure returns useful JSON error with `500`.
- No unhandled promise rejection for malformed input.

Recommended improvements:
- Move rate limiter to a small service.
- Add Upstash Redis rate limit option because dependency already exists.
- Use a shared URL normalization helper.
- Ensure clean URL behavior does not break platforms whose IDs live in query params, especially YouTube watch URLs.

Important note:
- Current `cleanUrl = url.split("?")[0]` may erase YouTube `?v=` identifiers. Treat URL normalization carefully before changing frontend behavior.

### Module B2: Platform Extractors
Files:

- `src/services/extractors/instagram.ts`
- `src/services/extractors/youtube.ts`
- `src/services/extractors/pinterest.ts`
- `src/services/extractors/tiktok.ts`
- `src/services/extractors/generic.ts`
- `src/services/extractors/metadata-services.ts`
- `src/services/extractors/browser-extractor.ts`

Responsibilities:
- Implement reliable extraction per platform.
- Keep fallback order explicit.
- Avoid blocking the whole request when one fallback fails.
- Keep media type accurate.
- Return thumbnail where available.

Acceptance criteria:
- YouTube works for `youtube.com/watch?v=`, `youtu.be`, and `/shorts/`.
- Pinterest works for public pin URLs with OpenGraph metadata.
- TikTok returns oEmbed/noembed metadata where available.
- Instagram returns useful embed/thumbnail/caption fallback even if direct media is blocked.
- Generic extractor works for standard OpenGraph pages.

Recommended improvements:
- Centralize timeout durations.
- Add platform-specific unit fixtures or smoke scripts.
- Remove or clearly separate debug test files from production extractor folder if they are not imported.
- Add dedicated X/Twitter extractor or remove `twitter` from supported claims until implemented.

### Module B3: Content Listing And Stats API
Files:

- `src/app/api/content/route.ts`
- `src/app/api/content/[id]/route.ts`

Responsibilities:
- Serve paginated content list.
- Filter by category and platform.
- Search caption and tags.
- Sort by trending, newest, popular.
- Fetch single content item.
- Increment view/download stats.

Acceptance criteria:
- `limit` is clamped to safe range.
- `page` is 1-indexed and safe against invalid numbers.
- Unknown sort falls back to newest.
- Missing content returns `404`.
- Unsupported stat action returns `400`.
- Frontend field names remain snake_case.

Recommended improvements:
- Add response DTO mapping to avoid leaking unwanted fields later.
- Add stricter action validation with Zod.
- Consider combining view increment behavior so `/preview/[id]` and `GET /api/content/[id]` do not double-count if both are used.

### Module B4: Download Proxy
Files:

- `src/app/api/download/route.ts`

Responsibilities:
- Validate `url`.
- Fetch media with timeout.
- Determine content type and extension.
- Sanitize filename.
- Stream bytes to client.
- Return meaningful JSON errors.

Acceptance criteria:
- Missing URL returns `400`.
- Invalid URL returns `400`.
- Upstream failure returns `502` when possible.
- Unexpected failure returns `500`.
- Response includes content type and content disposition.

Recommended improvements:
- Restrict protocols to `http:` and `https:`.
- Consider SSRF protections before production.
- Add max file size protection if content length is known.
- Consider HEAD check or range support later.

### Module B5: Content Engine
Files:

- `src/services/content-engine.ts`
- `src/lib/constants.ts` with coordination

Responsibilities:
- Extract tags from captions/title/description.
- Normalize tags.
- Map tags to category definitions.
- Return `uncategorized` when no useful match exists.

Acceptance criteria:
- Hashtags are captured.
- Common stop words are filtered.
- Duplicate tags are removed.
- Category scoring is deterministic.
- Unknown content does not crash categorization.

Recommended improvements:
- Tune keywords for actual target categories.
- Add phrase handling for multi-word categories.
- Add tests for category mapping.
- Consider storing raw extracted tags and normalized tags separately in a future schema.

### Module B6: Recommendations
Files:

- `src/services/recommendation.ts`

Responsibilities:
- Find similar content for preview pages.
- Prefer same category, platform, or overlapping tags.
- Exclude current content.
- Limit results to requested count.

Acceptance criteria:
- Missing content returns empty list.
- Similar result shape supports `ContentCard`.
- Query stays fast with existing indexes.
- Does not throw if `tags` JSON is malformed.

Recommended improvements:
- Add deterministic ranking by category, tag overlap, popularity, and recency.
- Add tests around empty database and malformed tags.

### Module B7: Database And Seeds
Files:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/db/prisma.ts`

Responsibilities:
- Maintain local SQLite schema.
- Provide seed data for frontend testing.
- Keep Prisma client singleton safe for dev hot reload.

Acceptance criteria:
- `npm run db:push` succeeds.
- `npm run db:seed` creates useful sample records.
- `npm run build` runs `prisma generate` successfully.

Recommended improvements:
- Add seed records across platforms/categories/media states:
  - with thumbnail and media URL
  - with thumbnail only
  - with no preview
  - uncategorized
  - popular/trending examples

## Shared Contract Stability
Do not change these without updating `02-architecture.md` and notifying frontend:

- Endpoint paths.
- Request body keys.
- Response field names.
- `Content` field names used by UI.
- Category slugs.
- Platform ids.
- Media type values.
- Pagination shape.

## Backend Risks And Mitigations
- URL normalization risk: do not strip query params blindly when they identify content.
- SSRF risk: download proxy and extractors fetch user-provided URLs.
- Rate limit risk: current Map is per-process only.
- Extraction fragility: platforms change often.
- Serverless risk: browser extraction and long fetches may exceed runtime limits.
- Data quality risk: OpenGraph metadata may be thin or misleading.
- Duplicate count risk: preview page and API detail endpoint both increment views.

## Suggested Verification
Run:

```bash
npm run lint
npm run build
```

Database checks:

```bash
npm run db:push
npm run db:seed
```

Manual API smoke tests:

```bash
curl -s -X POST http://localhost:3000/api/extract \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

curl -s 'http://localhost:3000/api/content?page=1&limit=5&sort=trending'

curl -s -X PATCH http://localhost:3000/api/content/CONTENT_ID \
  -H 'Content-Type: application/json' \
  -d '{"action":"download"}'
```

If network access or platform blocking prevents extraction tests, document which platform failed and whether the failure was network, upstream HTTP, timeout, parsing, browser, or app logic.

## Handoff Notes To Frontend Agent
Frontend can rely on:
- `POST /api/extract` returning `data.id` on success.
- Content list items having `id`, `platform`, `caption`, `thumbnail_url`, `media_type`, `view_count`, and `download_count`.
- `media_url` being nullable.
- Human-readable `error` in JSON failures.
- `pagination.hasMore` for infinite scroll.

Frontend should not rely on:
- Direct media URLs for Instagram/TikTok.
- Every thumbnail URL being valid forever.
- `tags` being parsed in raw API responses unless server page converted it.
- Platform APIs staying stable.
