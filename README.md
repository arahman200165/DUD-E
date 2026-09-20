# DUDE — Development Utility Deck Engine

[![Deploy](https://github.com/arahman200165/DUDE/actions/workflows/deploy.yml/badge.svg)](https://github.com/arahman200165/DUDE/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-22c55e)](https://arahman200165.github.io/DUDE/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6.svg)](LICENSE)

A dense, dark-mode-only, installable Progressive Web App that consolidates the small developer utilities you'd otherwise Google one at a time — JSON formatting, regex testing, JWT decoding, hashing, diffing, and more — into a single fast, offline-capable, keyboard-driven deck.

**[→ Open the live app](https://arahman200165.github.io/DUDE/)**

---

## What is DUDE

DUDE is not a race to ship the most tools. It's a framework built to make adding **tool 11, 20, or 30** routine instead of architectural work — a new simple utility with existing transformation logic can be added in **under 30 minutes**, without touching navigation, routing, search, the command palette, persistence, or the PWA layer. Milestone 10's timed proof (see [`ADDING_A_TOOL.md`](ADDING_A_TOOL.md)) added a full tool, tests included, in **2 minutes 50 seconds**.

Everything runs client-side. There's no backend, no accounts, no telemetry — your data never leaves the browser unless a tool explicitly tells you otherwise.

- **Local-first** — every current tool works fully offline after the first load.
- **Dense, not decorative** — bold, functional color-coding by category and status, built for daily use, not for demos.
- **Framework-first** — the registry, shell, persistence, and worker layers were built before the tools, so new tools are cheap and safe to add.

## Screenshots

| Deck | JSON Formatter |
| --- | --- |
| ![DUDE deck, showing the sidebar and color-coded category grid](docs/screenshots/deck.jpg) | ![JSON Formatter tool, pretty-printing a sample JSON object](docs/screenshots/json-formatter.jpg) |

## Tools

10 tools ship today, each self-registered in [`tool-definitions.ts`](src/app/core/registry/tool-definitions.ts) — nothing about the shell knows any tool by name.

| Tool | Category | What it does |
| --- | --- | --- |
| [JSON Formatter](https://arahman200165.github.io/DUDE/tools/json) | Data | Validate, pretty-print, and minify JSON, with worker execution above 50KB. |
| [Text Inspector](https://arahman200165.github.io/DUDE/tools/text-inspector) | Text | Character, word, line, and UTF-8 byte metrics for any text, including selections. |
| [Text Diff](https://arahman200165.github.io/DUDE/tools/diff) | Text | Line-oriented diff between two blocks of text, computed in a worker. |
| [Base64 Encoder / Decoder](https://arahman200165.github.io/DUDE/tools/base64) | Encoding | UTF-8-safe text ↔ Base64 conversion. |
| [JWT Debugger](https://arahman200165.github.io/DUDE/tools/jwt) | Security | Decodes a JWT's header and payload — never persisted, never verifies signatures. |
| [Hash Generator](https://arahman200165.github.io/DUDE/tools/hash) | Security | MD5, SHA-1, SHA-256, SHA-384, and SHA-512 digests, computed in a worker. |
| [Unix Timestamp Converter](https://arahman200165.github.io/DUDE/tools/unix-timestamp) | Date & Time | Converts between Unix timestamps and human-readable local/UTC dates. |
| [Regex Tester](https://arahman200165.github.io/DUDE/tools/regex) | Developer | Tests a pattern against text with match/capture-group detail, in a worker. |
| [UUID Generator / Inspector](https://arahman200165.github.io/DUDE/tools/uuid) | Developer | Generates RFC 4122 v4 UUIDs and inspects an existing UUID's version/variant. |
| [Markdown Preview](https://arahman200165.github.io/DUDE/tools/markdown) | Documents | Side-by-side Markdown editor with a sanitized, live-rendered preview. |

## Architecture

The shell is generated entirely from tool metadata — no file under `src/app/shell/` or `src/app/core/` contains a single hard-coded tool ID. Adding a tool means creating a folder under `src/app/tools/` and adding one entry to the registry; the sidebar, deck, search, command palette, and routes all update automatically.

```
src/app/
  core/
    registry/      tool metadata, the registry service, search, route generation
    persistence/    per-tool session/local/none storage policy
    workers/        the shared Worker request/result/cancel contract
    connectivity/   online/offline signal, update-available detection
    routing/        the one root route table (lazy-loads every tool)
  shell/            sidebar, deck, command palette, root layout
  shared/           tool-shell frame, error panel, split-pane, and other cross-tool primitives
  tools/            one folder per tool — pure logic + component, isolated from every other tool
```

Key design choices:

- **Per-tool persistence policy** (`none` / `session` / `local`) — sensitive tools like the JWT Debugger persist nothing by default; UI preferences like indent size persist locally.
- **Shared worker layer** — heavy or unbounded work (hashing, regex, diffing, large JSON) can opt into a Web Worker without each tool reinventing message-passing, cancellation, or error handling.
- **Failure isolation** — a worker crash or a tool bug stays inside that tool's route; the sidebar and navigation keep working.
- **Lazy loading** — every tool is a separate `loadComponent` chunk, so visiting one tool never downloads another's code or libraries.

See [`ADDING_A_TOOL.md`](ADDING_A_TOOL.md) for the full, step-by-step guide to adding a new tool, written against the real `base64` tool as a worked example.

## Tech stack

Angular 22 (standalone components, signals) · Tailwind CSS v4 · Vitest · Playwright · `@angular/service-worker` · TypeScript

Library-forward by design — Markdown rendering, diffing, and sanitization all lean on mature libraries (`markdown-it`, `diff-match-patch`, `dompurify`) rather than reimplementing them.

## Getting started

```bash
git clone https://github.com/arahman200165/DUDE.git
cd DUDE
npm install
npm start
```

Open `http://localhost:4200/`. The app reloads automatically as you edit source files.

## Building

```bash
npm run build
```

Production output goes to `dist/dude/browser`, optimized and with the service worker enabled.

## Testing

```bash
npm test         # Vitest unit tests — registry, persistence, worker wrapper, tool transforms, keyboard nav
npm run test:e2e # Playwright, against a real production build: SPA-fallback routing + PWA offline behavior
```

Testing follows a "protect the framework, not chase coverage" posture: every tool's pure transform logic is unit-tested, and the two Playwright specs specifically prove the two things a unit test can't — a deep tool link resolving correctly on GitHub Pages, and the cached shell surviving a real offline reload.

## Deployment

Every push to `master` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install, test, build, then publish `dist/dude/browser` to GitHub Pages via `actions/deploy-pages`.

Two details make clean, bookmarkable routes work correctly on GitHub Pages' static hosting:

- **Base path** — the production build is configured with `baseHref: '/DUDE/'` (see `angular.json`) to match the project-page URL structure.
- **SPA fallback** — GitHub Pages has no server-side rewrite, so a direct hit or refresh on e.g. `/DUDE/tools/json` would 404. [`public/404.html`](public/404.html) catches that 404 and redirects into `index.html` with the original path encoded in the query string, which `index.html` then decodes and hands to the Angular router before it boots. This is exercised end-to-end by `e2e/production-direct-route.spec.ts` against the real built output.

Live site: **[arahman200165.github.io/DUDE](https://arahman200165.github.io/DUDE/)**

## PWA & Offline

DUDE is an installable Progressive Web App with an offline-capable app shell.

**What's cached:** after the first successful page load over a network connection, the Angular service worker (`@angular/service-worker`) caches the app shell (HTML, JS, CSS bundles) and static assets (icons, manifest). Each tool's code is fetched and cached the first time you navigate to it.

**What works offline:** once cached, the deck shell and any previously-visited local tool (e.g. JSON Formatter) launch and function fully offline — no network round-trip required. Tools that declare a network requirement (none currently do) show a compact "Offline" badge in their header when the app has no connectivity, and never block the rest of the app from working.

**What does NOT work offline:** a tool (or the app itself) that has never been successfully loaded at least once while online cannot be launched offline — the service worker can only serve what it has previously cached.

**Update strategy:** DUDE checks for a new version whenever the page is (re)loaded, and additionally polls every 6 hours in the background so a tab left open for a long session still notices a new deployment. When a new version is ready, a small "Update available" prompt appears in the top-right corner of the shell. Updates are never applied silently or automatically — click "Reload" to activate the new version and refresh the page. Until you do, you keep using the version you loaded.

**Testing offline behavior locally:** the service worker is only active in production builds (`ng build`), not `ng serve`. To test:

```bash
npm run build
npx http-server dist/dude/browser -p 8080
```

Then open `http://localhost:8080`, let it load once, and use your browser DevTools' Network tab "Offline" toggle to verify the shell and any already-visited tool still work.

## Adding a new tool

Read [`ADDING_A_TOOL.md`](ADDING_A_TOOL.md) — it walks through creating a tool folder, defining metadata, choosing a persistence/worker/network policy, and verifying discovery, using the real `base64` tool as the worked example. If following it ever requires editing the shell, routing, or a core service, that's an architecture bug, not something to work around.

## License

[MIT](LICENSE) © arahman200165
