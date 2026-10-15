# PintDownload

[PintDownload](https://pintdownload.app) is a free web tool that turns a public Pinterest link into a file you can save: a pin's HD image, video (MP4), GIF or carousel slides, a whole board or profile as a ZIP, or a profile picture. No account, no install. Public content only, and it is not affiliated with Pinterest Inc.

It also runs a public [MCP server](#mcp-server) so AI assistants can do the same from a chat.

## Stack

- [Astro 5](https://astro.build) (static pages plus server routes) with React islands and Tailwind CSS 3
- Deployed as one Cloudflare Worker (`wrangler.jsonc`, entry `src/worker.ts`)
- Node 22

Read these before changing the site:

- `PRODUCT.md`: who the site is for and what it must never claim
- `DESIGN.md`: the claim-ticket design system
- `AGENTS.md`: UI, accessibility and tooling rules (binding)

## Commands

| Command | What it does |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `http://localhost:4321` |
| `npm run build` | Build to `./dist/`, then run the SEO health check (`scripts/seo_health_check.py`) |
| `npm run preview` | Build, then serve the built Worker locally with `wrangler dev` |
| `npm test` | Run the test suites in `tests/` |
| `npm run test:seo-build` | Check the built HTML and sitemap for SEO invariants (after a build) |

## Deploy

Pushes to `main` run the SEO build in GitHub Actions (`.github/workflows/seo-automation.yml`). When it passes, `.github/workflows/deploy.yml` builds again and runs `wrangler deploy`. You can also start a deploy by hand from the Actions tab. The workflow needs the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; never commit them.

`npm run deploy` does the same build and deploy from your own machine after `npm run cf:login`.

## MCP server

PintDownload is also a free, read-only remote [MCP](https://modelcontextprotocol.io) server. There is no sign-in and no API key.

- **Endpoint:** `https://pintdownload.app/mcp` (Streamable HTTP, `POST`)
- **Protocol:** `2026-07-28`, plus 2025-era clients (`2025-11-25`, `2025-06-18`, `2025-03-26`) through the `initialize` handshake. Stateless, no sessions.
- **Setup steps** for Claude, Claude Code, Cursor, VS Code and ChatGPT: [pintdownload.app/pinterest-mcp-server](https://pintdownload.app/pinterest-mcp-server)

Claude Code:

```sh
claude mcp add --transport http pintdownload https://pintdownload.app/mcp
```

Tools (all read-only):

| Tool | What it does |
| :-- | :-- |
| `identify_pinterest_link` | Says whether a link is a pin, a pin.it short link, a board or a profile, and which tool to call next. No network call. |
| `get_pinterest_pin_media` | Download links for one pin: HD image, MP4 video and its qualities, GIF, or every carousel / Idea Pin slide. |
| `list_pinterest_board_pins` | Pins on a public board with download links, 20 per call by default (up to 50), paged with a cursor. First 250 pins. |
| `list_pinterest_profile_pins` | Pins a public profile shows plus its public boards, paged the same way. First 200 pins. |
| `get_pinterest_profile_picture` | A public account's profile picture at 1200 px, with a download link. |

Every result includes the source pin URL and a line asking to credit the creator. Text written by Pinterest users is returned in a separate `untrusted_text` field. The design and its reasoning are in `docs/mcp-design.md`.

The server runs inside the same Worker (`src/pages/mcp.ts`, `src/lib/mcp/`) and calls the extraction code in `src/lib/extract/` directly. `server.json` at the repo root describes the server for the [official MCP Registry](https://modelcontextprotocol.io/registry/remote-servers); publishing it there is a manual step.
