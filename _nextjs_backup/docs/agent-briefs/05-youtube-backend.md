# YouTube Backend Brief

## Purpose
This brief is the YouTube-specific backend handoff. It exists because YouTube currently previews correctly in the frontend but does not actually support downloading in a meaningful way. Pair this with `02-architecture.md` and `04-backend-modules.md`.

## Current Repo Reality
Files involved:

- `src/services/extractors/youtube.ts`
- `src/app/api/extract/route.ts`
- `src/app/api/download/route.ts`
- `src/app/preview/[id]/PreviewClient.tsx`

Current behavior:
- The extractor uses YouTube oEmbed and thumbnail URL patterns.
- `media_url` is set to a watch URL like `https://www.youtube.com/watch?v=...`.
- The preview works because the frontend extracts the ID and embeds YouTube in an iframe.
- The downloader fails because `/api/download` fetches the `media_url`, which is an HTML page, not a direct downloadable media asset.

## Known Problems

### Problem Y1: Downloader is conceptually broken
Why:
- `media_url` is not a media file.
- `/api/download` expects a direct asset URL that can be streamed as bytes.
- Fetching a watch page through the download proxy returns HTML or an upstream error, not a valid MP4/WebM file.

### Problem Y2: Duplicate normalization may break watch URLs
Why:
- The shared extraction route currently strips query params via `url.split('?')[0]`.
- A YouTube watch link stores the video ID in `?v=...`.
- This can turn a valid watch link into `https://www.youtube.com/watch`, which is not the original asset identity.

### Problem Y3: Data contract mixes preview URL and downloadable URL
Why:
- One field, `media_url`, is being asked to do two jobs:
  - a playable/original reference
  - a direct downloadable asset
- That works for some platforms but not for YouTube.

## Backend Goal
Make YouTube behavior honest and consistent:

- Preserve YouTube preview and metadata extraction.
- Stop pretending the watch URL is a downloadable media asset.
- Normalize URLs in a way that preserves canonical video identity.
- Expose enough state for frontend to show "Watch" or "Open on YouTube" instead of a broken download flow when no direct asset is available.

## Recommended Contract Changes

### Preferred shape
Add explicit semantics instead of overloading `media_url`:

```ts
type ExtractionAssetState = {
  source_url: string;
  media_url: string | null;
  download_available: boolean;
  preview_mode: "embed" | "direct_video" | "image" | "external";
}
```

Minimum acceptable fallback if schema/API must stay small:
- Set `media_url` to `null` for YouTube.
- Keep `source_url` as the canonical watch URL.
- Let frontend use `source_url` for embed extraction and original-link behavior.

## URL Normalization Rules
Canonicalize by platform, not by naive query stripping.

For YouTube:
- Keep `v` for `youtube.com/watch?v=...`
- Preserve `youtu.be/<id>`
- Preserve `/shorts/<id>`
- Drop tracking params like `si`, `feature`, `pp`, `list` only when they are not required for identity
- Normalize to one canonical stored format if desired:
  - long form watch URL, or
  - short form, but consistently

## Required Backend Needs

### Need Y1: Shared URL normalizer
Create a backend-only URL normalization helper used by:
- `src/app/api/extract/route.ts`
- `src/services/extractor.ts`
- future dedupe and test code

Acceptance:
- Different forms of the same YouTube video dedupe correctly.
- Different videos do not collapse into the same stored URL.

### Need Y2: Download capability flag
Expose whether a platform/item supports direct download.

Acceptance:
- YouTube records clearly report no direct asset unless backend actually resolves one.
- Frontend no longer hits `/api/download` with a YouTube watch URL.

### Need Y3: Better metadata from YouTube
Current extractor is acceptable for title/author/thumb, but the brief should guide future enrichment:
- title
- author/channel name
- thumbnail with fallback chain
- canonical source URL
- media type
- optional duration/publish date later if a safe source is added

## Implementation Constraints
- Do not rely on scraping signed player internals unless there is a legal and operational decision to support that.
- Do not call `/api/download` with a watch page URL.
- Keep extraction fast and resilient.
- Prefer truthful UX over fake download success.

## Suggested Backend Tasks
1. Introduce `normalizeSourceUrl()` with YouTube-specific logic.
2. Change YouTube extraction result so `media_url` is `null` unless a real downloadable asset is available.
3. Add `download_available` to the API response and persisted model only if the team wants explicit capability state.
4. Update any serializers or response DTOs so frontend gets consistent values.
5. Add smoke coverage for:
   - `youtube.com/watch?v=...`
   - `youtu.be/...`
   - `youtube.com/shorts/...`

## Frontend Coordination
Frontend must know:
- YouTube preview is embed-driven, not direct-media-driven.
- The primary CTA should become `Watch on YouTube` or `Open Original` when download is unavailable.
- If `download_available` is introduced, frontend should key off that instead of `media_url`.

## Done When
- Extraction still creates a useful record for YouTube.
- Preview still works.
- Download CTA no longer triggers broken proxy fetches for watch URLs.
- Canonical URL storage preserves the video ID.
