# AGENTS.md — src/app/core/

This directory is the tool-agnostic framework: `registry/` (metadata, search, route generation), `persistence/` (per-tool storage policy), `workers/` (Worker request/result/cancel contract), `connectivity/` (online/offline + update-available signal), `routing/` (the one root route table).

## The rule

**No file in this directory should ever know a specific tool by name or ID.** Every tool interacts with `core/` only through `TOOL_DEFINITIONS` (`registry/tool-definitions.ts`) and the generic services here (`PersistenceService.signal(...)`, `WorkerClientService.run(...)`). If adding or modifying a tool seems to require editing something in `core/`, that's an architecture gap, not something to work around — see `/ADDING_A_TOOL.md`'s opening note.

## Changes here are framework-layer, not tool-layer

A change in `core/` affects every tool at once. Treat it with more scrutiny than a tool addition:
- It gets its own git milestone/commit, separate from any tool commit (see `/AGENTS.md`'s git convention).
- Run the full test suite (`npm test` + `npm run test:e2e`), not just the affected tool's spec — `tool-search.spec.ts` and `tool-registry.service.spec.ts` iterate the real `TOOL_DEFINITIONS` array and will catch a lot, but a `core/` behavior change can break tools that never touch the modified file directly (e.g. a `PersistenceService` policy change affects every tool using `session`/`local`).

Reference: `README.md`'s Architecture section and `DUDE_PRD.md` §12.2 (registry responsibilities), §14 (persistence model), §15 (worker layer).
