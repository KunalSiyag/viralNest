# Frontend Agent Brief

## Audience
This brief is designed for the frontend agent, planned as Gemini. It should be paired with `01-prd.md`, `02-architecture.md`, and `08-frontend-anime-poster.md`. The frontend agent should not need the full project conversation.

## Mission
Build and refine the user-facing viralNest experience while preserving backend contracts. The frontend should feel fast, reliable, and content-forward: paste a link, extract, preview, browse, and discover.

## Primary Ownership
Frontend owns:

- `src/app/page.tsx`
- `src/app/feed/page.tsx`
- `src/app/feed/[category]/page.tsx`
- `src/app/feed/loading.tsx`
- `src/app/preview/[id]/PreviewClient.tsx`
- `src/app/(seo)/**/page.tsx`
- `src/app/(seo)/layout.tsx`
- `src/app/layout.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/globals.css`
- `src/components/ThemeProvider.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/ui/SearchBar.tsx`
- `src/components/ui/ContentGrid.tsx`
- `src/components/ui/ContentCard.tsx`
- `src/components/ui/Skeleton.tsx`

Coordinate before editing:

- `src/lib/constants.ts`
- API route files under `src/app/api/**`
- Prisma schema or services under `src/services/**`

Do not edit unless explicitly asked:

- `prisma/dev.db`
- Backend extractor modules
- Database access patterns

## Current Frontend Surface
- Home page has hero, URL extraction search, trust indicators, and category cards.
- Feed page renders server-fetched trending items and hydrates `ContentGrid` for infinite scroll.
- Category feed renders matching category/tag content and static params from `CATEGORIES`.
- Preview page server-loads content and passes serialized props to `PreviewClient`.
- `PreviewClient` handles platform-specific embeds, direct video display, thumbnail fallback, download tracking, and similar content cards.
- SEO pages exist for targeted landing paths in `src/app/(seo)`.

## Design Direction
Use the existing visual system unless intentionally redesigning:

- Tailwind v4 and CSS variables live in `src/app/globals.css`.
- Core tokens include `--brand`, `--accent`, `--bg-*`, `--text-*`, `--border`, shadows, radii, transitions.
- Existing UI is card-based, rounded, gradient-accented, animated through Framer Motion.
- Keep layouts responsive for mobile and desktop.
- Keep loading, empty, unavailable, and error states polished.
- Prefer purposeful motion: page entrance, card stagger, state transitions.

For the intended redesign direction:
- Treat `08-frontend-anime-poster.md` as the primary visual brief.
- Shift away from the current generic SaaS gradient look.
- Rebuild the homepage, feed cards, and preview layout with poster-composition principles, stronger typography, cinematic framing, and collector-energy rather than dashboard-energy.

Frontend quality bar:

- Content should be scannable.
- Primary action should be obvious.
- States should not jump or collapse.
- Platform differences should be visible but not chaotic.
- Direct download unavailability should be handled gracefully.
- SEO pages should be useful, not thin duplicates.

## Next App Router Rules
- Pages and layouts are Server Components by default.
- Add `'use client'` only where state, effects, event handlers, browser APIs, or animation code require it.
- Do not import Prisma, extractors, or backend services into Client Components.
- Server pages may read Prisma for first render.
- Client Components should use route handlers through `fetch`.
- Dynamic page props currently use promise-shaped `params`.

## Shared Types To Respect
Use these frontend-facing item shapes unless the backend contract is intentionally updated:

```ts
type ContentGridItem = {
  id: string;
  platform: string;
  caption: string | null;
  thumbnail_url: string | null;
  media_type: string;
  view_count: number;
  download_count: number;
};

type PreviewContent = {
  id: string;
  platform: string;
  source_url: string;
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  category: string;
  media_type: string;
  view_count: number;
  download_count: number;
  tags: string[];
};
```

## API Contracts Used By Frontend

### Extraction
`SearchBar` calls an injected handler. The homepage handler posts to:

```ts
await fetch("/api/extract", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url }),
});
```

Expected success:

```ts
{
  success: true;
  data: { id: string };
  cached: boolean;
}
```

Frontend behavior:
- Show loading while request is pending.
- Show backend `error` message when present.
- Navigate to `/preview/${data.data.id}` on success.
- Do not assume extraction means direct download is available.

### Infinite Scroll
`ContentGrid` calls:

```ts
GET /api/content?page=2&sort=trending&category=fitness
```

Expected success:

```ts
{
  data: ContentGridItem[];
  pagination: {
    hasMore: boolean;
  };
}
```

Frontend behavior:
- Append new items.
- Stop when `hasMore` is false or no data comes back.
- Keep empty states friendly.
- Avoid duplicate keys.

### Download Tracking
`PreviewClient` calls:

