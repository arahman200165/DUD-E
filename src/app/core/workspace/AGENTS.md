# AGENTS.md — src/app/core/workspace/

Framework layer for the Persistent Workspace/Scratchpad (`DUDE_PRD.md` §21 Phase 21 Item 4) and the shared
foundation Persistent Local History (Item 5) builds on. Like the rest of `core/`, no file here ever names a
specific tool by id.

## The `<id>.workspace-step.ts` convention

A workspace/history-eligible tool exposes itself by placing a file at
`src/app/tools/<id>/<id>.workspace-step.ts` that exports `workspaceStep: WorkspaceStep`
(`src/app/shared/models/workspace-step.model.ts`). `workspace-step-loader.ts`'s `loadWorkspaceStep(id)`
finds it purely by string convention — a template-literal dynamic import built from `id` — never via a
hand-maintained field on `ToolDefinition` or a parallel `id -> step` map. This mirrors
`core/pipeline/pipeline-step-loader.ts`'s `loadPipelineStep` exactly, on purpose: same reasoning (a folder
rename can't leave a stale registry entry behind), same cost (one extra file per participating tool).

A tool with no such file simply isn't eligible for live tab/panel state mirroring or Local History
recording — `loadWorkspaceStep` returns `undefined` and callers treat that as "not available," never an
error, exactly like the pipeline-step precedent.

**One adapter file, shared by two features.** Unlike Pipelines and History, Workspace mirroring and Local
History do not each get their own convention file — `WorkspaceStep` carries both a `snapshot()`/`restore()`
pair (Workspace's concern) and an opt-in `historyEligible`/`historySummary` (History's concern) in one
place. `core/history/` imports `loadWorkspaceStep` from here rather than defining a second loader — one
dynamic-import site per tool, not two. See `core/history/AGENTS.md` for why `historyEligible` defaults to
ineligible rather than being inferred from the tool's own `PersistencePolicy`.

## Writing a `.workspace-step.ts` adapter

It is a **thin wrapper**, never a rewrite of the tool's existing persistence calls. Use
`workspace-storage-bridge.ts`'s `readStorageValue`/`writeStorageValue` to read/write the *same*
`dude:v1:<toolId>:<key>` storage keys the tool's own `PersistenceService.signal(toolId, key, policy, ...)`
calls already use — `snapshot()` reads them, `restore()` writes them back before the tool component
(re)mounts, so the component's own constructor picks up the restored value on its normal synchronous
storage read. See `src/app/tools/base64/base64.workspace-step.ts` once it lands (Milestone 290) for the
worked example.

`'none'`-policy tools (nothing ever touches storage, e.g. JWT Debugger) can't use the storage bridge at
all — their `restore()` instead goes through `workspace-handoff.ts` (Milestone 290), a plain
module-scoped hand-off (deliberately not an `@Injectable`, since `restore()` runs outside any Angular
injection context) mirroring `core/paste-detect/paste-handoff.service.ts`'s one-shot in-memory shape.

## The governing privacy rule

No part of this feature may cause a tool's content to outlive the `PersistencePolicy` that tool's own code
already declares. `snapshot()`/`restore()` only ever read/write storage keys the tool's own code already
owns under its own already-chosen policy — they never promote a `session`/`none`-policy value to something
longer-lived. See `DUDE_PRD.md` §14.1/§30 and the Phase 21 Item 4/5 amendment for the full rationale.
