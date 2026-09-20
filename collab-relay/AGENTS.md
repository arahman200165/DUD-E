# AGENTS.md — collab-relay/

The Yjs sync/awareness room logic shared between `electron/collab-server.ts` (Phase 8 Stage 6) and `relay/` (Stage 7) — two separate Node processes, neither of which is `src/app/` or `electron/` itself, so this lives outside both. `src/shared-logic/` is a different thing: that's for logic shared between the browser renderer and `electron/`; this is Node-to-Node.

## Rules

- No Electron imports (`electron` package) — this must stay usable by the standalone `relay/` deployable, which never runs inside Electron.
- No HTTP/room-registry/session-code logic here — `room.ts` only knows how to run one room's Yjs protocol over WebSocket connections handed to it. Room lookup, session-code checking, and the HTTP server itself belong to each consumer (`electron/collab-server.ts`'s one fixed room; `relay/server.ts`'s multi-room registry keyed by URL path).
- Compiled by `electron/tsconfig.json` (via its `rootDir`/`include` reaching outside `electron/`) for the Electron build, and bundled directly by `relay/`'s own esbuild step for the standalone relay — keep it dependency-light (`ws`, `yjs`, `y-protocols`, `lib0` only) so both bundles stay small.
