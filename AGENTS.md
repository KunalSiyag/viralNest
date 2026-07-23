<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Tooling & MCP Guidelines

- **Astro Docs MCP**: Utilize the Astro docs MCP for Astro-related guidelines and documentation.
  ```json
  {
    "mcpServers": {
      "Astro docs": {
        "type": "http",
        "url": "https://mcp.docs.astro.build/mcp"
      }
    }
  }
  ```
- **Styling**: Use **Tailwind CSS** for styling. Follow the rules below to ensure accessible, fast, and delightful UIs.

---

# UI & UX Guidelines

Use the following `MUST`, `SHOULD`, and `NEVER` rules to guide all UI decisions.

## 1. Interactions

### Keyboard
- **MUST**: Provide full keyboard support per the [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/).
- **MUST**: Display visible focus rings (e.g., `:focus-visible`; use `:focus-within` for groups).
- **MUST**: Manage focus correctly (trap in modals, move between interactive elements, return focus upon close).
- **NEVER**: Use `outline: none` without providing a visible focus replacement.

### Targets & Input
- **MUST**: Ensure hit targets are ≥24px (mobile ≥44px). If the visual element is smaller, expand its hit area via padding or pseudo-elements.
- **MUST**: Set mobile `<input>` `font-size` to ≥16px to prevent unwanted iOS auto-zoom.
- **MUST**: Apply `touch-action: manipulation` to interactive elements to prevent double-tap zoom delay.
- **SHOULD**: Set `-webkit-tap-highlight-color` to match your design palette.
- **NEVER**: Disable browser zoom (do not use `user-scalable=no` or `maximum-scale=1`).

### Forms
- **MUST**: Ensure inputs are hydration-safe (prevent lost focus or lost values during hydration).
- **MUST**: Maintain the original label of loading buttons while showing a loading spinner.
- **MUST**: Allow `Enter` to submit forms from focused inputs; in `<textarea>`, allow `⌘/Ctrl+Enter` to submit.
- **MUST**: Keep submit buttons enabled until the request starts, then disable them and show a spinner.
- **MUST**: Accept free text formats and validate afterward—do not aggressively block typing.
- **MUST**: Allow incomplete form submission to naturally surface validation errors.
- **MUST**: Display errors inline next to the corresponding fields. Focus the first error upon submit.
- **MUST**: Use proper `autocomplete` and meaningful `name` attributes. Set the correct `type` and `inputmode`.
- **MUST**: Warn the user about unsaved changes before navigation.
- **MUST**: Ensure compatibility with password managers and 2FA auto-fill (allow pasting codes).
- **MUST**: Trim values to handle trailing spaces from text expansion.
- **MUST**: Avoid dead zones on checkboxes/radios (the label and control should share a single hit target).
- **SHOULD**: Disable spellcheck for fields like emails, codes, and usernames.
- **SHOULD**: Placeholders should end with `…` and display an example pattern.
- **NEVER**: Block paste functionality in `<input>` or `<textarea>`.

### State & Navigation
- **MUST**: Ensure the URL reflects the UI state (deep-link filters, tabs, pagination, and expanded panels).
- **MUST**: Ensure Back/Forward browser navigation restores scroll position.
- **MUST**: Use semantic `<a>` or framework `<Link>` components for navigation (to support Cmd/Ctrl/middle-click).
- **NEVER**: Use `<div onClick>` for navigation.

### Feedback
- **MUST**: Confirm destructive actions or provide an Undo window.
- **MUST**: Use polite `aria-live` regions for toasts and inline validation.
- **SHOULD**: Prefer Optimistic UI; reconcile on the server response, and rollback or offer "Undo" on failure.
- **SHOULD**: Use an ellipsis (`…`) for options opening follow-ups (e.g., "Rename…") and loading states ("Loading…").

### Touch & Drag
- **MUST**: Provide generous targets and clear affordances. Avoid finicky interactions.
- **MUST**: Delay the first tooltip, but make subsequent peers appear instantly.
- **MUST**: Use `overscroll-behavior: contain` in modals and drawers to prevent background scrolling.
- **MUST**: During drag operations, disable text selection and set `inert` on dragged elements.
- **MUST**: If an element looks clickable, it must be fully clickable.

### Autofocus
- **SHOULD**: Autofocus on desktop only when there is a single primary input; use sparingly on mobile.

---

## 2. Animation

- **MUST**: Honor `prefers-reduced-motion` (provide a reduced variant or disable animations).
- **MUST**: Animate only compositor-friendly properties (`transform`, `opacity`).
- **MUST**: Make animations interruptible and input-driven (avoid autoplay).
- **MUST**: Set correct `transform-origin` (motion should start where it "physically" makes sense).
- **MUST**: SVG transforms should be applied to a `<g>` wrapper with `transform-box: fill-box`.
- **SHOULD**: Prefer CSS > Web Animations API > JS animation libraries.
- **SHOULD**: Animate only to clarify cause/effect or add deliberate delight.
- **SHOULD**: Choose easing that matches the change (based on size, distance, or trigger).
- **NEVER**: Animate layout properties (`top`, `left`, `width`, `height`).
- **NEVER**: Use `transition: all`—always list animated properties explicitly.

---

