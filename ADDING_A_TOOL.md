# Adding a Tool

DUDE's framework goal (PRD §2) is that a new simple tool with existing transformation logic can be added in **30 minutes or less**, without touching the application shell, navigation, command palette, search, routing, PWA, or persistence/worker infrastructure. This doc walks through exactly how, using the real `base64` tool (`src/app/tools/base64/`) as the worked example throughout.

If following these steps ever requires editing `ShellLayout`, `app.routes.ts`, or a shared service in `src/app/core/`, that's an architecture gap — file it, don't route around it.

## 1. Create the tool folder

Create `src/app/tools/<id>/`. At minimum you need a standalone component (`<id>.ts` + `<id>.html`). If there's transform logic worth testing independently of Angular, split it into a pure, framework-free file plus its spec — mirror `base64-codec.ts` / `base64-codec.spec.ts`:

```
src/app/tools/base64/
  base64.ts             — the Angular component
  base64.html
  base64-codec.ts        — pure encodeBase64/decodeBase64 functions, no Angular imports
  base64-codec.spec.ts   — plain Vitest describe/it, zero TestBed
```

Keeping the transform pure and framework-free (like `json-format.ts` or `text-diff.ts`) is also what lets the same function run on the main thread *and* inside a Worker unmodified — see step 5.

## 2. Define metadata

Add one entry to `TOOL_DEFINITIONS` in `src/app/core/registry/tool-definitions.ts`, matching the `ToolDefinition` shape (`src/app/shared/models/tool-definition.model.ts`):

```ts
{
  id: 'base64',
  title: 'Base64 Encoder / Decoder',
  description: 'UTF-8-safe text-to-Base64 and Base64-to-text conversion.',
  category: 'encoding',
  keywords: ['base64', 'encode', 'decode', 'encoding', 'utf-8'],
  route: '/tools/base64',
  load: () => import('../../tools/base64/base64').then((m) => m.Base64Tool),
  status: 'stable',
  persistence: { input: 'session', preferences: 'local' },
  io: { accepts: ['text'], produces: ['text'] },
}
```

- `category` must be one of the existing `ToolCategory` values (`tool-category.model.ts`) — `data`, `text`, `encoding`, `security`, `date-time`, `web`, `developer`, `documents`. Adding a new category is a bigger decision than adding a tool; don't do it casually.
- `keywords` drives `ToolRegistryService.search` — used by both the deck's inline search and the command palette.
- `load` is a dynamic `import()` returning the component class — this is what makes the route lazy (step 7 is then automatic).
- `persistence` / `execution` / `network` / `io` here are declarative documentation of the choices you make in steps 4–7 — they aren't read at runtime by the shell, but keep them accurate for future maintainers.

## 3. Create the component

Wrap the tool's content in `<app-tool-shell>` (`src/app/shared/components/tool-shell/tool-shell.ts`):

```html
<app-tool-shell title="Base64 Encoder / Decoder">
  ...
</app-tool-shell>
```

**Gotcha:** `ToolShell`'s `title` / `status` / `networkRequired` inputs are plain component inputs — they are **not** automatically derived from the registry's `ToolDefinition`. Set them by hand in the template and keep them in sync with what you wrote in step 2 yourself; nothing will warn you if they drift apart.

Import other shared primitives as needed: `ErrorPanel`, `BusyIndicator` (for worker-backed tools), `OfflineBadge` (already included inside `ToolShell` itself).

## 4. Choose a persistence policy

For each piece of state, call `PersistenceService.signal(toolId, key, policy, initialValue)` (`src/app/core/persistence/persistence.service.ts`), where `policy` is `'none' | 'session' | 'local' | 'user-choice'`:

```ts
protected readonly mode = this.persistence.signal<Base64Mode>('base64', 'mode', 'local', 'encode');
protected readonly input = this.persistence.signal('base64', 'input', 'session', '');
```