```ts
PATCH /api/content/[id]
{ "action": "download" }
```

Then opens:

```ts
GET /api/download?url=<encoded media_url>&filename=<safe base filename>
```

Frontend behavior:
- If `media_url` is missing, open `source_url` instead.
- Download tracking should never block the user action.
- Keep `window.open` interactions tied to user intent to avoid popup blocking.

## Module Breakdown

### Module F1: Home And Extraction UX
Files:

- `src/app/page.tsx`
- `src/components/ui/SearchBar.tsx`

Responsibilities:
- URL input state.
- Platform hint based on pasted URL.
- Loading and error feedback.
- Call `POST /api/extract`.
- Navigate to preview page on success.
- Showcase categories and value proposition.

Acceptance criteria:
- Keyboard submit works.
- Invalid/missing URL does not trigger duplicate requests.
- Backend errors are readable.
- Button disabled/loading states are clear.
- Mobile input and button remain usable.

### Module F2: Feed And Discovery Grid
Files:

- `src/app/feed/page.tsx`
- `src/app/feed/[category]/page.tsx`
- `src/app/feed/loading.tsx`
- `src/components/ui/ContentGrid.tsx`
- `src/components/ui/ContentCard.tsx`
- `src/components/ui/Skeleton.tsx`

Responsibilities:
- Server-fetch initial content.
- Render responsive card grid.
- Support infinite scroll.
- Show ad slots at configured intervals.
- Show empty/end states.
- Preserve category and sort query params.

Acceptance criteria:
- Initial server-rendered content works without client fetch.
- Infinite scroll does not fire multiple concurrent requests.
- Cards work with missing thumbnail or caption.
- Feed remains usable at 320px wide and large desktop widths.

### Module F3: Preview And Download UI
Files:

- `src/app/preview/[id]/page.tsx`
- `src/app/preview/[id]/PreviewClient.tsx`

Responsibilities:
- Render platform badges, caption, category, stats, tags.
- Embed YouTube, Instagram, TikTok where possible.
- Render direct video or thumbnail fallback.
- Track and open downloads.
- Show similar content.

Acceptance criteria:
- Missing `media_url` falls back to original source.
- Missing `thumbnail_url` shows a designed fallback.
- Platform detection helpers are robust against common URL variants.
- Similar content section does not render when empty.
- Preview layout is strong on mobile and desktop.

### Module F4: SEO Landing Pages
Files:

- `src/app/(seo)/**/page.tsx`
- `src/app/(seo)/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/lib/constants.ts` only with coordination

Responsibilities:
- Build focused pages around platform and niche searches.
- Use meaningful metadata and page copy.
- Link users into extraction and relevant feeds.
- Avoid duplicated thin pages.

Acceptance criteria:
- Each SEO page has unique title, description, H1, and intent-specific copy.
- Calls to action route to extraction or feeds.
- Pages do not require client JS unless interactive.
- Sitemap and robots remain valid.

### Module F5: Visual System And Layout
Files:

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/ThemeProvider.tsx`

Responsibilities:
- Maintain tokens, surfaces, typography, color, shadows, radius, motion.
- Ensure dark/light theme behavior remains coherent.
- Keep shared layout stable across pages.

Acceptance criteria:
- CSS variables remain named and reusable.
- No unintentional horizontal scroll.
- Header/footer do not crowd small screens.
- Color contrast remains acceptable.

## Backend Requests Frontend May Make
If frontend needs more data, request it through `02-architecture.md` before implementing assumptions. Common possible requests:

- `download_available: boolean`
- `extraction_status` or progress polling
- `platform_display_name`
- `category_display_name`
- `dominant_tags`
- `related_reason`
- `created_at` serialized as ISO string

## Avoid These Frontend Pitfalls
- Do not read `tags` directly from the API response in Client Components unless it has been parsed into `string[]`.
- Do not assume `media_url` is playable or downloadable.
- Do not move all pages to Client Components just for convenience.
- Do not duplicate platform/category constants in many files if they should be shared from `src/lib/constants.ts`.
- Do not add browser-only code to Server Components.
- Do not change API response field names casually.

## Suggested Verification
Run:

```bash
npm run lint
npm run build
```

Manual smoke tests:
- Paste a URL on `/` and confirm navigation to `/preview/[id]`.
- Browse `/feed`.
- Browse `/feed/fitness`.
- Open preview with missing thumbnail/media if test data exists.
- Click download on content with and without `media_url`.
- Check mobile layout at narrow width.

## Handoff Notes To Backend Agent
Frontend depends on:
- Stable `id` after extraction.
- Stable snake_case field names.
- `GET /api/content` pagination with `hasMore`.
- Nullable media fields rather than omitted fields where possible.
- Human-readable JSON errors.
- A clear signal if future extraction becomes async.
