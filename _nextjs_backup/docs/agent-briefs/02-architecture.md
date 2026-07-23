# viralNest Architecture

## Purpose
This document is the shared system contract for parallel agents. It connects product intent to implementation boundaries so frontend and backend agents can work independently without drifting apart.

## Runtime And Framework
- Framework: Next.js `16.2.4` using App Router under `src/app`.
- React: `19.2.4`.
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` and CSS variables in `src/app/globals.css`.
- Database: Prisma `5.22.0` with SQLite in local development.
- Backend shape: App Router route handlers in `src/app/api/**/route.ts`.
- Important local Next docs checked before writing this brief:
  - `node_modules/next/dist/docs/01-app/index.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

## Architectural Style
viralNest is a modular monolith:

- UI routes and API routes live in one Next app.
- Server Components perform database reads for first render.
- Client Components handle user input, browser APIs, animations, infinite scroll, and download clicks.
- Route handlers expose backend-for-frontend JSON and media streaming endpoints.
- Services under `src/services` own extraction, categorization, and recommendations.
- Prisma owns persistence through `src/lib/db/prisma.ts`.

## High-Level Flow
1. User enters a URL in the homepage `SearchBar`.
2. Frontend posts `{ url }` to `POST /api/extract`.
3. Backend validates URL and rate limit.
4. Backend normalizes `source_url` for dedupe and storage.
5. Backend returns an existing `Content` row if the URL was already extracted.
6. Backend detects platform and runs the matching extractor with fallback.
7. Backend normalizes tags, categorizes content, saves a `Content` row.
8. Frontend routes to `/preview/[id]`.
9. Preview page reads `Content`, increments popularity/view counters, fetches similar content, and renders `PreviewClient`.
10. Download button either opens the original source or calls `GET /api/download` with the direct media URL.

