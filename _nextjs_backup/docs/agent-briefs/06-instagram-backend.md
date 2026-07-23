# Instagram Backend Brief

## Purpose
This brief is the Instagram-specific backend handoff. It focuses on two concrete problems in the current repo: missing engagement metadata and corrupted or unusable media URLs for reels/posts. Pair this with `02-architecture.md` and `04-backend-modules.md`.

## Current Repo Reality
Files involved:

- `src/services/extractors/instagram.ts`
- `src/services/extractors/browser-extractor.ts`
- `src/services/extractors/metadata-services.ts`
- `src/app/api/extract/route.ts`
- `src/app/api/download/route.ts`
- `src/app/preview/[id]/PreviewClient.tsx`
- `prisma/schema.prisma`

Current behavior:
- Instagram extraction tries browser interception first, then oEmbed, then third-party metadata services, then an embed fallback.
- The frontend preview often works because embed URLs or iframe rendering are enough.
- No engagement metadata is stored.
- The extracted `media_url` can be ephemeral, partial, signed, expiring, or otherwise unsuitable for direct replay/download.

## Known Problems

### Problem I1: No likes/shares/reposts/comments model
Why:
- `ExtractedData` has no engagement fields.
- `Content` schema has no columns or JSON field for platform metrics.
- API responses never expose engagement metadata.

Impact:
- The preview cannot show social proof even when the data is present somewhere in page metadata or scripts.

### Problem I2: Reel media is often corrupted or not playable
Why:
- `browser-extractor.ts` captures the first large CDN-like video response.
- That response may be:
  - a segment
  - a partial ranged response
  - a temporary signed URL
  - a stream variant that expires quickly
- The download proxy blindly fetches whatever URL is stored.

Impact:
- Saved records may contain a `media_url` that looks plausible but fails in the player or download route.

### Problem I3: Embed fallback path may build the wrong route
Why:
- The fallback always formats `https://www.instagram.com/p/${shortcode}/embed/`.
- Reels are not necessarily `p/` routes canonically.

Impact:
- Preview can still work sometimes, but route construction is not precise.

### Problem I4: Metadata extraction is too shallow
Why:
- oEmbed gives only limited public metadata.
- current code does not inspect structured page data deeply enough for engagement counts or author metrics.
- third-party metadata fallbacks are title/image-centric.

## Backend Goal
Make Instagram extraction split into two distinct layers:

- reliable preview metadata
- trustworthy direct media state

And add a clear place to store engagement metadata when recoverable.

## Required Backend Needs

### Need I1: Engagement metadata shape
Introduce a dedicated structure instead of overloading caption/tags:

```ts
type PlatformMetrics = {
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  reposts?: number | null;
  views?: number | null;
  author_name?: string | null;
  author_handle?: string | null;
}
```

Storage options:
- add nullable columns only for the fields you truly want to query, or
- add a JSON string field such as `platform_metrics`

Recommendation:
- use one JSON string field first for flexibility unless the frontend needs sortable counts immediately

### Need I2: Direct-media validation
Before persisting `media_url` as a downloadable/playable asset, validate that it is likely a real file:
- content type starts with `video/` or `image/`
- not a tiny init/segment response
- not obviously a manifest or HTML redirect
- optionally perform a second HEAD/GET validation step

If validation fails:
- store `media_url: null`
- keep `thumbnail_url`
- let frontend rely on embed/original-source mode

### Need I3: Separate preview capability from download capability
Instagram often supports embed preview but not stable download.

Recommended API semantics:
- `preview_mode: "instagram_embed" | "direct_video" | "image" | "external"`
- `download_available: boolean`

### Need I4: Better structured-data scraping
Browser extraction should inspect:
- `meta[property="og:*"]`
- `script[type="application/ld+json"]`
- in-page JSON bootstrap data if publicly accessible
- visible author/caption nodes after hydration

Goal:
- capture caption
- author
- thumbnail
- any recoverable counts

## Suggested Extraction Strategy
1. Normalize canonical Instagram URL while preserving shortcode.
2. Use browser mode to gather:
   - shortcode
   - author
   - caption
   - engagement hints
   - candidate media URLs
3. Score candidate media URLs instead of taking the first plausible one.
4. Validate the best candidate before storing it.
5. If no trustworthy direct asset exists, store only preview-safe fields and use embed fallback.

## Data Model Recommendations
If making schema changes:

```prisma
model Content {
  // existing fields...
  platform_metrics String?
  preview_mode     String?
}
```

Keep it modest unless there is a strong need for relational engagement analytics now.

## Frontend Coordination
Frontend should be ready to render:
- likes/comments/views when present
- empty social-proof state when metrics are unavailable
- an embed-first preview for Instagram reels/posts
- a non-download CTA if `download_available` is false

Frontend should not assume:
- all reels have a stable direct MP4
- missing metrics means extraction failed

## Testing Expectations
Test public examples across:
- reel URL
- post URL
- image post
- inaccessible or login-walled content

Verify:
- preview works
- stored `media_url` is either valid or null
- no obviously corrupt download attempts are exposed
- metrics field is null-safe

## Done When
- Instagram records can optionally carry engagement metadata.
- Invalid direct media URLs stop being stored as if they were good assets.
- Preview remains reliable through embed/thumbnail fallback.
- The backend contract clearly distinguishes "can preview" from "can download".
