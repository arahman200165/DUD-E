# AGENTS.md — src/app/shell/

Sidebar, deck (home grid), command palette, and root layout. This is the "framework, not a tool list" part of DUDE (README's "Architecture" section, `DUDE_PRD.md` §9).

## The rule

**Nothing under this directory contains a hard-coded tool ID.** Every list here (sidebar entries, deck cards, command-palette results) is derived at runtime from `TOOL_DEFINITIONS` (`src/app/core/registry/tool-definitions.ts`) via `ToolRegistryService`. If you're editing a component here to special-case a specific tool by ID or route, stop — that's the exact failure mode the registry pattern exists to prevent, and it means the fix belongs in `tool-definitions.ts` or the registry service instead.

Adding, removing, or reordering a tool should never require touching this directory. If it does, treat it as a bug in the registry/shell contract, not a one-off exception — see `/ADDING_A_TOOL.md`.

## The one deliberate exception: `pipelines/`

`src/app/shell/pipelines/` (the Pipelines list/builder pages) and the "Pipelines" sidebar link in `sidebar.html` are new shell surface area sanctioned by `DUDE_PRD.md` §21 Phase 21 Item 2 — composing tools into a chained workflow changes what a `ToolDefinition` means, not just adds one, so this is the one roadmap item explicitly allowed to add to `shell/`/`core/`. It still honors the rule's spirit: nothing in `pipelines/` hard-codes a specific tool id — a pipeline step's `toolId` is user-selected data, resolved generically through `ToolRegistryService`/`PipelineStepRegistryService`, the same way `ToolShell` resolves the current tool via `getByRoute()`. Pipelines are not a 278th tool: no category, no `TOOL_DEFINITIONS` entry, no `buildToolRoutes()` entry — see `src/app/core/pipeline/AGENTS.md`.
