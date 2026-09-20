# AGENTS.md — src/app/tools/

Every subfolder here is one isolated tool. Full recipe: `/ADDING_A_TOOL.md` (repo root) — read it before adding or restructuring a tool. This file is the short version.

## File layout

Mirror an existing tool of similar shape (`base64/` for a simple codec, `json/` for a worker-backed tool with a size threshold, `uuid/` for something with more surface area):

```
src/app/tools/<id>/
  <id>.ts              — Angular standalone component
  <id>.html
  <id>-<logic>.ts       — pure, framework-free transform (no Angular imports)
  <id>-<logic>.spec.ts  — plain Vitest describe/it, zero TestBed
  <id>.worker.ts        — only if the transform needs to run off-thread
```

Keeping the transform pure and framework-free is what lets it run unmodified on the main thread *and* inside a Worker.

## Registration is registry-only

Add exactly one entry to `TOOL_DEFINITIONS` in `src/app/core/registry/tool-definitions.ts`. Never touch `src/app/shell/` or `src/app/core/routing/app.routes.ts` to wire up a new tool — the route, sidebar entry, and search/command-palette indexing all follow automatically from that one entry.

## Component shell

Wrap content in `<app-tool-shell title="...">` (`src/app/shared/components/tool-shell/`). Its `title`/`status`/`networkRequired` inputs are **not** auto-derived from the registry entry — set them by hand and keep them in sync yourself; nothing warns you if they drift.

## Persistence / worker / network policy

- Raw user input → `session`; UI preferences (mode, indent, algorithm) → `local`; anything sensitive → `none` (see `jwt`'s entry for the pattern).
- Worker dispatch: `required` for anything always-slow (hash, regex, diff); `optional` above a size threshold (see `json.ts`'s `WORKER_THRESHOLD` pattern) otherwise.
- Network access defaults to false; per PRD §37 there's no backend or API-key infrastructure wired in yet, so think hard before requiring it.

Full detail and code snippets for all of the above: `ADDING_A_TOOL.md` steps 2, 4–6.

## Sandboxed/executable tools

If the tool needs to run untrusted code (JS/HTML/templates/Python-style execution), read `src/app/shared/code-sandbox/AGENTS.md` first — there are three non-obvious CSP/CORS/iframe gotchas that only show up in real browser testing, not unit tests.
