# Pinterest Backend Brief

## Purpose
This brief is the Pinterest-specific backend handoff. It addresses the mismatch between the current server-side OG scrape and Pinterest's real-world behavior, where useful media often appears only after hydration or behind login prompts. Pair this with `02-architecture.md` and `04-backend-modules.md`.

## Current Repo Reality
Files involved:

- `src/services/extractors/pinterest.ts`
- `src/services/extractors/metadata-services.ts`
- `src/services/extractors/browser-extractor.ts` if reused later
- `src/app/api/extract/route.ts`
- `src/app/preview/[id]/PreviewClient.tsx`

Current behavior:
- The extractor fetches the pin URL as HTML and looks for OG tags.
- If that fails, it tries Microlink/jsonlink.
- If that fails, it stores a minimal fallback.

Problem reported by the product owner:
- On pins like `https://in.pinterest.com/pin/297378381667202179/`, the page can load and reveal media only after client-side work.
- Some useful media paths become visible only after login or hydration.

## Known Problems

### Problem P1: Static OG fetch is too optimistic
Why:
- `fetch(cleanUrl)` only sees initial HTML.
- Pinterest often hydrates richer data client-side.
- The media that users care about may not be exposed in the first response HTML.

### Problem P2: Logged-out and logged-in behavior differ
Why:
- Pinterest can gate parts of the experience with login prompts.
- Server fetch and metadata providers may receive a thinner version of the page than a browser session would.

### Problem P3: Current extractor conflates image fallback with real video/download availability
Why:
- It may store `image` as `media_url` when there is no direct video asset.
- That is not wrong for image pins, but it blurs the difference between poster art and real media payload for richer pins.

## Backend Goal
Make Pinterest extraction robust and honest:

- extract useful pin metadata for public pins
- detect when richer media needs browser hydration
- avoid claiming direct asset availability when only poster imagery is known
- degrade cleanly when login walls block real media access

## Required Backend Needs

### Need P1: Hydrated browser fallback for Pinterest
Add or reuse a browser-based flow for Pinterest, separate from Instagram-specific assumptions.

Browser fallback should:
- open the pin page in a real browser context
- wait for network idle or a bounded hydration window
- inspect DOM, JSON script blobs, and network responses
- collect candidate image/video URLs
- extract title/description if present

Important:
- this should be a Pinterest path, not a side effect of the Instagram extractor

### Need P2: Candidate asset scoring
When multiple assets appear:
- prefer original-quality image/video assets
- avoid tiny sprites, avatars, or UI images
- distinguish poster image from downloadable video

Recommended scoring signals:
- content type
- resolution hints in URL or metadata
- response size
- pin-type hints
- OG/video tags

### Need P3: Explicit login-wall-safe fallback behavior
If the backend cannot safely recover a direct asset without login:
- store `media_url: null`
- keep `thumbnail_url` and caption if possible
- preserve `source_url`
- mark `preview_mode` as `image` or `external`

### Need P4: Better metadata capture
Try to capture:
- pin title
- description
- creator/board name if public
- thumbnail/poster image
- media type
- direct video only when validated

## Suggested Extraction Pipeline
1. Canonicalize the pin URL.
2. Attempt static OG/HTML extraction.
3. Attempt metadata-service fallback.
4. If metadata is incomplete or indicates richer media, run browser hydration fallback.
5. Validate any candidate direct asset before storing.
6. Return a minimal but honest record when the login wall wins.

## Data And Contract Recommendations
Preferred frontend-safe fields:

```ts
type PinterestAssetState = {
  source_url: string;
  thumbnail_url: string | null;
  media_url: string | null;
  media_type: "image" | "video" | "carousel";
  preview_mode?: "direct_video" | "image" | "external";
  download_available?: boolean;
}
```

This keeps Pinterest from looking "broken" when only preview imagery is recoverable.

## Frontend Coordination
Frontend should support:
- beautiful image-first Pinterest preview cards
- a direct media player only when backend validated a real asset
- `View Original` or `Open Pin` CTA when download is unavailable
- no assumption that every Pinterest pin resolves to downloadable video

## Testing Expectations
Test at least:
- public image pin
- public video pin if available
- locale-specific pin URL like `in.pinterest.com`
- pin that shows richer media only after hydration
- pin with login gate behavior

Verify:
- no fake playable URL is stored
- thumbnail fallback remains useful
- category/tag extraction still works
- locale domains are detected consistently

## Done When
- Pinterest extraction no longer depends solely on static OG tags.
- Hydrated media discovery is part of the plan.
- Login-gated cases degrade to honest preview/original-link behavior instead of broken downloads.