## 3. Layout

- **MUST**: Ensure deliberate alignment to the grid, baseline, and edges—no accidental placement.
- **MUST**: Verify layouts on mobile, laptop, and ultra-wide screens (simulate ultra-wide at 50% zoom).
- **MUST**: Respect safe areas (use `env(safe-area-inset-*)`).
- **MUST**: Avoid unwanted scrollbars and fix overflows.
- **SHOULD**: Prefer optical alignment (adjust by ±1px when visual perception looks better than strict geometry).
- **SHOULD**: Balance icon and text lockups in terms of weight, size, spacing, and color.
- **SHOULD**: Prefer Flexbox/CSS Grid over JS measurement for layout.

---

## 4. Content & Accessibility

- **MUST**: Ensure skeletons mirror final content to avoid Cumulative Layout Shift (CLS).
- **MUST**: Make sure `<title>` matches the current context.
- **MUST**: Avoid dead ends; always offer a next step or a recovery path.
- **MUST**: Deliberately design empty, sparse, dense, and error states.
- **MUST**: Use `font-variant-numeric: tabular-nums` for rendering numbers meant for comparison.
- **MUST**: Provide redundant status cues (do not rely on color alone). Icons must have text labels (or accessible names).
- **MUST**: Ensure accessible names exist even when visual labels are omitted.
- **MUST**: Use the proper ellipsis character (`…`), not three periods (`...`).
- **MUST**: Set `scroll-margin-top` on headings. Provide a "Skip to content" link. Use a hierarchical `<h1>` through `<h6>` structure.
- **MUST**: Build UIs resilient to user-generated content (handle short, average, and very long text gracefully).
- **MUST**: Format dates, times, and numbers according to the user's locale (using `Intl.DateTimeFormat`, `Intl.NumberFormat`).
- **MUST**: Provide accurate `aria-label` attributes; mark decorative elements as `aria-hidden`.
- **MUST**: Ensure icon-only buttons have descriptive `aria-label`s.
- **MUST**: Prefer native semantics (`button`, `a`, `label`, `table`) before falling back to ARIA roles.
- **MUST**: Use non-breaking spaces between values and units (e.g., `10&nbsp;MB`, `⌘&nbsp;K`).
- **SHOULD**: Provide inline help first; use tooltips only as a last resort.
- **SHOULD**: Use curly quotes (" ") and avoid widows/orphans (`text-wrap: balance`).
- **SHOULD**: Use `translate="no"` on brand names, code tokens, and identifiers to prevent garbled auto-translation.

---

## 5. Content Handling

- **MUST**: Ensure text containers handle long content gracefully (`truncate`, `line-clamp-*`, `break-words`).
- **MUST**: Flex children need `min-w-0` to allow text truncation to work correctly.
- **MUST**: Handle empty states securely—do not break UI for empty strings or arrays.

---

## 6. Performance

- **MUST**: Measure performance reliably (disable browser extensions that skew runtime).
- **MUST**: Track and minimize re-renders (utilize React DevTools or React Scan).
- **MUST**: Profile your app using CPU and network throttling.
- **MUST**: Batch layout reads/writes to avoid reflows and repaints.
- **MUST**: Target <500ms response times for mutations (`POST`, `PATCH`, `DELETE`).
- **MUST**: Virtualize large lists (>50 items).
- **MUST**: Preload above-the-fold images; lazy-load the rest.
- **MUST**: Prevent Cumulative Layout Shift (CLS) by providing explicit image dimensions.
- **SHOULD**: Test the UI with iOS Low Power Mode and macOS Safari.
- **SHOULD**: Prefer uncontrolled inputs for performance, though controlled inputs are relatively cheap per keystroke.
- **SHOULD**: Use `<link rel="preconnect">` for CDN domains.
- **SHOULD**: For critical fonts, use `<link rel="preload" as="font">` along with `font-display: swap`.

---

## 7. Dark Mode & Theming

- **MUST**: Set `color-scheme: dark` on the `<html>` element when using dark themes.
- **MUST**: Set explicit `background-color` and `color` on native `<select>` elements to fix Windows dark mode rendering.
- **SHOULD**: Ensure the `<meta name="theme-color">` matches the page background.

---

## 8. Hydration

- **MUST**: Ensure inputs with a `value` prop also have an `onChange` handler (or use `defaultValue`).
- **SHOULD**: Guard date and time rendering to prevent hydration mismatches.

---

## 9. Design

- **MUST**: Ensure all charts are accessible by using color-blind-friendly palettes.
- **MUST**: Meet contrast requirements—prefer [APCA](https://apcacontrast.com/) over standard WCAG 2 metrics.
- **MUST**: Increase contrast on `:hover`, `:active`, and `:focus` states.
- **SHOULD**: Create layered shadows (ambient + direct) for depth.
- **SHOULD**: Maintain crisp edges by using semi-transparent borders combined with shadows.
- **SHOULD**: For nested radii, the child radius should be ≤ the parent radius (concentric alignment).
- **SHOULD**: Maintain hue consistency—tint borders, shadows, and text toward the background hue.
- **SHOULD**: Match the browser UI to the background color.
- **SHOULD**: Avoid dark color gradient banding (consider using background images or noise textures when needed).