## App Router Conventions To Preserve
- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts` are special files.
- `route.ts` files belong under `src/app/api/**` and should not sit beside a `page.tsx` at the same segment.
- Pages and layouts are Server Components by default.
- Use `'use client'` only for components that need state, effects, event handlers, browser APIs, or animation libraries.
- Dynamic route props use promise-shaped `params` in the current codebase, for example `{ params }: { params: Promise<{ id: string }> }`.
- Route handlers can use `NextRequest` and `NextResponse`; route handlers are not cached by default.

## Current Directory Map
- `src/app/page.tsx`: homepage and extraction entry point.
- `src/app/feed/page.tsx`: trending feed.
- `src/app/feed/[category]/page.tsx`: category/tag feed.
- `src/app/preview/[id]/page.tsx`: server-side content load and recommendation load.
- `src/app/preview/[id]/PreviewClient.tsx`: interactive preview, embeds, download actions.
- `src/app/(seo)/**/page.tsx`: SEO landing pages.
- `src/app/api/extract/route.ts`: extraction and persistence endpoint.
- `src/app/api/content/route.ts`: paginated content listing endpoint.
- `src/app/api/content/[id]/route.ts`: content detail and stat mutations.
- `src/app/api/download/route.ts`: media proxy download endpoint.
- `src/components/ui/*`: reusable client UI components.
- `src/components/layout/*`: shared page chrome.
- `src/lib/constants.ts`: platform definitions, category taxonomy, SEO page config, shared numeric constants.
- `src/lib/db/prisma.ts`: Prisma client singleton.
- `src/services/extractor.ts`: platform detection and extractor registry.
- `src/services/extractors/*`: platform-specific extraction modules.
- `src/services/content-engine.ts`: tag normalization and categorization.
- `src/services/recommendation.ts`: similar content lookup.
- `prisma/schema.prisma`: database model.

## Persistence Model
`Content` is the central entity:

```ts
type ContentRecord = {
  id: string;
  platform: string;
  source_url: string;
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  tags: string; // JSON string array in SQLite
  category: string;
  created_at: Date;
  updated_at: Date;
  popularity_score: number;
  download_count: number;
  view_count: number;
  media_type: "video" | "image" | "carousel" | string;
};
```

Indexes currently support platform, category, created date, popularity score, and combined category/platform sorting by date.

## Shared API Contracts

### `POST /api/extract`
Request:

```json
{
  "url": "https://example.com/post"
}
```

Success:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "platform": "youtube",
    "source_url": "https://example.com/post",
    "media_url": "https://...",
    "thumbnail_url": "https://...",
    "caption": "Example caption",
    "tags": "[\"example\"]",
    "category": "education",
    "media_type": "video",
    "view_count": 1,
    "download_count": 0,
    "popularity_score": 0
  },
  "category": {
    "name": "Education",
    "slug": "education"
  },
  "cached": false
}
```

Error:

```json
{
  "error": "Human-readable error"
}
```

Notes:
- Invalid URL returns `400`.
- Rate limit returns `429`.
- Unexpected extraction failures return `500`.
- Duplicate source URLs return the existing content with `cached: true`.
- URL normalization must preserve platform identifiers, such as YouTube `?v=` values.

### `GET /api/content`
Query params:
- `category`: category slug or `all`.
- `platform`: platform id.
- `page`: 1-indexed page number.
- `limit`: default from `ITEMS_PER_PAGE`, max 50.
- `sort`: `trending`, `newest`, or `popular`.
- `search`: caption/tags substring search.

Success:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### `GET /api/content/[id]`
Success:

```json
{
  "data": {
    "id": "uuid"
  }
}
```

Notes:
- Increments `view_count`.
- Returns `404` when content is missing.

### `PATCH /api/content/[id]`
Request:

```json
{
  "action": "download"
}
```

Supported actions:
- `download`: increments `download_count` and `popularity_score`.
- `view`: increments `view_count` and `popularity_score`.

### `GET /api/download`
Query params:
- `url`: required direct media URL.
- `filename`: optional base filename.

Response:
- Streams media bytes with `Content-Disposition: attachment`.
- Returns JSON error for missing, invalid, unavailable, or failed media.

## Extractor Contract
Every platform extractor must implement:

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

type PlatformExtractorFn = (url: string) => Promise<ExtractedData>;
```

Extractor rules:
- Return best-effort metadata even if direct media is unavailable.
- Throw only when the whole extraction failed and fallback should run.
- Keep platform-specific scraping inside `src/services/extractors/*`.
- Do not import UI modules into services.
- Do not expose secrets to Client Components.

## Shared Taxonomy Contract
Platform ids live in `PLATFORMS` inside `src/lib/constants.ts`.

Current category slugs:
- `fitness`
- `startup`
- `design`
- `motivation`
- `entertainment`
- `education`
- `food`
- `travel`
- `technology`
- `fashion`
- `uncategorized` can be returned by the content engine but is not in the main `CATEGORIES` array.

If categories change:
- Backend must update categorization keywords.
- Frontend must update category cards and static params.
- SEO page config may need new landing pages.

## Frontend-Backend Connecting Dots
- Frontend should treat API response fields as nullable unless the schema guarantees otherwise.
- Backend should preserve existing field names using snake_case because frontend props already use them.
- Frontend can display `thumbnail_url`, `media_url`, `caption`, `platform`, `category`, `media_type`, `view_count`, `download_count`, and parsed `tags`.
- Backend stores `tags` as a JSON string; server pages should parse before passing to Client Components.
- Client Components must call route handlers instead of Prisma or service modules.
- Server Components may query Prisma directly for initial render.

## Ownership Boundaries
Frontend agent owns:
- Visual design, layout, page composition, client interaction states, reusable UI components, loading/empty/error states, SEO page presentation.

Backend agent owns:
- API behavior, validation, extraction reliability, database schema, Prisma access, rate limits, recommendations, content engine, operational concerns.

Shared files requiring coordination:
- `src/lib/constants.ts`
- `prisma/schema.prisma`
- API response shapes in `src/app/api/**`
- Serialized props passed into Client Components
- Any generated TypeScript types if introduced

## Parallel Work Rules
- Do not edit the same file from two agents unless explicitly coordinated.
- If frontend needs new backend data, add a small contract note before implementation.
- If backend changes response shape, update frontend brief and architecture doc.
- Avoid broad refactors while another agent is implementing feature work.
- Keep each PR focused by ownership area.

## Verification Expectations
Common checks:

```bash
npm run lint
npm run build
```

Backend-specific checks:

```bash
npm run db:push
npm run db:seed
```

Notes:
- `npm run build` runs `prisma generate && next build`.
- Browser-based extraction may require a host Chrome/Chromium and platform access.
- `yt-dlp` is noted in `README.md` as a system dependency for extraction service behavior, even though current route code uses platform modules and fetch/browser fallbacks.

## Known Risks
- In-memory rate limiting is not durable or multi-instance safe.
- SQLite is fine for local development but not production-scale writes.
- Social platforms often change markup, embeds, and API behavior.
- Direct download may not be possible for all supported platforms.
- Browser extraction can be slow or unavailable in serverless environments.
- `tags` as JSON string is pragmatic for SQLite but awkward for search and analytics.
- `twitter` is listed in constants but lacks a dedicated extractor.
