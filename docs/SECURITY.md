# Security

DUDE is a local-first, client-side app: by default, everything you paste, upload, or generate stays in your browser tab (or, on desktop, on your machine) and is never sent anywhere. This document is the concrete, current-state accounting of the handful of places that isn't strictly true, what gets stored and where, the sandbox execution model's guarantees and limits, the Electron desktop app's process/IPC boundaries, and how to report a vulnerability.

See [`README.md`](../README.md) for the product overview and [`DUDE_PRD.md`](../DUDE_PRD.md) §29–31 for the underlying product requirements (Large Inputs, Sensitive Inputs, Security Boundaries) this document reports the current implementation of.

## What leaves the device

Nothing, by default. Two tools are the only exceptions, and both require an explicit user action per use — neither calls out automatically or in the background:

- **JWT Signature Verifier** (`/tools/jwt-verify`) — in JWKS mode, fetches the JWKS URL you supply (`jose`'s `createRemoteJWKSet`), or, if you pick a named preset (Auth0, Okta, Azure AD, Google), first fetches that provider's `.well-known/openid-configuration` discovery document to find its `jwks_uri`. In every case, the only thing that leaves your browser is a GET request to a URL you provided or explicitly selected — never the JWT itself, never its payload.
- **Text Inspector** (`/tools/text-inspector`) — its grammar-check mode sends the text you're checking to the public LanguageTool API (`https://api.languagetool.org/v2/check`) via a manual "Check" button, not live-as-you-type. This is the one tool where pasted content itself is transmitted; don't use it on text you don't want a third-party service to see.

Every other tool — including ones that look network-adjacent, like cURL Command Inspector or HTTP Status Code Reference — only parses, formats, or looks up against data bundled in the app itself.

## What gets stored, and where

Every tool declares a persistence policy per piece of state (`ToolPersistencePolicy` on its `ToolDefinition`, enforced through `PersistenceService.signal()`), one of five tiers:

| Policy | Where | Survives | Used for |
| --- | --- | --- | --- |
| `none` | nowhere | — | sensitive input that should never touch disk (e.g. JWT Debugger's decoded token) |
| `session` | `sessionStorage` | until the tab closes | raw pasted input for most tools |
| `local` | `localStorage` | across sessions | UI preferences (mode, indent size, algorithm choice) |
| `user-choice` | user picks per-session | depends on choice | tools where persistence itself is sensitive enough to ask about (e.g. Python Playground) |
| `secure-local` | OS keychain via Electron `safeStorage` | across sessions, desktop-only | the Settings tool's LLM proxy API key — never written to `localStorage` even on desktop |

Nothing here is ever synced, uploaded, or visible to anyone but you on your own device/browser profile. There is no account system and no server-side storage of any kind.

## Sandboxed code execution

JavaScript Playground, Template Renderer, HTML Preview, and Python Playground all run untrusted, user-supplied code. Two different sandbox implementations back this, chosen by what each tool's execution model actually needs:

- **JS Playground and Template Renderer** share one sandbox (`src/app/shared/code-sandbox/`): an opaque-origin `<iframe sandbox="allow-scripts">` running a nested `Worker`, torn down and recreated (not just cleared) after every run, with a hard execution timeout. Template Renderer uses the identical sandbox because an EJS template compiles to real JavaScript internally — it's exactly as arbitrary as a JS Playground snippet, not a "safer" text-templating mode.
- **HTML Preview and Python Playground** each ship their own tool-local sandbox variant, because their execution models can't use a Worker — HTML Preview needs a live DOM to render into, and Python Playground (Pyodide/WebAssembly CPython) needs real `fetch`/WebAssembly access a Worker sandbox would block.

All four are network-isolated by policy (`network: { required: false }` — see each tool's `ToolDefinition`) and execute entirely client-side; nothing you run in any of them is sent anywhere. This is app-level sandboxing inside your existing browser security boundary, not a hardened jail: don't paste secrets into code you then execute, and treat it the way you'd treat any other in-browser code sandbox (CodePen, JSFiddle, a Jupyter-in-browser demo) — real, but not a substitute for not running code you don't trust in the first place.

## Electron desktop app

The Windows desktop build (`DUDE_PRD.md` §21 Phase 8) adds a bundled local backend on top of the same web app, with the following boundaries:

- The renderer (the Angular app) runs with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true` — no direct Node.js or filesystem access, no exceptions. Every native capability (file dialogs, OS-keychain secret storage, the local LLM proxy, the collab server) is exposed only through `preload.ts`'s `contextBridge.exposeInMainWorld(...)`, never by relaxing those three flags.
- Every local backend process the desktop app starts — the static server serving the built app, the LLM proxy, the collab server — binds `127.0.0.1` (loopback) only, never an external network interface.
- **The one deliberate exception:** the local collaboration server (Advanced Markdown Workspace's real-time editing, Phase 8 Stage 6) binds `0.0.0.0` so it's reachable over your LAN by design, and is gated by a random per-session code so joining requires knowing that code. A self-hosted BYO relay (Stage 7, `relay/`) extends this across networks, but is never a DUDE-operated service — you run your own instance and point your own desktop app at it.
- The web app deployed to GitHub Pages has none of this backend — it remains the permanent, zero-install, fully browser-sandboxed entry point to DUDE.

## Third-party dependencies

DUDE is library-forward by design (see `README.md`'s Tech stack section) rather than hand-rolling fiddly logic like color-space math or CRDT sync. Keeping that dependency surface current is an ongoing, automated process rather than a static list here (which would go stale immediately): every push and PR runs `npm audit --audit-level=high` against production dependencies, a weekly CodeQL scan analyzes the codebase for common vulnerability patterns, and Dependabot opens weekly update PRs for both npm packages and GitHub Actions. See `.github/workflows/deploy.yml`, `.github/workflows/codeql.yml`, and `.github/dependabot.yml`.

## Reporting a vulnerability

Please use GitHub's private security advisory reporting for this repository (the repo's **Security** tab → **Report a vulnerability**) rather than opening a public issue. This lets us assess and fix an issue before it's publicly disclosed.
