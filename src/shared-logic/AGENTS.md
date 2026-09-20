# AGENTS.md — src/shared-logic/

Pure, framework-free transform logic shared across a *process* boundary — currently, between an `src/app/tools/` component/worker and `electron/`'s main-process bundle (Phase 8 Stage 5's clipboard quick-actions). `electron/AGENTS.md`'s rule is that `electron/` never runtime-imports from `src/app/`; this directory is the one place both sides are allowed to import from, since it has no Angular, DOM-only, or Electron-only dependency.

## When something belongs here

Only move a file here when a second consumer outside `src/app/tools/<id>/` actually needs it (today: `electron/hotkey-bridge.ts`). Don't move logic here speculatively "in case" `electron/` needs it later — that's the same premature-abstraction mistake the root `AGENTS.md` warns against, just at a different layer.

## Rules

- No Angular imports (`@angular/*`), no DOM-only globals (`document`, `window`, `localStorage`) — only globals available in both a browser tab and Node (e.g. `TextEncoder`, `crypto.subtle`, `btoa`/`atob`).
- Keep the file exactly as pure as it was inside its tool folder — moving it here is a relocation, not a rewrite.
- The owning tool imports from here instead of owning the logic inline; keep its own `<id>-<logic>.ts` file only if it has tool-specific glue that doesn't belong in the shared file.