Rule of thumb, drawn from the existing 9 tools:
- raw user input → `'session'` (cleared when the tab closes; base64, json, hash, regex, diff, markdown, text-inspector all do this)
- UI preferences (mode, indent, algorithm choice) → `'local'` (persists across sessions; base64's `mode`, json's `mode`/`indent`)
- anything sensitive → `'none'` (jwt persists nothing at all — see `TOOL_DEFINITIONS`'s `jwt` entry)

## 5. Choose a worker policy

If the transform can be slow on large input, keep it pure and framework-free (step 1) so it can run unmodified in a Worker. Create `<id>.worker.ts` mirroring one of the four existing glue files (e.g. `src/app/tools/json/json-format.worker.ts`):

```ts
export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<MyPayload>>): void {
  const { id, payload } = data;
  try {
    postMessage(resultMessage(id, myPureTransform(payload)));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
```

(`handleMessage` is exported specifically so it can be unit-tested directly — see Milestone 9's `regex-match.worker.spec.ts` for the pattern: stub `postMessage` with `vi.stubGlobal`, call `handleMessage` with a fake `MessageEvent`, assert on what got posted.)

In the component, decide when to dispatch to the worker:
- **always** (`execution: { worker: 'required' }`) — hash, regex, and diff all do this.
- **above a size threshold** (`execution: { worker: 'optional' }`) — json's approach, via a `WORKER_THRESHOLD` constant and a `computed()` that switches between a synchronous call and a worker dispatch (see `src/app/tools/json/json.ts`).

Either way, call `WorkerClientService.run` (`src/app/core/workers/worker-client.service.ts`):

```ts
const job = this.workerClient.run<MyPayload, MyResult>(
  () => new Worker(new URL('./my-tool.worker', import.meta.url), { type: 'module' }),
  payload,
);
```

and bind the returned `WorkerJob`'s `status()` / `progress()` / `result()` / `error()` signals in the template via `<app-busy-indicator>` / `<app-error-panel>`.

## 6. Choose a network policy

If the tool genuinely needs network access, set `network: { required: true }` in the `ToolDefinition` **and** bind `[networkRequired]="true"` on `<app-tool-shell>` in the component template — two separate places, both required (same gotcha as step 3). Every current tool sets this to false/omits it. Per the PRD's scope gate (§35), think hard before requiring network — there's no backend and no API-key infrastructure wired into any showcase tool yet.

## 7. Declare I/O capabilities

Set `io: { accepts: [...], produces: [...] }` in the `ToolDefinition` — the field is required (`io:`, not `io?:`) so the compiler rejects a tool that forgets it. Use the shared vocabulary in `src/app/shared/models/tool-io.model.ts` (`DudeDataType`: `text`, `json`, `bytes`, `file`, `table`, `url`, `http-response`). This is the "Universal Input/Output Contract" from PRD §21 Phase 21 — like `persistence`/`execution`/`network`, it's declarative documentation only (not read by the shell at runtime yet), but it's what a future pipeline/Smart-Paste feature would build on, so keep it honest: describe what the tool's UI/logic actually consumes and emits today, not aspirational future capability. `tool-count.spec.ts`'s "Universal I/O contract coverage" spec still guards against a technically-present-but-empty `accepts`/`produces` array, which the required-field type check alone doesn't catch.

Milestone 282 audited all 277 existing entries and fixed the drift it found; apply these conventions rather than reinventing them per tool:

- **A download/export button means `file` belongs in `produces`.** This was the single most common miss — a tool with a "Download" affordance that only declared `text`/`json`. If the component calls `downloadFile(...)` or otherwise hands the user a file to save, `file` must be in `produces`.
- **A pure knob/option generator with no paste-and-parse or inspect mode declares `accepts: ['json']`** — its discrete form controls are conceptually a config object (see `password-generator`, `pkce-generator`, `lorem-ipsum-generator`). A generator that *also* accepts pasted text to inspect/decode an existing value (see `uuid`, `ulid-tools`) keeps `text` too.
- **A tool that decodes/analyzes input into itemized structured fields** (not just a pass/fail message) should include `json` in `produces` alongside any human-readable text — see the JWT/OAuth cluster (`jwt`, `oauth-token-inspector`) and the ID-inspector cluster (`uuid`, `ulid-tools`, `snowflake-id-tools`, `ksuid-tools`).
- A tool whose declared `io` can't honestly represent something it does (e.g. a live webcam/camera input stream, as in `qr-code-scanner`) should still declare the closest reasonable fit rather than a wrong one — don't stretch an existing `DudeDataType` to cover a genuinely different capability. Vocabulary gaps like this are a known, accepted limitation of the current 7-type set (see `DUDE_PRD.md` §21's Phase 21 note), not something to work around per-tool.

## 8. Expose the lazy route/component

Nothing to do beyond step 2. `buildToolRoutes()` (`src/app/core/registry/tool-routes.ts`) automatically turns every `TOOL_DEFINITIONS` entry into a lazy `loadComponent` route nested under the root `ShellLayout` (`src/app/core/routing/app.routes.ts`). No route file edits needed — this is the "shell generated from tool metadata" promise (PRD §12.2) actually working.

## 9. Add tests where appropriate

A framework-free `.spec.ts` for the pure transform is the highest-value test (fast, no TestBed) — see `base64-codec.spec.ts`. Only add a component-level spec if there's real branching logic in the component itself (e.g. json's worker-threshold test, `src/app/tools/json/json.spec.ts`). Don't chase coverage for its own sake (PRD §18 — "ship first").

## 10. Verify search/sidebar/command palette discovery

Run the app (`ng serve`) and confirm:
- the tool appears in the sidebar under its category;
- typing part of its title/keywords into the deck search or the command palette (`Ctrl+K`) surfaces it.

Then run `npm test` — `tool-search.spec.ts` and `tool-registry.service.spec.ts` iterate the real `TOOL_DEFINITIONS` array, so a malformed new entry (duplicate id, duplicate route, etc.) will usually fail one of them immediately. Also update the "N tools ship today" line and the Tools table in `README.md` — `tool-count.spec.ts` fails the build if they drift from `TOOL_DEFINITIONS`.

## 11. Verify the direct URL

After `ng build`, confirm the lazy chunk loads and the route resolves correctly when hit directly (not just via in-app navigation) — this is what Milestone 9's `e2e/production-direct-route.spec.ts` automates for the `json` tool as a template if you want to extend it. At minimum, serve the production build locally and hard-navigate to `/DUDE/tools/<id>` to confirm it isn't relying on client-side router state that a fresh page load wouldn't have.
