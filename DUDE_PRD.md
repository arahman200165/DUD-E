# DUDE — Developer Utility Dashboard Engine

## Product Requirements Document

**Project name:** DUDE  
**Expanded name:** Developer Utility Dashboard Engine  
**Product type:** Static, single-page developer utility deck  
**Primary deployment target:** GitHub Pages free tier  
**Primary frontend framework:** Angular  
**Primary audience:** The developer building and using it first; later, other developers  
**Delivery horizon:** Framework and first 10 tools delivered in one weekend; ongoing roadmap-driven development from here  
**Status:** V1 (framework + 10 tools) shipped and deployed — ongoing roadmap-driven development

---

# 1. Executive Summary

DUDE is a dense, dark-mode-only, desktop-first Angular single-page application that consolidates frequently Googled developer micro-tools into one fast, self-contained deck.

Visually, DUDE is dark but not monochrome or subdued. The UI is built on a dark base and uses a bright, bold, highly saturated accent-color system functionally — for categories, status, and structure — rather than decoratively. See Section 8 for the full visual direction.

The weekend project was **not** to build 20–30 tools immediately.

The weekend project was to build the **framework that makes tools 10 through 30 cheap and safe to add later**, while shipping enough varied tools to prove that the framework is sound. That framework is now built, deployed, and proven — see §1.1.

The product is:

- static-hostable on GitHub Pages free tier;
- installable as a PWA;
- functional offline for local-only tools;
- local-first by default;
- capable of supporting public APIs and user-supplied API keys later;
- resilient so a heavy tool cannot freeze the whole application;
- bookmarkable through clean per-tool URLs;
- optimized for desktop Chromium;
- extremely dense and utility-first;
- easy to extend without changing the application shell.

The weekend MVP shipped with **9 showcase tools** chosen to exercise different UI, state, persistence, worker, parsing, formatting, and rendering patterns, plus a 10th tool (UUID Generator / Inspector) added as a timed extension-speed proof.

---

## 1.1 Current Status

V1 is complete. The extensible framework, all core infrastructure (registry, persistence, workers, PWA, GitHub Pages routing/CI), and 10 tools (the original 9 showcase tools plus the UUID Generator / Inspector) are built, tested, deployed, and verified live at `https://arahman200165.github.io/DUDE/`. Every item in the §37 Definition of Done is checked and verified against the live deployment.

With V1 delivered, the old weekend scope gate no longer applies. New work — additional tools, enhancements to existing tools, or framework extensions — proceeds directly from the §21 Tool Roadmap. The product principles, architecture, and shared conventions documented below remain the standing contract for any new work; only the temporary "hold the line until Sunday" constraints have been retired.

Phases 0–8 of that roadmap are complete: the original 10 showcase tools plus 47 further tools, spanning high-frequency utilities, structured data, web/API references, developer workflow, richer editors, sandboxed code execution, and the original showcase backlog's deferred items. **Phase 8 (Downloadable Desktop App with a Bundled Backend) is complete** — a framework-first phase, not a tool-adding one, that packages DUDE as a Windows Electron app with a local, bundled backend and establishes the desktop-packaging track. All 8 stages (Electron shell; native file access; OS-level secret storage; local LLM proxy + AI regex features; desktop shell chrome; local collab server; BYO relay server; auto-update + distribution) shipped as Milestones 21–28. §21 continues from there with a further, comprehensive future roadmap organized into two tracks — a browser-only "Track A" buildable today, and a "Track B" gated on Phase 8's desktop-packaging track. See §22 (Future Architecture Directions) and §23 (Long-Term Product Horizon) for that direction and its cross-cutting architectural implications, and §5.2 for how it revises the product's permanent non-goals.

---

# 2. Core Product Goal

Build a reusable developer utility platform where adding a new simple utility is routine instead of architectural work.

The most important outcome is not raw tool count.

The most important outcome is this:

> After the framework exists, a new simple utility whose core logic already exists should be addable in 30 minutes or less without modifying the application shell.

This makes DUDE a long-lived personal utility platform rather than a one-weekend collection of unrelated components.

---

# 3. V1 Success Criteria

The weekend project was judged successful once all of the following were true. These bars remain the standing quality contract for any future roadmap work.

## 3.1 Hard pass/fail criteria

### A. Extension speed

A new simple tool with existing transformation logic can be added in **30 minutes or less**.

**Achieved:** the UUID Generator / Inspector (§21 Phase 1 #12) was added, registered, and verified end-to-end in 2 minutes 50 seconds with zero shell/core edits — well inside the target.

Adding that tool should require only:

1. creating the tool component;
2. defining the tool metadata;
3. optionally defining worker behavior;
4. optionally defining persistence behavior;
5. adding tests for core logic where justified;
6. registering/exporting the tool through the tool registry mechanism.

It must **not** require changes to:

- global navigation;
- application shell;
- command palette implementation;
- search implementation;
- route layout code;
- PWA infrastructure;
- persistence infrastructure;
- worker infrastructure.

### B. Deployment reliability

The repository must support:

- one production build command;
- automated GitHub Pages deployment through CI;
- correct asset paths under the repository base path;
- clean tool URLs;
- direct refreshes on tool routes;
- a `404.html` SPA fallback strategy suitable for GitHub Pages;
- PWA asset caching;
- predictable handling of deployed updates.

If a user opens a saved tool route directly from a bookmark, the app must recover correctly.

---

## 3.2 Strong targets

### C. Performance and isolation

- The shell should remain responsive during expensive work.
- Heavy or potentially blocking tasks can opt into a reusable worker execution layer.
- Worker-backed tasks must support cancellation where practical.
- Heavy tools should be lazy-loaded.
- A broken or computationally expensive tool should not take down navigation for the whole deck.

No strict bundle-size target is required.

The project deliberately prioritizes shipping and library reuse over extreme bundle minimization.

### D. Architecture clarity

A developer unfamiliar with the codebase should be able to understand, from the repository structure and documentation:

- where tools live;
- how a tool is registered;
- how routes are created;
- how search metadata works;
- how per-tool persistence works;
- how workers are used;
- how API keys are handled;
- how network-dependent tools declare online requirements;
- how a new tool should be implemented.

---

# 4. Product Principles

## 4.1 Framework first

The first weekend optimized for extensibility before tool count.

This ordering was validated by the actual delivery sequence: shell → tool registry → command palette → persistence policies → worker execution layer → PWA/connectivity → GitHub Pages routing/CI → showcase tools → critical tests → extension-speed proof. Each layer was built before the tools that depend on it, which is why the 10th tool (§3.1.A) could be added in under three minutes with no shell changes.

## 4.2 Local first

If a tool can run entirely in the browser, it should.

Network access should not be introduced merely because it is convenient.

This is also a product feature, not just an architecture choice: DUDE should make it visible, in the UI, when a tool is processing entirely on-device — "processed locally, your data never leaves your machine" — since this matters most for exactly the inputs users are most guarded about (JWTs, API responses, logs, configs, company data). See §14 and §31 for how this is enforced technically.

## 4.3 Dense over decorative

DUDE is a working developer surface, not a marketing site.

Screen real estate should be spent on inputs, outputs, useful controls, status, and metadata.

This applies to color the same way it applies to space: the palette is bright and bold (Section 8), but every color is carrying information — category, status, active state — never spent purely for decoration.

## 4.4 Fast and predictable

Every tool should share familiar conventions where those conventions help:

- reset;
- copy;
- swap where relevant;
- import/paste;
- error display;
- output display;
- persistence behavior;
- keyboard focus;
- tool metadata.

## 4.5 Explicit over magical

Persistence, API usage, sensitive-value storage, worker execution, and online requirements should be visible in the implementation and preferably declared by the tool.

## 4.6 Failure should remain local

A failing tool should fail inside its own workspace.

The application shell should survive.

## 4.7 Expansion is roadmap-driven

The roadmap can be broad (§21).

Any single unit of work — a new tool, an enhancement, a framework change — should still be scoped and finished on its own terms rather than growing to cover multiple roadmap items at once.

## 4.8 Depth and interconnection over raw tool count

DUDE's moat is not the number of tools it has.

As the roadmap grows into the hundreds of tools (§21), the differentiator is meant to stay excellent UX, privacy, interoperability between tools, and depth on the tools that already exist — not simply adding more of them. Concretely: prefer enriching an existing tool (tree views, search, exports, validation, related-tool hand-offs) over shipping a shallow new one when both are on the table, and treat DUDE as a single cohesive workbench that tools connect within (see §22, Future Architecture Directions), not an unrelated pile of pages that happen to share a shell.

## 4.9 Desktop extends, doesn't replace, the web app

The GitHub Pages web app (§1, §10) remains the permanent, zero-install way to use DUDE, and stays the recommended default even after the desktop packaging track (§23) exists. The desktop app's job is to add genuinely native capability — OS/network/filesystem access, drag-and-drop, system tray, global shortcuts, local servers (Track B, §21) — not to re-wrap the same web experience for its own sake.

This implies a shared-core architecture: tool logic lives in a platform-independent core, with the browser, desktop, and any future backend each sitting behind their own thin adapter (see §25). It also implies a hard constraint on future monetization (§23): the basic utilities that work today in the browser must never be paywalled behind the desktop app or any paid tier — they are the on-ramp into the rest of the product, not an upsell surface.

---

# 5. Product Scope Boundaries

## 5.1 In Scope (V1 — Delivered)

The weekend implementation delivered:

- Angular application foundation;
- dense dark-only UI shell;
- deck home;
- persistent sidebar;
- global search;
- command palette;
- dedicated route for each tool;
- clean GitHub Pages routing;
- tool registry;
- category system;
- tool metadata model;
- shared tool layout primitives;
- per-tool persistence policy;
- shared local storage/session storage abstraction;
- reusable worker execution abstraction;
- online/offline awareness;
- PWA installability;
- service worker caching;
- lazy loading for tool routes;
- GitHub Pages CI deployment;
- error isolation at route/tool boundary where practical;
- basic keyboard usability;
- documentation for adding a tool;
- 9 showcase tools, plus a 10th (UUID Generator / Inspector) added as the extension-speed proof;
- a small number of framework-critical tests;
- a small number of deployment/navigation smoke tests.

---

## 5.2 Permanent Non-Goals

These are durable product and architecture decisions, not temporary weekend cuts. They stay out of scope regardless of roadmap progress unless a future decision explicitly revisits them:

- user accounts;
- cloud synchronization;
- custom backend (a **cloud-hosted** backend — see the note below for the desktop track's local backend, which is a distinct, now-permitted thing);
- database (a DUDE-operated, always-on datastore for the product itself — this does not block Track B tools that connect to a user's own local/live databases, since those are the tool's job, not DUDE's infrastructure);
- telemetry platform;
- analytics dashboard;
- collaborative editing;
- shareable server-stored snippets;
- extension marketplace;
- plugin installation from remote sources;
- third-party authentication;
- multi-device preferences;
- mobile-first layout;
- Firefox-specific optimization;
- Safari-specific optimization;
- browser extension packaging;
- VS Code extension;
- Monaco-style full IDE workspace;
- multi-tool tabs;
- draggable/resizable IDE panels;
- multi-window workflows;
- user-defined tool scripting;
- cloud-hosted API proxy;
- secret storage service;
- elaborate onboarding;
- tutorial tours;
- social sharing;
- SEO-heavy content pages;
- public API documentation portal;
- design system extraction;
- component package publishing;
- broad accessibility certification;
- exhaustive cross-browser testing;
- exhaustive end-to-end tests;
- exhaustive unit-test coverage;
- bundle-size optimization project;
- localization/i18n;
- theme customization;
- light mode.

**Amendment (2026-09-20):** Electron/Tauri/native desktop packaging is **no longer a permanent non-goal**. §23 (Long-Term Product Horizon) adopts desktop packaging as a real future direction, since a large class of genuinely useful tools (§21, Track B) needs native OS/network/filesystem access a browser tab cannot get. This is a narrow, deliberate carve-out, not a general reopening of the list above:

- a desktop build's **local, bundled backend** — used only to give Track B tools OS/network/filesystem access on the user's own machine — is now in scope;
- a **cloud-hosted** backend, a DUDE-operated database, user accounts, and cloud sync remain permanent non-goals for the product as a whole, desktop included, unless a future decision explicitly revisits them (§23's monetization sketch flags this exact tension and does not resolve it);
- the web/GitHub Pages build remains the permanent zero-install default (§4.9) — desktop is additive, not a replacement.

---

## 5.3 Deferred to Roadmap

These items are not permanent non-goals — they are later phases already tracked in §21:

- WYSIWYG rich-text editor (§21 Phase 5, #36) — ✅ shipped.

Phase 6 (executable JavaScript playground, arbitrary HTML execution, arbitrary template execution, sandboxed code runner) has since shipped too — see §21 Phase 6 and the amended standing rule at §33.

The full future roadmap — everything not yet built, spanning both what's buildable in the browser today (Track A) and what waits on the desktop packaging track (Track B) — is organized in §21 from Phase 8 onward, with the cross-cutting architectural ideas it depends on (pipelines, a shared input/output contract, smart paste-detection, a persistent workspace, local history) covered separately in §22.

---

# 6. Target User

## 6.1 Primary user

A software developer who repeatedly needs small transformations, inspections, conversions, formatting operations, and debugging helpers during normal development.

Examples:

- formatting JSON copied from logs;
- decoding a JWT;
- checking character or byte counts;
- testing a regular expression;
- converting timestamps;
- hashing input;
- decoding Base64;
- previewing Markdown;
- comparing two blobs of text.

## 6.2 Usage pattern

The expected use pattern is short and frequent:

1. open DUDE;
2. reach the desired tool quickly;
3. paste/type data;
4. get the result immediately;
5. copy the result;
6. switch tools or leave.

The application should optimize for repeated daily use rather than onboarding first-time nontechnical users.

---

# 7. Supported Platform

## 7.1 Required

- Desktop Chromium-based browsers.
- GitHub Pages free-tier static hosting.
- Online and offline operation where applicable.

## 7.2 Not Currently Required

- Firefox parity.
- Safari parity.
- mobile optimization.
- touch-first interactions.
- narrow-screen layout quality.

The application should not intentionally break elsewhere, but acceptance is based on desktop Chromium.

---

# 8. Visual Direction

## 8.1 Theme

Dark mode only.

No light theme toggle.

The dark theme is not muted or monochrome. DUDE uses a single, fixed, highly colorful theme: a dark base (background/panel surfaces) paired with a bright, bold, highly saturated accent-color palette used throughout the shell and every tool. Color is a primary structural and functional device, not an afterthought layered on top of a gray UI.

This is one fixed theme, not a customizable one. See Section 5.2 (theme customization and light mode remain out of scope) and Section 8.5.

## 8.2 Density

Extremely dense.

The interface should favor:

- small control heights;
- compact spacing;
- compact typography;
- high information density;
- minimal empty decorative space;
- restrained border *weight* and panel chrome — structure and separation are carried primarily by bold color and contrast rather than heavy borders, drop shadows, or extra whitespace;
- compact status indicators, rendered in bold semantic color rather than muted gray;
- compact headers.

Density and color intensity are complementary, not in tension: strong, bold color lets compact panels, tight status chips, and small controls stay legible and instantly scannable without needing extra size or spacing to read clearly.

## 8.3 Style

Developer console / workstation utility — a colorful, high-contrast terminal/IDE aesthetic, not a muted enterprise dashboard.

Color is used functionally and boldly:

- category color-coding (Section 12.3);
- semantic status colors (error, warning, success, info, running/busy, offline);
- syntax highlighting and structured-data coloring;
- bold accent colors on interactive elements (active nav item, focus states, primary actions, links);
- bright, saturated badges and indicators that are immediately scannable at a glance.

Still avoid, regardless of color intensity:

- oversized marketing cards;
- large hero headers;
- decorative gradients used purely for polish (a gradient used as a meaningful status/progress indicator is fine; a gradient used as visual flourish is not);
- glow/neon shadow effects;
- excessive rounded cards;
- giant empty margins;
- onboarding illustrations;
- ornamental animations.

The rule of thumb: color should always be carrying information (what category, what state, what severity, what's active) — never decoration for its own sake.

## 8.4 Typography

Use monospace selectively for:

- input/output data;
- code-like values;
- timestamps;
- hashes;
- tokens;
- regex;
- structured data.

Navigation and labels may use a compact UI font.

## 8.5 Color System

A single fixed dark-and-colorful palette is defined once and shared by the shell and every tool through the design-token/theming layer (Section 25, `shared/`).

Required elements:

- a dark base scale (background, panel, elevated-panel, border) that all tools and shell chrome share;
- a bright, bold accent palette with enough distinct hues to color-code all Section 12.3 categories without repeats;
- fixed semantic colors for error, warning, success, info, and busy/running states, used consistently by the shared error panel, warning badge, loading indicator, and offline badge (Section 13);
- a defined active/focus accent used consistently across sidebar selection, command palette selection, and primary buttons;
- monospace/data regions (Section 8.4) styled with enough contrast and, where applicable, syntax coloring to stay readable against the dark base.

Constraints:

- exactly one theme is defined; it is not user-configurable (Section 5.2);
- every color combination used for text or status meaning must still meet the contrast baseline in Section 19 — "bright and bold" must not come at the cost of legibility;
- new tools reuse the shared palette/tokens rather than inventing tool-specific colors, so the deck and sidebar stay visually coherent as tools are added.

---

# 9. Navigation and Information Architecture

The selected model is a hybrid.

## 9.1 Deck home

The home route should show:

- global search entry;
- compact category sections;
- tool list or dense tool grid;
- recent tools if trivial to implement;
- pinned/favorite tools only if trivial to implement.

Favorites and recents remain optional.

They must not delay core work.

## 9.2 Sidebar

Persistent desktop sidebar containing:

- DUDE identity;
- global search/command launcher;
- category groups;
- tool links;
- active route state.

The sidebar should be compact enough to remain open during normal use.

## 9.3 Command palette

Keyboard-accessible global launcher.

Recommended shortcut:

- `Ctrl+K` on the primary target platform.

Capabilities for V1:

- search by tool title;
- search by keyword;
- search by category;
- navigate directly to tool.

Deferred:

- executing tool actions directly from palette;
- command history;
- fuzzy action chains;
- extension commands.

## 9.4 Dedicated tool routes

Every tool receives its own bookmarkable route.

Example shape:

```text
/tools/json
/tools/regex
/tools/timestamp
```

The exact route convention may change during implementation, but all tools must have stable dedicated URLs.

---

# 10. GitHub Pages Routing Strategy

Use clean routes with a GitHub Pages SPA fallback.

Requirements:

- Angular router with clean routes;
- repository-aware base path;
- deployment output suitable for GitHub Pages;
- generated/copied `404.html` fallback;
- fallback script/strategy that restores the intended SPA route;
- direct refresh on a tool URL works;
- back/forward browser navigation works;
- PWA service worker does not break route recovery.

Hash routing is explicitly not the chosen approach.

---

# 11. PWA and Offline Model

DUDE should be installable.

## 11.1 Required PWA Behavior

- web app manifest;
- service worker;
- application shell cached;
- static assets cached;
- local-only tools available offline after first successful load;
- update strategy documented;
- application can detect online/offline state.

## 11.2 Network-dependent tools

Future tools may depend on public APIs.

Such tools must:

- clearly declare that network access is required;
- not break the rest of the app offline;
- display a compact offline state;
- degrade gracefully;
- avoid blocking application startup.

## 11.3 API-key tools

User-supplied API keys are allowed.

Rules:

- no private API key may be compiled into DUDE;
- session-only storage is the default;
- persistent local storage requires explicit user opt-in;
- API-key storage is handled through the shared persistence abstraction;
- API-backed tools should isolate key usage to the specific integration;
- the app should make it clear when a tool sends data to an external service.

---

# 12. Tool Architecture

The architecture should be moderately structured rather than rigidly uniform.

Tools should share a common contract where useful, while retaining freedom for different UI patterns.

## 12.1 Tool metadata

Each tool should define metadata equivalent to:

```ts
interface ToolDefinition {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  route: string;
  icon?: string;
  load: () => Promise<unknown>;
  persistence?: ToolPersistencePolicy;
  execution?: ToolExecutionPolicy;
  network?: ToolNetworkPolicy;
  status?: 'stable' | 'experimental';
}
```

This is conceptual.

The implementation can adjust names and exact typing.

## 12.2 Registry responsibilities

The registry should drive:

- sidebar navigation;
- deck discovery;
- global search;
- command palette;
- route metadata where practical;
- category grouping;
- tool status;
- persistence declarations;
- online/offline hints.

The shell must not contain hard-coded conditionals for individual tools.

## 12.3 Tool categories

Initial category taxonomy:

- Data
- Text
- Encoding
- Security
- Date & Time
- Web
- Developer
- Documents

Avoid creating too many categories in the MVP.

Taxonomy can evolve later.

Each category is assigned one fixed bold accent color from the shared palette (Section 8.5), used consistently for that category's sidebar group, deck section, and tool badges. Category color is metadata-driven from the registry, not hard-coded per tool.

---

# 13. Shared Tool Shell

Each tool route should render inside a shared workspace frame.

Recommended structure:

```text
Tool title / compact metadata / status
Primary controls
-------------------------------------
Input / working area
-------------------------------------
Output / preview / result
-------------------------------------
Compact action/status footer if needed
```

Not every tool must use the same visual arrangement.

The shared shell should provide reusable affordances, not force every tool into identical form fields.

Possible shared pieces:

- copy button;
- clear/reset button;
- swap button;
- run button;
- input/output headers;
- error panel;
- warning badge;
- loading indicator;
- offline badge;
- worker-running indicator;
- byte/character metadata;
- reusable split pane.

---

# 14. State and Persistence Model

Selected policy:

> Per-tool choice, with selective persistence as the default.

Each tool should declare one of the following:

- `none`: never persist;
- `session`: survive navigation and possibly refresh within session semantics;
- `local`: persist locally across sessions;
- `user-choice`: allow explicit opt-in.

## 14.1 Default policy

Safe tool preferences may persist.

Potentially sensitive payloads should not persist automatically.

Examples of values that may persist:

- preferred indentation size;
- selected timestamp unit;
- regex flags;
- layout preference;
- selected hash algorithm.

Examples that should default to nonpersistent/session-only:

- JWT values;
- API keys;
- pasted headers;
- private JSON;
- large arbitrary text blobs;
- tokens.

The architecture should permit a tool to choose differently when justified.

---

# 15. Worker Execution Layer

A reusable worker abstraction is required.

The purpose is not to move every task off the main thread.

The purpose is to make off-main-thread execution easy for tools that need it.

## 15.1 Worker layer responsibilities

Where practical:

- submit task;
- receive progress/status if needed;
- receive result;
- receive typed error;
- cancel task;
- terminate/restart worker;
- avoid leaking state between unrelated jobs.

## 15.2 Candidate worker-backed operations

- large JSON parsing/formatting;
- expensive regex testing;
- large diffs;
- hashing;
- large encoding/decoding;
- future compression/decompression;
- future CSV transformation.

## 15.3 Scope Limit

Build one reusable abstraction and use it in enough showcase tools to prove it.

Do not build a generalized distributed job system.

Do not build a worker pool unless the implementation is trivial.

---

# 16. Error and Failure Isolation

Failure isolation is mandatory.

## 16.1 Requirements

A tool-level error should not leave the app unusable.

At minimum:

- parsing errors stay inside the tool;
- rejected worker jobs stay inside the tool;
- failed API calls stay inside the tool;
- the sidebar remains functional;
- route navigation remains functional.

## 16.2 Recovery

Tools should offer simple recovery where useful:

- clear;
- reset;
- retry;
- cancel;
- return to deck.

No elaborate crash-reporting platform is required.

---

# 17. Dependency Philosophy

The project is library-forward.

Use mature third-party libraries where they materially reduce implementation effort or increase correctness.

Examples of acceptable library use:

- Markdown parsing/rendering;
- diffing;
- regex utilities;
- JWT parsing;
- syntax highlighting;
- formatting/parsing;
- UUID generation;
- hashing where browser-native APIs are insufficient;
- PWA helpers already natural to Angular.

## 17.1 Dependency rule

A dependency is acceptable when:

- it solves a real problem;
- it works in the browser;
- it does not require a server;
- it is reasonably maintained;
- it does not introduce a fundamentally conflicting architecture.

## 17.2 Not a Priority

Do not spend time rewriting mature libraries to reduce dependency count.

---

# 18. Testing Strategy

Selected quality posture:

> Ship first.

Testing should protect the framework and critical paths, not chase a coverage number.

## 18.1 Required test targets

### Unit tests

Focus on:

- tool registry behavior;
- persistence policy handling;
- worker execution wrapper;
- key pure transformation helpers;
- route metadata generation if custom.

### Smoke / integration tests

At minimum verify:

- application loads;
- deck renders;
- tool can be opened from navigation;
- command/search can find a tool;
- direct tool route resolves;
- 404 fallback recovers intended route;
- offline shell behavior works at a basic level;
- at least one worker-backed tool completes successfully.

## 18.2 Deferred

- E2E tests for every tool;
- exhaustive accessibility automation;
- cross-browser CI matrix;
- visual regression infrastructure;
- performance lab;
- coverage percentage gates.

---

# 19. Accessibility Baseline

Accessibility is important but not the primary optimization target.

Minimum expectations:

- interactive controls are keyboard reachable;
- focus is visible;
- buttons use semantic elements;
- form controls have names/labels;
- command palette can be dismissed by keyboard;
- navigation state is understandable;
- obvious contrast failures are avoided — the bright/bold accent colors used throughout the UI (Section 8.5) must still meet a reasonable text/status contrast bar against the dark background, not just look vivid.

Formal accessibility certification is out of scope.

---

# 20. Initial Showcase Tool Set

The weekend MVP shipped **9 tools**, chosen because together they exercise different framework capabilities (parsing, worker execution, persistence policy, sensitive-data handling, third-party rendering, split-pane layouts, live computation). A 10th tool, UUID Generator / Inspector, was added ahead of schedule as the extension-speed proof (§3.1.A).

Each tool originally shipped with its own detailed feature list and a per-item "explicitly deferred" list; those lists are no longer reproduced here since every item on them was resolved during Phases 1–7 (see §21 Phase 7 in particular, which closed out this exact backlog). What still matters from V1 is *why* each tool was chosen — that framework-breadth rationale is preserved below.

| Tool | Category | Why it was included |
|---|---|---|
| JSON Formatter / Validator | Data | Core daily utility; strong test of parsing, errors, formatting, large text input, copy actions, and worker execution. |
| Regex Tester | Developer | Tests dynamic state, flags, match highlighting, potentially dangerous computation, and worker cancellation. |
| Unix Timestamp Converter | Date & Time | Small, fast tool validating the low-friction end of the architecture. |
| Base64 Encoder / Decoder | Encoding | Simple bidirectional transform and a good shared-layout test. |
| Markdown Preview | Documents | Tests split-pane layouts, third-party rendering, sanitization considerations, and live preview. |
| JWT Debugger | Security | Tests sensitive data handling, structured decode, nonpersistent default state, and warning UX. |
| Text Inspector | Text | Covers live computation and common text metrics with minimal complexity. |
| Hash Generator | Security / Encoding | Tests async browser APIs, binary/text conversion, and worker-friendly computation. |
| Text Diff | Text | Tests third-party libraries, larger inputs, two-pane layouts, rendering, and worker isolation. |
| UUID Generator / Inspector | Developer | Originally planned as Phase 1 item #12; shipped early as the timed extension-speed proof (§3.1.A) — added, registered, and verified in 2 minutes 50 seconds with zero shell/core edits. |

Every feature and every originally-deferred capability across these 10 tools was eventually shipped — see each tool's entry in the live app, and §21 Phases 1–7 for when and how.

---

# 21. Tool Roadmap

The roadmap deliberately extends beyond what any single delivery phase covers.

Phase 0 was the weekend commitment; it is complete. Phases 1–7 are also complete. Everything from Phase 8 onward is future work, taken up as decided rather than on any fixed schedule — see below for how that future work is organized.

---

## Phase 0 — Weekend Framework Showcase (✅ Complete)

1. JSON Formatter / Validator
2. Regex Tester
3. Unix Timestamp Converter
4. Base64 Encoder / Decoder
5. Markdown Preview
6. JWT Debugger
7. Text Inspector
8. Hash Generator
9. Text Diff
10. UUID Generator / Inspector — shipped early as the timed extension-speed proof (§3.1.A); originally planned as Phase 1 item #12 below.

**Goal:** Validate architecture breadth. **Achieved** — all 10 tools shipped, deployed, and verified live.

---

## Phase 1 — High-Frequency Core Utilities (✅ Complete)

10. URL Encoder / Decoder — ✅ shipped
11. Query String Parser / Builder — ✅ shipped
12. UUID Generator / Inspector — ✅ shipped early, see Phase 0
13. Case Converter — ✅ shipped
14. Whitespace Cleaner / Normalizer — ✅ shipped
15. Slug Generator — ✅ shipped
16. HTML Entity Encoder / Decoder — ✅ shipped
17. Color Converter — ✅ shipped
18. Number Base Converter — ✅ shipped

**Goal:** Validate the "new tool in ≤30 minutes" success criterion across a batch of simple tools. **Achieved** — all remaining Phase 1 tools shipped, tested, and verified against direct-route resolution.

---

## Phase 2 — Structured Data Utilities (✅ Complete)

19. YAML ↔ JSON Converter — ✅ shipped
20. XML Formatter / Validator-lite — ✅ shipped
21. CSV Viewer / Converter — ✅ shipped
22. JSONPath / JMESPath Tester — ✅ shipped
23. JSON Structural Explorer — ✅ shipped as a "Tree" view on the JSON Formatter tool, see §20

**Goal:** Exercise more complex third-party libraries and richer structured outputs. **Achieved** — `js-yaml`, `fast-xml-parser`, `papaparse`, `jsonpath-plus`, and `jmespath` are each wrapped behind a pure, worker-compatible transform; two new shared UI primitives (`app-tree-view`, `app-data-table`) were introduced for structural/tabular display.

---

## Phase 3 — Web / API Utilities (✅ Complete)

24. HTTP Status Code Reference — ✅ shipped
25. HTTP Header Inspector / Builder — ✅ shipped
26. cURL Command Inspector / Converter — ✅ shipped, with code export to 8 languages
27. Cron Expression Parser / Next-Run Preview — ✅ shipped
28. User-Agent Parser — ✅ shipped
29. MIME Type Reference / Lookup — ✅ shipped

**Goal:** Cover common web/API-adjacent lookups and parsers entirely offline. **Achieved** — all 6 tools are fully local; `cron-parser`/`cronstrue` and `ua-parser-js` were added, and two new shared primitives (`app-copy-button`, `app-key-value-editor`) were extracted once their patterns started repeating.

### Notes

Local static references are preferred when practical. The HTTP Status Code Reference and MIME Type Reference ship as curated, verified-accurate subsets of their IANA registries rather than exhaustive transcriptions.

---

## Phase 4 — Developer Workflow Utilities (✅ Complete)

30. Semantic Version Comparator — ✅ shipped, with sorting and range-satisfaction checking
31. Glob Pattern Tester — ✅ shipped
32. URL / URI Inspector — ✅ shipped, with editable round-trip reconstruction
33. Date / Timezone Converter — ✅ shipped, as a multi-zone world clock
34. Duration Parser / Formatter — ✅ shipped
35. Random Data Generator — ✅ shipped, with full `@faker-js/faker` category coverage

**Goal:** Cover common developer-workflow utilities (versioning, glob matching, URL inspection, timezones, durations, fake test data) entirely offline. **Achieved** — all 6 tools are fully local; `semver`, `picomatch`, `luxon`, `parse-duration`, `humanize-duration`, and `@faker-js/faker` were added, continuing the library-forward pattern (§17) for fiddly parsing/formatting domains.

---

## Phase 5 — Richer Editors and Advanced Tools (✅ Complete)

36. WYSIWYG Rich Text Editor — ✅ shipped, via TipTap with sanitized HTML and Markdown export
37. Advanced Markdown Workspace — ✅ shipped, with GFM extras, front matter, a table of contents, and synced-scroll preview
38. JWT Signature Verification — ✅ shipped, as a separate JWT Signature Verifier tool (HMAC, RSA/EC/RSA-PSS, and JWKS)
39. File Hashing — ✅ shipped, as a separate File Hash Generator tool
40. File Base64 Conversion — ✅ shipped, as a separate File Base64 Converter tool
41. Advanced Diff / Merge — ✅ shipped, with line/word/character diffing, a merge view, and unified-diff export
42. JSON Schema Validator — ✅ shipped, supporting both Draft-07 and 2020-12

**Goal:** Validate that larger third-party libraries, new file-handling patterns, and the platform's first genuinely network-capable tool could ship without weakening the local-first/offline-first architecture. **Achieved** — `jose`, `ajv`/`ajv-formats`, the TipTap stack, and `markdown-it-task-lists` were added, all lazy-loaded per tool; a shared `FileDrop` component and `downloadFile` utility were introduced. JWT Signature Verification's JWKS-fetch mode is the first tool to call `fetch`, scoped so the tool's other, fully local modes stay usable offline.

---

## Phase 6 — Executable / Sandboxed Tools (✅ Complete)

48. JavaScript Playground — ✅ shipped, runs JS snippets with captured console output and a hard execution timeout
49. HTML Preview — ✅ shipped, live-renders pasted HTML including its own inline `<script>`/`<style>`
50. Template Renderer — ✅ shipped, renders EJS templates against a JSON context, reusing the JS Playground's execution engine
51. Python Playground — ✅ shipped, runs Python via Pyodide (WebAssembly CPython, standard library only)

**Goal:** ship the platform's first arbitrary-code-execution tools without weakening DUDE's security posture. **Achieved** — a shared `src/app/shared/code-sandbox/` module (an opaque-origin sandboxed iframe plus a nested, force-terminable Worker) backs the JS Playground and Template Renderer; HTML Preview uses a tool-local variant since it needs a live DOM; Python Playground self-hosts the Pyodide runtime behind its own lazy service-worker asset group. Ships as Milestones 17–20; §33's former standing "no arbitrary code execution" rule is amended accordingly — see §33.

### Notes

Implementation details (the sandbox's CSP/CORS/iframe-recreation gotchas, and the EJS client-bundle packaging decision) are documented at `src/app/shared/code-sandbox/code-sandbox-doc.ts` rather than repeated here.

---

## Phase 7 — Showcase Backlog Closure (✅ Complete)

Every item explicitly deferred in the original showcase tools' write-ups (§20), revisited once the platform had grown well past that MVP. Most landed as enhancements to the existing tool rather than new tools. Five items were large/independent enough to become new tools:

43. JWT Signer — ✅ shipped, symmetric (HMAC) and asymmetric (RSA/EC/RSA-PSS) signing with in-browser key-pair generation
44. Recurrence Rule Calculator — ✅ shipped, expands an iCal-style RRULE recurrence into occurrence dates
45. Date Calculator — ✅ shipped, business-day-aware date arithmetic and day-counting
46. Directory Diff — ✅ shipped, folder-vs-folder added/removed/changed comparison with a text line-diff or binary hex-diff drill-down
47. Git Repo Browser — ✅ shipped, client-side commit-history browsing and commit-vs-commit diffing over a locally-selected `.git` folder

**Goal:** close out the showcase backlog without compromising the offline-first, dependency-minimal architecture. **Achieved** — `uuid`, `rrule`, `isomorphic-git`, `jsonrepair`, `regexp-tree`, and `franc-min` were added; Text Inspector's grammar-check mode became the second tool (after JWT Signature Verifier) to call `fetch`; Markdown Preview/Workspace gained style presets plus a sandboxed-iframe path for custom CSS/plugins — all with no changes to the shell/registry/persistence/worker infrastructure.

**Explicitly out of scope at the time, now revisited:**

- **AI-based regex generation/explanation** still needs either a hosted LLM proxy or local-model support DUDE doesn't have; it now belongs under the Local AI Utilities carve-out in §21's Track A roadmap rather than under desktop packaging specifically.
- **Collaborative real-time editing** (Markdown) needs hosted rooms/documents/auth — this remains a permanent non-goal (§5.2) independent of the desktop track, since it requires multi-user cloud infrastructure DUDE does not take on.

### Notes

Grammar checking's LanguageTool dependency is the platform's first *external* API call (JWT Signature Verifier's JWKS mode fetches only URLs the user supplies themselves); its free-tier limits are why it's a manual "Check" button rather than live-as-you-type.

Git Repo Browser and Directory Diff both read an entire local folder into browser memory via `<input webkitdirectory>` rather than the File System Access API's `showDirectoryPicker()`, for broader browser support.

---

## Phase 8 — Downloadable Desktop App with a Bundled Backend (✅ Complete — Framework: Establishes the Desktop-Packaging Track — all 8 stages shipped)

Like Phase 0, this is a framework-first phase: it adds a new deployment target and a bundled backend, not new tools with registry entries. Tool-level enhancements that land as part of this phase (Regex Tester, Advanced Markdown Workspace, Directory Diff, Git Repo Browser) stay documented inside their own §20 sections rather than incrementing the shipped-tool count, the same way Phase 7's enhancements did.

**Goal:** ship a Windows Electron build of DUDE that is a strict superset of the web PWA — every existing tool works identically — while unlocking backend-dependent features that are impossible on static GitHub Pages hosting: an AI-assisted regex workflow and real-time collaborative Markdown editing.

**Approved direction**, decided directly with the user:

- **Packaging:** Electron.
- **Backend:** a localhost-only LLM proxy process, provider-agnostic (a configured OpenAI-compatible base URL + API key, so it works with OpenAI, Anthropic-compatible gateways, local Ollama, OpenRouter, etc.) — plus a local collab server for same-machine/LAN sessions, extended by a **BYO relay server** for cross-network collaboration.
- **BYO relay, not a DUDE-run service:** DUDE ships the relay server's code (e.g. as a Dockerfile/small deployable unit in this repo); each user self-hosts their own instance and points their desktop app at it. DUDE itself never operates shared infrastructure — see the amended §5.2 non-goals note.
- **Tool surface:** superset — same Angular codebase, all existing tools unchanged; desktop-only features are additive and feature-detected.
- **Distribution:** Windows only for now, via the Microsoft Store (free Microsoft-signed) and/or an unsigned installer on the GitHub Releases page.

### Staged roadmap

Each stage is expected to become its own Milestone number when implemented, following the existing convention that framework-layer work gets its own milestone rather than being folded into a tool commit.

1. **Electron shell** — package the existing Angular app in Electron with no new features; prove build/run/package works before anything else is layered on. Establishes a platform/environment detection service (web vs. desktop) as the seam every later stage conditions on. **✅ shipped as Milestone 21.**
2. **Native file access** — replace `<input webkitdirectory>` in Directory Diff and Git Repo Browser with Electron's native `dialog` + filesystem APIs, via a sandboxed preload/IPC bridge (no direct Node access from the renderer). Upgrades both tools from one-shot snapshots to live, re-scannable folder handles, desktop-only. **✅ shipped as Milestone 22.**
3. **OS-level secret storage** — a new `secure-local` tier backed by Electron `safeStorage` (OS keychain), available only on desktop. Lays the groundwork for storing the LLM proxy's API key safely. **✅ shipped as Milestone 23.**
4. **Local LLM proxy + AI regex features** — the localhost-only backend process holds the user-supplied, provider-agnostic LLM credential; wires up AI-based regex generation (natural-language → regex) and an "AI Explain" panel on Regex Tester, next to the existing rule-based `regexp-tree` explainer, which stays as the offline/web fallback when no key is configured. **✅ shipped as Milestone 24.**
5. **Desktop shell chrome** — system tray, launch-on-login, native OS notifications, a global-hotkey clipboard quick-action registry (Base64 encode/decode, UUID generate, SHA-256 hash), and file-watch infrastructure (auto-reload-on-change is deliberately not wired into any tool yet — see the Stage 5 note below). **✅ shipped as Milestone 25.**
6. **Local collab server** — a same-machine/LAN real-time collaboration backend for Advanced Markdown Workspace, CRDT-based via Yjs. **✅ shipped as Milestone 26.**
7. **BYO relay server for cross-network collab** — a standalone relay server shipped from this repo (`relay/`, with a `Dockerfile`) that users self-host and point their desktop app at via a configured URL in Settings, extending Stage 6's collab session across networks. **✅ shipped as Milestone 27** — see the Stage 7 note below for the room/session identity model actually implemented, and what of the original open question remains deferred.
8. **Auto-update + distribution** — `electron-updater` against GitHub Releases; a new CI workflow builds a Windows installer via `electron-builder` (NSIS for the unsigned GitHub Releases path, MSIX/appx for Microsoft Store submission), separate from the existing GitHub Pages `deploy.yml`. Store submission itself (Partner Center) is a manual process, not automated in CI. **✅ shipped as Milestone 28** — see the Stage 8 note below for the versioning/release-automation model actually implemented and the placeholder Store identity values that still need a real swap before submission.

**Explicitly deferred within Phase 8:** macOS/Linux builds, code-signed non-Store distribution, named-but-accountless relay participants (Stage 7 shipped anonymous room codes only — see the Stage 7 note), any provider-specific (non-OpenAI-compatible) LLM integration, wiring Stage 5's file-watch capability into any specific tool's auto-reload UX.

### Security notes (extending §33)

- The bundled backend must bind to `127.0.0.1` only (falling back to `127.0.0.2`, `127.0.0.3`, etc. if something else is already listening there, or to another user-provided address) — never an external interface. **One deliberate, narrow exception:** Stage 6's local collab server binds `0.0.0.0`, since LAN reachability is the entire point of that stage; the mitigation is a random per-session code required as a `?code=` query param before any WebSocket connection is accepted, not network-interface restriction.
- The Electron renderer keeps `contextIsolation` on and no direct `nodeIntegration`; all native access (files, secrets, tray, IPC to the local backend) is mediated through a preload bridge — consistent with the sandboxing precedent already set by the Advanced Markdown Workspace's plugin `<iframe>`s (§20; §33).
- A self-hosted BYO relay server is untrusted-by-default from the app's perspective: treat its messages as data, not as anything the app should extend trust or execute based on. In practice (Stage 7), this means every message a relay forwards is applied purely as opaque Yjs CRDT sync/awareness data — the relay never supplies a URL, config, or code the app follows or executes.

### Notes

Stage 1 chose a local loopback static server (bound `127.0.0.1`, OS-assigned port) to serve the built app to the `BrowserWindow` over `http://`, instead of a `file://` load — this means the existing path-based router needed no hash-routing fork, and the server does real SPA fallback to `index.html` instead of needing the web build's `public/404.html` GitHub Pages workaround. The new `electron/` folder (main process + preload, compiled by `esbuild` to CommonJS) stays entirely outside `tsconfig.app.json`, mirroring the existing `tsconfig.worker.json` precedent for a second narrow build target; see `electron/AGENTS.md` for the contextIsolation/sandbox/preload-bridge rule it documents. A new `angular.json` `electron` build configuration overrides `baseHref` to `/` and disables the service worker (unsupported/redundant outside a real HTTP(S) origin's normal lifecycle, and superseded by Stage 8's `electron-updater`); `PlatformService` (§27.6) also gates the service worker's runtime registration off under Electron as a second layer of defense. `npm run electron:dev` points Electron at a live `ng serve` for hot-reload development; `npm run electron:start` runs the full build → compile → launch path. Packaging (`electron-builder`, installers, CI) stays deferred to Stage 8, per plan.

Two bugs surfaced only through live app testing, not the unit suite or code review — consistent with the Phase 6 sandbox lesson that this class of issue needs real runtime verification:
1. `app.getAppPath()` resolves to the entry script's own directory (`dist/electron`), not the repo root, when Electron is launched with a direct file path (`electron dist/electron/main.js`) rather than a project directory — every request 404'd until the static server's root was resolved relative to `__dirname` instead.
2. The Python Playground's opaque-origin sandboxed iframe makes its dynamic `import()` of Pyodide's `.asm.mjs` a CORS-mode fetch even against a same-looking `http://127.0.0.1` origin — the same gotcha already documented for `ng serve` in the Phase 6 code-sandbox notes. The local static server needed its own `Access-Control-Allow-Origin` response header, the same fix GitHub Pages provides for free and `ng serve` needed added explicitly.

**Stage 2** replaced `ScannedFile`'s `File` reference with a source-agnostic `{path, read(): Promise<ArrayBuffer>}` shape, so `directory-tree-diff.ts`, `directory-diff.worker.ts`, and `git-diff-service.ts` needed zero changes for the native path to slot in alongside the unchanged web path. Directory Diff's native path still buffers eagerly (a native picker + fs walk, with a new Rescan action neither tool had before); Git Repo Browser instead got a new *lazy*, IPC-backed `isomorphic-git` `FsClient` (`git-native-fs-client.ts`) that reads on demand with no upfront buffering — more work than eager buffering, chosen deliberately for scalability on large repos, confirmed against `isomorphic-git`'s actual `PromiseFsClient` type rather than assumed.

**Stage 3** deliberately did *not* fold `secure-local` into `PersistenceService.signal()`'s synchronous model — Electron's `safeStorage` is async, so `SecureLocalService` is a standalone service with its own async `get`/`set`/`remove`, and `PersistenceService.signal()` throws defensively if `'secure-local'` is ever passed to it. Ships infrastructure only in isolation; Stage 4's Settings tool is its first real consumer.

**Stage 4** reuses `SecureLocalService` for *all three* LLM fields (base URL, model, API key), not just the key — even though base URL/model aren't secret, this means the main process can read the whole config through the one mechanism it already has, with no separate "push config to main" IPC call and no second on-disk store. The proxy is non-streaming by design (a dumb pass-through with auth injection) and lazily started on first use, restarted whenever the stored config changes.

**Stage 5** moved `base64-codec.ts` and `hash-compute.ts` out of their tool folders into a new `src/shared-logic/` directory — the first precedent for `electron/` runtime-importing anything from outside itself (previously type-only). Closing the main window now hides it to the tray instead of quitting, a deliberate behavior change from Stage 1's `window-all-closed` → `app.quit()`. File watching shipped as infrastructure only — no tool auto-reloads on a watched file changing yet, since that needs a "reload / keep my edits" UX design pass this stage didn't resolve.

**Stage 6** hand-rolled the `y-websocket` wire protocol (`y-protocols/sync` + `y-protocols/awareness` message framing over a plain `ws` WebSocket) rather than depending on `y-websocket` itself, whose package only exports the browser `WebsocketProvider` client under a resolvable subpath, not its server utility. This is also the one narrow, deliberate exception to every other Phase 8 backend's `127.0.0.1`-only rule: the collab server binds `0.0.0.0` (LAN reachability is the point), mitigated by a random per-session code required before a connection is accepted. A unit test simulating two paired clients (`markdown-collab-client.spec.ts`) caught a real duplication race before it ever ran live: if both sides of a fresh session tried to seed initial content, both texts got concatenated in CRDT-merge order. Fixed by making only the session *host* ever seed content — a *joiner* always starts empty and adopts whatever the host provides.

**Stage 7** factored the Yjs room logic out of `electron/collab-server.ts` into `collab-relay/room.ts`, shared with the new standalone `relay/` deployable, rather than duplicating the wiring twice. The relay supports multiple concurrent rooms keyed by the WebSocket URL path, each room's code established by its first connection's own client-generated `?code=` (the relay itself never issues codes — same pattern as the local server), torn down once its last participant leaves. Advanced Markdown Workspace's "Host via Relay" option connects directly to `<relayUrl>/<roomId>` with no Electron IPC involved, since relay-hosting is really just a specially-generated join. Verified with a real two-client WebSocket round-trip against a running relay instance, not only unit tests. The room/session identity model shipped is intentionally minimal — anonymous, client-generated room codes only; named-but-accountless participants (the richer half of the original open question) remains deferred.

**Stage 8** made versioning and release-cutting fully automatic rather than a manual decision: `package.json` started at `0.0.1`, and a new `version-bump.yml` workflow bumps the patch version and pushes a matching `vX.Y.Z` tag on **every** push to `master` — not just Electron-relevant commits — so every future commit, tool or framework, becomes a desktop release candidate; this was a deliberate, explicit choice made with the user, not an oversight. The tag push triggers a separate `release.yml` (Windows runner, its own `npm test` gate since the bump job itself runs unconditionally with no test gate) that runs `electron-builder` and publishes both an unsigned NSIS installer and an MSIX/appx package to the matching GitHub Release. The MSIX ships with **placeholder** Microsoft Store package-identity values (`electron-builder.yml`'s `appx` block) — it's real and sideloadable today, but not submittable to the Store until those are swapped for values reserved through a real Microsoft Partner Center account, which the project doesn't have yet. `electron-updater`'s `autoUpdater` only drives the NSIS install path (downloads a new release automatically in the background, installs only when the user clicks "Restart & Install" — never silently, mirroring the web build's existing update precedent); the MSIX path would update through the Store/App Installer's own infrastructure instead, out of scope here. A new `DesktopUpdateService` (`core/platform/`) mirrors the shape of the existing web-only `UpdateService` but stays fully separate — `update-badge.ts` is the only shared file, branching internally on `PlatformService.isDesktop()` so `shell-layout.html` needed no changes at all.

---

Everything below is organized into two tracks. **Track A — Browser-Extensible** covers tool ideas that are fully implementable client-side today — parsing, formatting, computation, encoding, generation, and "upload a file and inspect it" tools — with no dependency on the desktop-packaging track established in Phase 8 (§23). **Track B** (below, after Track A) covers ideas that genuinely need live OS/network/filesystem/socket access a browser sandbox cannot provide, and are explicitly gated on that desktop track (§21 Phase 8). The split is deliberate: it lets the large majority of the roadmap doc's ideas stay on the current architecture's committed near-term path, while keeping the smaller, genuinely native-only subset clearly separate and non-committed until Phase 8 is picked up.

## Phase 9 — Structured Data Depth (Proposed — Track A: Browser-Extensible)

Goal: extend the Data category with power-tools and additional format support beyond the core JSON/YAML/XML/CSV converters already shipped.

1. Universal Structured Data Converter — single workbench converting between JSON, YAML, XML, TOML, and CSV
2. TOML Formatter / Validator
3. INI Formatter / Parser
4. Properties File Parser
5. JSON Flatten / Unflatten
6. JSON Merge
7. JSON Patch Generator
8. JSON Patch Tester
9. JSON Pointer Tester
10. JSON Sort Keys
11. JSON Lines / NDJSON Viewer
12. CSV ↔ SQL Converter (INSERT statement generation both directions)
13. CSV Delimiter Detector
14. CSV Column Statistics
15. CSV Cleaner
16. CSV Deduplicator
17. CSV Join / Merge
18. CSV Pivot
19. CSV Filter / Sort
20. XML XPath Tester
21. XML Schema / XSD Validator
22. XML ↔ CSV Converter
23. YAML Linter
24. YAML Merge
25. YAML Anchor / Alias Visualizer
26. YAML Path Tester
27. Protobuf Decoder (upload a `.proto` + payload)
28. MessagePack Decoder
29. BSON Viewer
30. CBOR Viewer
31. Avro Viewer
32. Parquet Viewer
33. SQLite File Viewer (read-only, uploaded `.sqlite` file — distinct from a *live* database connection, which is Track B)

### Notes

Large JSON Streaming Viewer and JSON Table Viewer extend the existing JSON Formatter's Tree view (§20) rather than becoming separate tools. `sql.js` (SQLite compiled to WASM) is the natural library for #33, consistent with the library-forward dependency philosophy (§17).

---

## Phase 10 — Text Processing Depth (Proposed — Track A: Browser-Extensible)

Goal: extend the Text category with a full Unicode/line-manipulation toolkit and deeper text analysis than Text Inspector currently covers.

1. Unicode Character Inspector
2. Unicode Code Point Converter
3. Invisible Character Viewer
4. Control Character Viewer
5. Zero-Width Character Detector
6. ASCII Table
7. Unicode Table
8. Unicode Normalization (NFC / NFD / NFKC / NFKD)
9. Smart Quotes Normalizer
10. Line Ending Converter (CRLF / LF / CR)
11. Tabs ↔ Spaces
12. Indentation Converter
13. Duplicate Line Remover
14. Duplicate Word Detector
15. Sort Lines
16. Shuffle Lines
17. Reverse Lines
18. Unique Lines
19. Prefix / Suffix Lines
20. Add Line Numbers
21. Remove Line Numbers
22. Extract Columns
23. Find / Replace
24. Regex Find / Replace
25. Multi-Cursor Text Transformer
26. Lorem Ipsum Generator
27. Placeholder Text Generator
28. ASCII Art Generator
29. ASCII Banner Generator
30. Keyword Frequency Analyzer
31. String Similarity Calculator (Levenshtein, Jaro-Winkler)
32. Soundex / Metaphone
33. Text Tokenizer
34. N-Gram Generator
35. Advanced Diff: semantic JSON diff mode
36. Advanced Diff: semantic YAML diff mode
37. Advanced Diff: semantic XML diff mode
38. Advanced Diff: image diff mode
39. Advanced Diff: ignore-whitespace / ignore-line-endings / ignore-case options
40. Advanced Diff: moved-block detection

### Notes

Items 35-40 are enhancements to the existing Advanced Diff / Merge tool (§20) rather than new tools. Language Detector and Readability Analyzer already shipped (§21 Phase 7); Text Statistics already ships on Text Inspector.

---

## Phase 11 — Encoding & Numeric Representation Lab (Proposed — Track A: Browser-Extensible)

Goal: turn Encoding into a full representation/conversion laboratory and give Developer a programmer-calculator suite.

1. Hex Encoder / Decoder
2. Binary Encoder / Decoder
3. ASCII ↔ Hex
4. UTF-8 ↔ Hex
5. UTF-16 ↔ Hex
6. Base16
7. Base32
8. Base36
9. Base58
10. Base62
11. Base85 / ASCII85
12. Base91
13. ROT13
14. ROT47
15. Punycode Converter
16. JavaScript Escape / Unescape
17. CSS Escape / Unescape
18. SQL Escape Helper
19. Shell Escape Helper
20. PowerShell Escape Helper
21. Quoted-Printable Encoder
22. URL Percent-Encoding Inspector
23. Data URI Generator
24. Data URI Decoder
25. File → Hex Dump
26. Hex Dump → File
27. Endianness Converter
28. IEEE-754 Floating Point Inspector
29. Integer Representation Inspector
30. Two's Complement Calculator
31. Bitwise Calculator
32. Programmer Calculator (binary/octal/decimal/hex with bit-width visualization)
33. Arbitrary Precision / BigInt Calculator
34. Scientific Notation Converter
35. Percentage Calculator
36. Ratio Calculator
37. Modular Arithmetic
38. GCD / LCM
39. Prime Checker / Factorization
40. Range Generator
41. Statistics Calculator
42. Matrix Calculator
43. Expression Evaluator

### Notes

Base64/Base64URL, JSON Escape/Unescape, and Unicode Escape/Unescape already ship. This phase absorbs the source doc's separate "Numbers & Mathematics" section rather than opening a new category — everything here fits Encoding or Developer without a taxonomy change.

---

## Phase 12 — Security, Cryptography & Certificate Depth (Proposed — Track A: Browser-Extensible)

Goal: extend Security with the hashing/encryption/key-generation/certificate-inspection tools that don't require a live network fetch.

1. Additional hash algorithms on Hash Generator: SHA-3, BLAKE2, BLAKE3, xxHash, CRC32 / CRC64
2. HMAC Generator (HMAC-SHA256, HMAC-SHA512, custom key)
3. Password Generator
4. Passphrase Generator
5. Password Entropy Calculator
6. Password Strength Analyzer
7. AES Encrypt / Decrypt (GCM, CBC)
8. ChaCha20 / ChaCha20-Poly1305 Encrypt / Decrypt
9. RSA Key Generator
10. EC Key Generator
11. Ed25519 Key Generator
12. PEM Inspector
13. DER Inspector
14. CSR Generator
15. CSR Inspector
16. SSH Key Generator
17. SSH Public Key Inspector
18. SSH Fingerprint Calculator
19. X.509 Certificate Inspector (uploaded cert)
20. Certificate Chain Viewer (uploaded chain)
21. Certificate Expiration Checker (uploaded cert, one-shot — an ongoing *monitor* is Track B)
22. Certificate SAN Viewer
23. Certificate Fingerprint Calculator
24. PKCS#12 / PFX Inspector
25. PEM ↔ DER Converter
26. Certificate Chain Builder

### Notes

Web Crypto API covers most of items 7-11 natively; `node-forge` or similar is the fallback for PKCS#12/CSR handling per the library-forward philosophy (§17). Live TLS handshake fetching (`TLS Certificate Fetcher`, cipher/ALPN/SNI inspection, expiration *monitoring* over time) needs a live socket and is Track B.

---

## Phase 13 — Auth & JWT Depth (Proposed — Track A: Browser-Extensible)

Goal: go beyond decode/sign/verify into the surrounding OAuth/OIDC tooling developers need, all operating on user-pasted tokens/URLs rather than live flows.

1. JWKS Viewer (paste a JWKS document)
2. JWKS → Public Keys
3. JWT Claims Analyzer
4. JWT Expiration Visualizer
5. OAuth Token Inspector
6. OAuth 2.0 Playground (construct/inspect requests and responses manually, not a live redirect flow)
7. OpenID Connect Discovery Document Inspector (paste a discovery document)
8. PKCE Generator
9. PKCE Verifier
10. OAuth Scope Parser
11. Basic Auth Header Generator
12. Bearer Token Builder
13. AWS Signature V4 Inspector
14. HTTP Digest Auth Helper

### Notes

JWKS fetching-by-URL already ships on the JWT Signature Verifier (§20); these operate on pasted/uploaded material instead, so no new network policy is introduced.

---

## Phase 14 — Date & Time Depth (Proposed — Track A: Browser-Extensible)

Goal: round out Date & Time with additional parsers and time-math utilities beyond timestamp conversion, timezones, duration, and cron.

1. ISO 8601 Parser
2. RFC 3339 Parser
3. RFC 2822 Parser
4. Unix Microseconds / Nanoseconds support on the Unix Timestamp Converter
5. Timezone Offset Comparator
6. DST Transition Explorer
7. Week Number Calculator
8. Calendar Week Converter
9. Relative Time Parser ("3 days ago" ↔ timestamp)
10. Duration → ISO 8601
11. Stopwatch
12. Countdown
13. Epoch Timeline Visualizer
14. Cron Previous-Runs Preview (Cron Parser currently shows next-run only)
15. Cron Humanizer depth (richer plain-English breakdown, e.g. "every six hours, Monday through Friday" plus the next 25 executions)

### Notes

`luxon` already covers most of the parsing/timezone math per Phase 4; items 1-3 and 14-15 extend the existing Cron Parser / Unix Timestamp Converter rather than becoming new tools.

---

## Phase 15 — Web & HTTP Depth (Proposed — Track A: Browser-Extensible)

Goal: deepen the Web category's URL/header/request tooling and broaden cURL's language coverage, all construct-and-display rather than send-a-real-request.

1. URL Parser
2. URL Builder
3. URI Component Visualizer
4. URL Normalizer
5. Relative URL Resolver
6. URL Comparison Tool
7. URL Safety Inspector (heuristic checks: punycode homograph risk, suspicious TLD, etc.)
8. Punycode Domain Inspector
9. HTTP Request Builder (construct and display a request, no send)
10. HTTP Response Viewer (paste/paste-and-format a response)
11. Cookie Parser
12. Set-Cookie Builder
13. Accept Header Builder
14. Cache-Control Builder
15. CSP Builder
16. CORS Header Builder
17. Content-Disposition Builder
18. Authorization Header Builder
19. Range Header Builder
20. HTTP Date Converter
21. cURL → additional language targets: C#, Python requests, Python httpx, Java HttpClient, Kotlin, Go, Rust, PowerShell, PHP, Ruby, Dart, Swift
22. HTTP Request → cURL (reverse of the existing cURL Inspector)
23. Multipart Form Data Builder
24. Form URL Encoded Builder

### Notes

Items 21-22 extend the existing cURL Command Inspector / Converter (§20), which already covers 8 languages; Header Parser and HTTP Status Reference already ship.

---

## Phase 16 — Regex Depth (Proposed — Track A: Browser-Extensible)

Goal: extend Regex Tester with visualization and benchmarking beyond the existing explainer/flavor-notes/replace features (§21 Phase 7).

1. Regex Visualizer (railroad diagram of the pattern)
2. Regex Benchmark (catastrophic-backtracking risk / timing across sample inputs)
3. Regex Flavor Converter (translate a pattern between JS/.NET/Java/Python/PCRE/Go flavors, distinct from the existing compatibility-notes panel)
4. Regex Generator (non-AI, heuristic: build a pattern from example strings) — the AI-based version stays deferred per §21 Phase 7

### Notes

A visual regex railroad diagram is one of the higher-value additions here; `regexp-tree`'s existing AST (already a dependency, §21 Phase 7) is the natural base for both the visualizer and the flavor converter.

---

## Phase 17 — Design, Markup & Media Tools (Proposed — Track A: Browser-Extensible)

Goal: grow Color Converter into a full design toolkit and add CSS/HTML/image/QR tools, all File-API/canvas-based with no OS access required.

1. Color Converter: add LAB, LCH, OKLAB, OKLCH, HWB spaces
2. Contrast Checker / WCAG Compliance Checker
3. Palette Generator
4. Gradient Generator
5. Color Blindness Simulator
6. Tailwind Color Matcher
7. CSS Formatter / Minifier
8. CSS Specificity Calculator
9. CSS Selector Tester
10. Flexbox Playground
11. CSS Grid Playground
12. Box Shadow Generator
13. Border Radius Generator
14. CSS Transform Builder
15. CSS Animation Builder
16. Cubic-Bezier Editor
17. HTML Formatter / Minifier
18. DOM Tree Viewer
19. HTML ↔ JSX Converter
20. HTML Entity Explorer
21. Meta Tag Generator
22. OpenGraph Preview
23. Structured Data / JSON-LD Tester
24. Markdown Table Formatter
25. Markdown Linter
26. Markdown Link Checker
27. Image Metadata Inspector
28. EXIF Viewer / Cleaner
29. Image Format Converter (PNG ↔ JPEG ↔ WebP ↔ AVIF)
30. Image Compressor
31. Image Resizer
32. Image Cropper
33. Base64 Image Viewer
34. SVG Viewer / Formatter / Optimizer
35. SVG ↔ Data URI
36. Pixel Color Picker (on an uploaded image, not the live screen — that variant is Track B)
37. QR Code Generator (URL, Wi-Fi, contact, TOTP presets)
38. QR Code Scanner (from an uploaded image or webcam frame)
39. Barcode Generator
40. Barcode Reader

### Notes

Items 24-26 extend Markdown Preview / Advanced Markdown Workspace (§20) rather than becoming new tools. Image tools use the Canvas/File APIs already available in-browser; `sharp`-equivalent WASM builds (e.g. `@squoosh/lib`) fit the library-forward philosophy (§17) for format conversion/compression.

---

## Phase 18 — Code Generators & Developer References (Proposed — Track A: Browser-Extensible)

Goal: ship the model-from-JSON generators (one of the highest-value additions per the source roadmap) and round out static developer references.

1. TypeScript Interface from JSON
2. C# Model from JSON
3. Java Class from JSON
4. Kotlin Data Class from JSON
5. Swift Codable Model from JSON
6. Python Dataclass from JSON
7. Rust Struct from JSON
8. Go Struct from JSON
9. SQL Schema (CREATE TABLE) from JSON
10. Dev Snippets Reference (searchable: HTTP headers, regex syntax, git/docker commands, PowerShell/Bash, SQL, CSS, HTML, Unicode, MIME types, cron syntax, chmod)
11. chmod / Unix Permissions Converter (`rwxr-xr--` ⇄ `754` with a visual owner/group/other checkbox grid)
12. Stack Trace Formatter / Parser (auto-detect framework)
13. Java Exception Formatter
14. .NET Exception Formatter
15. JavaScript Stack Trace Formatter
16. Python Traceback Formatter
17. Error Code Reference: Windows error codes / Win32 errors / HRESULT (with a universal search, e.g. `0x80070005` → `E_ACCESSDENIED`)
18. Error Code Reference: POSIX errno
19. Error Code Reference: Linux signals
20. Error Code Reference: SQL Server / PostgreSQL SQLSTATE / MySQL error codes
21. Error Code Reference: TLS alerts
22. Error Code Reference: DNS response codes
23. Compression Lab: gzip / deflate / Brotli / zstd (compress, decompress, ratio comparison)
24. ZIP / TAR / TAR.GZ archive create / extract
25. Dependency Version Comparator
26. Semantic Range Evaluator (`^1.2.3`, `~1.2.3`, `>=1.2 <2` against a version)
27. SemVer Range Visualizer
28. package-lock.json / pnpm-lock.yaml / yarn.lock Inspector
29. npm / NuGet / Maven / PyPI / Cargo Package Metadata Inspector — requires `fetch` to the relevant public registry; flag `networkRequired` scoped to that lookup only, same pattern as the existing JWKS-fetch and grammar-check tools (§20, §21 Phase 5/7)

### Notes

Items 1-9 are flagged as one of the highest-value additions in the source material. `pako`/`fflate` (gzip/deflate/zip) and `zstd-wasm` fit items 23-24 under the library-forward philosophy (§17). Semantic Version Comparator already ships (§21 Phase 4); items 25-28 extend it.

---

## Phase 19 — IDs, Mock Data & Git/SQL/Container Config Tooling (Proposed — Track A: Browser-Extensible)

Goal: broaden ID generation, turn Random Data Generator into a schema-driven mock-data studio, and add text/config-level Git, SQL, Docker/Kubernetes, and `.env` tooling that doesn't touch a live daemon, cluster, or database connection.

1. UUID v1, v3, v6, v7 (v4 and v5 already ship) — inspect the embedded timestamp on time-based versions
2. ULID Generator / Inspector
3. NanoID Generator
4. Snowflake ID Generator / Inspector
5. CUID Generator
6. KSUID Generator / Inspector
7. Mock Data Studio: schema-driven generation (field → `@faker-js/faker` category mapping, e.g. `{"name": "person.fullName", "email": "internet.email"}`) with JSON / CSV / SQL / XML / YAML / NDJSON export
8. Git Command Builder
9. Git Command Explainer (break an arbitrary command like `git rebase --onto develop feature-old feature-new` into what each argument means)
10. Gitignore Generator
11. Gitignore Tester
12. Branch Name Generator
13. Conventional Commit Builder
14. Commit Message Validator
15. Git URL Parser
16. Git Remote Inspector
17. SQL Formatter / Minifier / Beautifier
18. SQL Syntax Checker
19. SQL Parameterizer
20. SQL Dialect Converter (PostgreSQL / SQL Server / MySQL / MariaDB / SQLite / Oracle)
21. SQL Query Explainer (static, pattern-based — not a live `EXPLAIN` against a running database)
22. CREATE TABLE Generator
23. SQL → CSV, CSV → INSERT statements, JSON → INSERT statements
24. Schema Diff (comparing two schema definitions as text)
25. Dockerfile Linter / Formatter
26. Docker Compose Validator / Viewer
27. Docker Run ↔ Compose Converter
28. Kubernetes Manifest YAML Validator / Formatter
29. Kubernetes Manifest Diff
30. kubeconfig Inspector
31. Kubernetes Quantity Converter
32. Kubernetes CronJob Schedule Tester
33. Kubernetes Resource Requests Calculator
34. Kubernetes Base64 Secret Encoder / Decoder
35. `.env` Editor
36. `.env` Validator
37. `.env` Diff
38. `.env` ↔ JSON
39. Config File Comparator
40. Secret Detector (flag likely credentials/keys in pasted text or config)
41. Missing Environment Variable Detector
42. Configuration Merge Tool
43. IP Address Inspector (pure computation)
44. CIDR Calculator
45. Subnet Calculator
46. IPv4 ↔ Integer Converter
47. IPv6 Explorer
48. MAC Address Inspector

### Notes

Items 8-16 are distinct from the existing Git Repo Browser (§20), which already does commit-history browsing/diffing over a locally-selected `.git` folder via `isomorphic-git` — these are text/URL-level tools with no repository needed. Items 43-48 look like "Networking" but are pure math/string manipulation, so they stay Track A rather than joining the live Networking Toolkit in Track B. Live database connections (SQL Server/PostgreSQL/MySQL/Redis/MongoDB explorers) and live Docker/Kubernetes daemon/cluster access are Track B, not here.

---

## Phase 20 — File & Binary Format Inspection (Proposed — Track A: Browser-Extensible)

Goal: add file-upload-based binary/executable/format inspection — parsing whatever bytes the user provides, no OS access needed.

1. File Inspector (metadata, detected type, magic bytes, entropy — a "File Forensics" summary view)
2. File Signature Inspector / Magic Byte Detector
3. File Type Detector (deeper than the existing MIME-sniffing on File Base64 Converter, §21 Phase 7)
4. File Entropy Analyzer
5. Binary Strings Extractor
6. Hex Editor / Viewer
7. Hex Diff (extends the existing Directory Diff's binary hex-diff mode, §21 Phase 7, to a standalone single-file tool)
8. Byte Frequency Analyzer
9. Endianness Viewer
10. Binary Structure Inspector
11. PE (Windows executable) Header Viewer
12. ELF Header Viewer
13. Mach-O Header Viewer
14. Encoding Detector
15. BOM Detector / Remover
16. DPI Calculator
17. Aspect Ratio Calculator
18. Resolution Calculator

### Notes

Items 11-13 only need the uploaded binary's header bytes, not a running executable, so they stay Track A despite reading like "system" tools. Items 16-18 are pure math and were pulled out of the source doc's "Screen / Pixel Tools" section — the live-screen items in that section (screen ruler, live pixel picker) are Track B.

---

## Phase 21 — Cross-Tool Workflow Foundations (Track A, Speculative — Needs a Design Pass)

Unlike every other phase in this roadmap, this one is not "pick an item, build it in the existing pattern." It's the reserved landing spot for the cross-cutting architecture ideas in §22, each of which changes the tool registry contract itself rather than adding a new tool that consumes it. Nothing here is ready to schedule; each item stays a placeholder until it gets the design pass §22 calls for.

1. Universal Input/Output Contract — the foundational primitive; see §22.
2. Transformation Pipelines — depends on #1; see §22.
3. Smart Paste-Detection — depends on #1; see §22.
4. Persistent Workspace / Scratchpad — extends §14's persistence model across tools; see §22.
5. Persistent Local History — extends §14's persistence model across tools; see §22.

### Notes

This phase intentionally breaks from §4.7's "any single unit of work should be scoped and finished on its own terms" — these five items are listed together because they're interdependent (§22 explains the dependency order), not because they're meant to ship as one unit.

---

## Explicitly out of scope for now: Local AI Utilities

The source roadmap's "Local AI Utilities" section (AI-based regex generator/explainer, stack-trace/SQL/git-command/cron/JSON-schema/mock-data-schema explainers, log analyzer, error diagnosis assistant, code conversion assistant) is not drafted as a buildable phase here. Every item needs either a hosted LLM proxy or local-model (on-device inference) support DUDE doesn't have today — the same reason "AI-based regex generation/explanation" was deferred in §21 Phase 7. These stay deferred until/unless local-model support becomes its own initiative; the non-AI heuristic alternatives that don't need this infrastructure are covered instead where they exist (e.g. Phase 16's heuristic Regex Generator, Phase 18's static Stack Trace Formatters).

---

## Phase 22 — Networking Toolkit (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

Give DUDE a native network-diagnostics surface that a browser tab cannot provide on its own.

1. Ping — ICMP echo against a host, with round-trip timing
2. Traceroute — hop-by-hop path to a host
3. DNS Lookup — live resolution against system or custom resolvers
4. Reverse DNS Lookup
5. MX / TXT / SRV / NS / CNAME Lookup
6. DNS Propagation Tester — compare a record across multiple public resolvers
7. TCP Port Tester
8. UDP Port Tester
9. Port Scanner — a range of ports against a host
10. Local Port Viewer — ports currently bound on this machine
11. Active Connections Viewer
12. Listening Process Viewer
13. ARP Table Viewer
14. Route Table Viewer
15. Network Interface Viewer
16. Public IP Detector
17. Local IP Detector
18. Hostname Resolver
19. WHOIS Lookup
20. TCP/HTTP Connectivity Tester

### Notes

IP/CIDR/subnet math, MAC-address inspection, and IPv4↔integer conversion are pure computation and were placed in the browser-extensible track instead, despite reading as "networking" — see Track A.

---

## Phase 23 — DNS & Live TLS / Certificate Tools (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

Extend the existing (file-upload-based) certificate inspection tools with live, socket-level checks against a running service.

1. DNS Record Explorer (live)
2. DNSSEC Inspector
3. CAA Inspector
4. DKIM Inspector
5. SPF Inspector
6. DMARC Inspector
7. DNS-over-HTTPS Tester
8. DNS-over-TLS Tester
9. Multiple Resolver Comparator (Cloudflare / Google / Quad9 / system / custom)
10. TLS Connection Inspector
11. Cipher Suite Inspector
12. TLS Version Tester
13. ALPN Inspector
14. SNI Tester
15. HTTPS Configuration Analyzer
16. Live Certificate Chain Fetcher (host:port → full chain)
17. Certificate Expiration Monitor — background-checked, not just one-shot

### Notes

The existing/Track-A certificate tools (§21 Phase 12) work entirely from a user-supplied PEM/DER/PFX file; this phase is specifically the live-socket variants that need a real TCP connection to a remote host, which a browser sandbox cannot open.

---

## Phase 24 — Filesystem & Binary Forensics at Scale (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

Cover the filesystem operations that need arbitrary or background access beyond a single user-picked file or folder.

1. Folder Size Analyzer — recursive, across an arbitrary directory tree
2. Duplicate File Finder — across a drive or arbitrary tree
3. Batch Rename — pattern-based, across a selected tree
4. Directory Tree Generator — for an arbitrary path, not just a one-shot picked folder
5. File Splitter
6. File Joiner
7. Line-Ending Batch Converter — across a folder of files
8. File Encoding Converter — batch, across a folder
9. Directory Hash — a whole-folder content hash for tree comparison

### Notes

Single-file inspection (hex viewer, signature/entropy analysis, MIME/magic-byte detection, BOM handling, PE/ELF/Mach-O header viewers) is upload-based and already covered in Track A. Directory Diff and Git Repo Browser already ship today using `<input webkitdirectory>` for a one-shot folder snapshot — this phase is for operations that need to write back to, or watch, an arbitrary part of the filesystem, which that API doesn't support.

---

## Phase 25 — Windows & Process Tools (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

Make DUDE genuinely useful for day-to-day Windows systems work, once it has a native process.

1. Environment Variable Viewer
2. PATH Editor
3. Registry Viewer
4. Registry Diff
5. Services Viewer
6. Process Viewer — CPU, memory, threads, command line, environment, loaded modules, open ports, open files, parent/child relationships
7. Process Tree
8. Kill Process
9. Restart Process
10. Port → Process Lookup
11. Windows Event Log Viewer
12. Scheduled Tasks Viewer
13. Startup Programs Viewer
14. Installed Software Viewer
15. Windows Feature Viewer
16. DLL Inspector
17. Executable Dependency Viewer
18. Windows SID Inspector / Account Resolver
19. PowerShell Command Builder — building *and executing* a constructed command

### Notes

HRESULT decoding against a static lookup table is pure reference data and lives in Track A; a *live* HRESULT-from-running-process lookup, if ever built, would belong here instead. Per §33 Security Boundaries, any tool in this phase that can modify system state (kill/restart process, registry writes, services) must default to read-only with an explicit, unambiguous confirmation step before a destructive action — this is a hard requirement carried over from the existing security posture, not optional polish.

---

## Phase 26 — Local API & Server Toolkit (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

The single biggest "why would I install the desktop app" argument: a lightweight, local Postman/webhook.site/websocket-client alternative that never leaves the machine.

1. REST Client — request builder, collections, environment variables, request variables, secret variables, request history, authentication helpers, pre-request scripts, post-request tests, request timing
2. Local Mock HTTP Server — static and dynamic responses, configurable delay, error simulation (500 / timeout / rate limit / malformed response), route variables, request logging
3. Local Webhook Listener — inspector, request history, replay, modify-and-replay, generate test webhook, signature verification
4. WebSocket Client — message history, JSON formatting, binary message inspector, auto-reconnect, ping/pong inspector
5. Local Static HTTP Server — serve a folder over HTTP with one click
6. Local HTTPS Static Server
7. CORS Proxy
8. OpenAPI Live Introspection / Mock-Server-from-Spec — spin up a mock server directly from an OpenAPI document
9. GraphQL Playground — live query execution against a running endpoint

### Notes

Static OpenAPI/Swagger viewing, validation, diffing, and doc/client-code generation from an already-downloaded spec file is pure parsing and lives in Track A; only *live* introspection and *running* a mock server need this phase's local listening-socket capability.

---

## Phase 27 — Database Toolkit (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

Lightweight, read-leaning database browsing for local development — not a DBeaver replacement.

1. PostgreSQL Explorer
2. SQL Server Explorer
3. MySQL / MariaDB Explorer
4. Oracle Explorer
5. Redis Explorer
6. MongoDB Explorer
7. Live SQLite Explorer — connecting to a running/locked database file, as distinct from the static file viewer below

Each: connect → browse schemas/tables → preview rows → execute query → export results.

### Notes

A *static* SQLite file viewer (open a `.sqlite` file and browse it read-only, no live connection) needs no raw socket and belongs in Track A instead; this phase is specifically for live connections to a running database process, which requires a TCP client a browser can't open. SQL text tooling (formatting, dialect conversion, explain-plan narration, CREATE TABLE generation) is also Track A — it never touches a live connection.

---

## Phase 28 — Containers (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

Stay lightweight — a diagnostics companion, not a Docker Desktop replacement.

1. Live Docker Image/Container Inspector — size, ports, environment variables, of a running daemon
2. Docker Command Builder that executes against the local daemon
3. Live Kubernetes Resource Viewer — against a real, connected cluster
4. kubectl Command Builder that executes

### Notes

Dockerfile/Compose linting, formatting, validation, and `docker run`↔Compose conversion, plus Kubernetes manifest validation/formatting/diffing and kubeconfig inspection, are all static-file parsing and already live in Track A — this phase only covers the pieces that need a live daemon or cluster socket.

---

## Phase 29 — System Diagnostics, Clipboard & OS Integration (Proposed — Track B: Desktop-Enabled, requires the desktop-packaging track — §21 Phase 8)

The "why doesn't this work on my machine" page, plus the native conveniences that make a desktop app feel like part of the OS instead of a website in a window.

1. System Information Dashboard — OS, architecture, CPU, RAM, GPU, disk, network adapters, monitors, installed runtimes, hostname, logged-in user, uptime, virtualization status
2. Export Diagnostic Bundle — one click, packages the above for a bug report
3. Clipboard History
4. Clipboard Monitor — continuous, e.g. auto-formatting copied JSON
5. Screen Ruler
6. Live Pixel Color Picker — screen-coordinate based, distinct from the File-API-based picker in Track A
7. Context-Menu Actions — "Hash file," "Format JSON," "Open with DUDE," from the OS shell
8. Global Keyboard Shortcuts — system-wide, not just in-app
9. System Tray Presence and Actions
10. Drag-and-Drop File Handling / "Open With" File Association
11. Batch Processing Across Dropped Files
12. Saved Sessions — restore open tools/inputs on relaunch

### Notes

One-shot clipboard read/write (e.g. a tool's own Copy button) already works fine in-browser today and needed nothing new; only *history* and *continuous monitoring* require a native background process, which is why they're here. A Developer-Environment-Inspector idea from the source doc (detecting installed Git/Node/Python/Java/.NET/Docker/PowerShell/Go/Rust versions, PATH conflicts, multiple-runtime detection) is a natural addition to the System Information Dashboard above rather than its own phase.

---

# 22. Future Architecture Directions

The roadmap phases above (Track A and Track B) are individually addable tools, each fitting the existing "new simple tool in ≤30 minutes" model from §3.1.A. The ideas in this section are different in kind: they are cross-cutting changes to the framework itself — the tool registry contract, the shell, or the persistence model — proposed by the source roadmap material as ways to turn DUDE from "a large collection of developer tools" into a genuinely interconnected workbench. None of them are scheduled. Each is flagged below with what it would take to schedule it.

## Transformation Pipelines

Today, using DUDE for a multi-step job (say, Base64-decode a value, gunzip it, parse the result as JSON, and pull one field with JMESPath) means visiting four separate tools and manually copying output to input each time. A pipeline feature would let a user chain existing tools together — visually or as a saved list of steps — into a single reusable workflow, e.g. `Base64 Decode → Gunzip → JSON Parse → JMESPath Query → CSV Convert`, and re-run it against new input without re-navigating the deck each time.

This matters because it's the single change most likely to make DUDE feel like one cohesive tool rather than forty independent ones — it's the "workbench, not tool collection" positioning made concrete, and it's a natural fit for §4's density-and-speed principles once it exists. Architecturally, though, it cannot be built the way an ordinary tool is: every participating tool would need to expose its transformation logic as a composable step with a declared input/output shape, which is a change to what a `ToolDefinition` means, not just a new `ToolDefinition`. That is explicitly outside the "no shell/core edits" contract that every other roadmap item in this document honors.

This needs its own design pass before being scheduled into a phase — see Phase 21, a placeholder Track A phase reserved for cross-tool workflow foundations.

## A Universal Input/Output Contract

Pipelines are only "almost automatic," per the source material, if tools already agree on what they consume and produce. A universal I/O contract would have every tool declare its inputs and outputs in terms of a small shared vocabulary — `Text`, `Bytes`, `File`, `JSON`, `Table`, `HTTPResponse` — instead of each tool inventing its own ad hoc shape. JSON Formatter, Base64 Decoder, Regex Extractor, a future HTTP Request tool, and Hash Generator would all speak the same handful of types.

This matters because it is the enabling primitive underneath pipelines, smart paste-detection, and a shared workspace/scratchpad alike — build this once, and three other items on this list get meaningfully easier. It is also the most architecturally invasive item here: it means extending (not just using) the `ToolDefinition` contract described in §12.1/§27, and every existing tool would eventually need to declare itself in these terms to fully participate, which is a migration, not a 30-minute addition.

This needs its own design pass before being scheduled into a phase — see Phase 21, a placeholder Track A phase reserved for cross-tool workflow foundations.

## Smart Paste-Detection

Rather than requiring a user to already know which tool they want, a shared "paste anything" surface could inspect pasted content, recognize common shapes (JSON, a JWT, a UUID, a URL, Base64, a Unix timestamp, and so on), and suggest the relevant tool or action directly.

This matters for discoverability in exactly the way the command palette (§9.3/§28) already helps when a user knows what they want but not where it lives — this helps when they don't yet know what they want to do with what they're holding. Architecturally it needs a lightweight, registry-driven content-sniffing layer that tools opt into (each tool would declare a "detector" alongside its existing metadata), plus new shell surface area to present suggestions — a real but comparatively contained addition next to the two items above.

This needs its own design pass before being scheduled into a phase — see Phase 21, a placeholder Track A phase reserved for cross-tool workflow foundations.

## Persistent Workspace / Scratchpad

Every DUDE tool today is an isolated page: navigate away, and unsaved input/output is gone unless that specific tool opted into persistence (§14). A workspace/scratchpad would let a user keep several inputs, outputs, and notes side by side across tools during a session, closer to a notebook than a set of independent forms.

This matters for the "short and frequent" usage pattern in §6.2 when a task actually spans several tools in one sitting — right now switching tools means losing context unless the user manually copies values out first. Architecturally this is more contained than the two items above: it mostly extends the existing per-tool persistence model (§14) into a cross-tool session-scoped store, rather than changing the tool contract itself, though it does need new shell UI to display and manage it.

This needs its own design pass before being scheduled into a phase — see Phase 21, a placeholder Track A phase reserved for cross-tool workflow foundations.

## Persistent Local History

A local, cross-tool history of past conversions, hashes, diffs, and regex tests would let a user revisit recent work without any cloud storage — consistent with §14's existing "local persistence is fine, sensitive payloads default to non-persistent" policy, just applied across tools instead of within one.

This matters as a smaller, standalone convenience that doesn't require the other four items to be useful on its own, though it becomes considerably more useful once paired with the workspace/scratchpad above. Architecturally it is the lightest-weight item here: a shared history service sitting next to the existing Persistence Service (§27.2), with each tool opting in the same way it already opts into a persistence policy — no change to the tool contract itself.

This needs its own design pass before being scheduled into a phase — see Phase 21, a placeholder Track A phase reserved for cross-tool workflow foundations.

---

# 23. Long-Term Product Horizon

## Desktop Packaging Track

DUDE's browser-only architecture has a hard ceiling: a large and genuinely useful category of developer tools — live networking, live DNS/TLS, arbitrary filesystem operations, Windows-native system tools, local listening servers, and live database connections (all of Track B above) — is simply unreachable from a sandboxed browser tab, no matter how the web app evolves. Adopting native desktop packaging is what unlocks all of it — **Electron**, per the approved direction decided in §21 Phase 8, which also covers the staged rollout (Electron shell → native file access → OS-level secrets → local LLM proxy → desktop shell chrome → local/BYO-relay collaboration → auto-update and distribution) that Track B below is gated on.

This is why the desktop track is worth the departure from the original weekend scope: it is not "the website wrapped in an EXE," it is the thing that makes a whole tier of tools possible at all. The source roadmap material's own pitch for this list of "desktop-only killer features" is the rationale:

1. REST/API client
2. Local webhook listener
3. Mock HTTP server
4. Network/DNS/TLS toolkit
5. SQLite/database viewer (live)
6. File and folder diff at scale
7. Hex/binary viewer and forensics
8. Log viewer with live tail
9. Process/port inspector
10. Git repository inspector (already partly shipped today via the browser-based Git Repo Browser; a desktop version could work against a live working tree instead of a folder snapshot)
11. Local static server
12. Environment/runtime inspector
13. OpenAPI workbench (live introspection)
14. WebSocket client
15. Clipboard utilities (history/monitor)
16. Code model generators
17. Developer diagnostic bundle export
18. Visual transformation pipelines (see §22)

Adopting this track changes one of this PRD's permanent decisions: the former non-goal barring "Electron/Tauri/native desktop packaging" (§5.2) is removed. This comes with a careful boundary, not a blanket reversal: a desktop app's *local, bundled* backend — used only to reach OS/network/filesystem capability that Track B tools need on the machine DUDE is running on — is now in scope. A *cloud-hosted* backend, a database service, user accounts, and cloud synchronization remain permanent non-goals for the product as a whole; nothing about the desktop track implies DUDE talks to a server anywhere, only that it can talk to *this* machine more directly than a browser sandbox allows.

The web app deployed to GitHub Pages remains the permanent, zero-install entry point to DUDE — the desktop track is additive, not a replacement, and every Track A tool must keep working there exactly as it does today. See §4 for the corresponding product principle ("Desktop extends, doesn't replace, the web app").

## Monetization (Speculative)

The roadmap material raises a free/pro/team tier structure as one way DUDE could eventually be positioned if shared more broadly. This subsection is included for completeness, but it is explicitly **not a committed roadmap item** — nothing here is scheduled, and nothing else in this PRD depends on it happening.

A rough sketch, if it were ever pursued: a free tier covering every local-first utility (all of Track A, plus the basic desktop conveniences in Phase 29 like drag-and-drop and context-menu actions); a pro tier covering advanced workspace features once they exist (transformation pipelines, persistent history, saved sessions, batch automation — see §22); and a team tier covering anything that requires genuinely shared or cloud-backed state (sync, collaboration).

Pursuing this seriously would require revisiting the user-accounts and cloud-synchronization permanent non-goals (§5.2), which this PRD is explicitly **not** doing here — those remain non-goals until a separate, deliberate decision changes them. The one constraint that is not speculative: basic developer utilities must never be paywalled. That is a hard requirement on any future tier design, not a preference to be traded off — it is the entry point that makes the rest of the product worth using in the first place.

---

# 24. API Integration Architecture

Network integrations are allowed later.

User-supplied API keys are the chosen credential model.

## 24.1 Rules

No static private secrets in source control.

No server proxy is part of the current architecture.

Each API-backed tool should declare:

- external service name;
- whether network is required;
- whether an API key is required;
- how the key is stored;
- what user input is transmitted;
- what happens offline.

## 24.2 Default key storage

Default:

- session-only.

Optional:

- explicit user opt-in to local persistence.

Never:

- hard-coded secret;
- silent persistent secret storage.

---

# 25. Suggested Repository Architecture

Exact naming may evolve, but keep the separation of responsibilities.

```text
src/
  app/
    core/
      registry/
      persistence/
      workers/
      network/
      routing/
      errors/
    shell/
      layout/
      sidebar/
      deck/
      command-palette/
      search/
    shared/
      components/
      directives/
      pipes/
      utilities/
      models/
    tools/
      json/
      regex/
      timestamp/
      base64/
      markdown/
      jwt/
      text-inspector/
      hash/
      diff/
```

Possible per-tool structure:

```text
tools/json/
  json.tool.ts
  json.component.ts
  json.component.html
  json.component.css
  json.logic.ts
  json.worker.ts
  json.spec.ts
```

Not every tool needs every file.

Avoid ceremony for small utilities.

A future desktop build (§23) would sit alongside this structure behind a platform adapter — e.g. a sibling `platform/` layer exposing the same interface over browser APIs (today) and native/OS APIs (once the desktop track starts) — rather than forking `src/app` into separate web and desktop copies (§4.9). This is a direction, not a design to implement now.

---

# 26. Suggested Tool Definition Pattern

A tool should be close to self-registering.

Conceptual example:

```ts
export const JSON_TOOL: ToolDefinition = {
  id: 'json',
  title: 'JSON Formatter',
  description: 'Validate, format, and minify JSON.',
  category: 'data',
  keywords: ['json', 'format', 'validate', 'pretty', 'minify'],
  route: '/tools/json',
  load: () => import('./json.component'),
  persistence: {
    input: 'none',
    preferences: 'local'
  },
  execution: {
    worker: 'optional'
  },
  network: {
    required: false
  }
};
```

The shell should consume tool metadata rather than importing tool-specific behavior.

---

# 27. Shared Services

## 27.1 Tool Registry Service

Responsibilities:

- expose tool definitions;
- category grouping;
- keyword search;
- route lookup;
- stable IDs;
- duplicate validation in development.

## 27.2 Persistence Service

Responsibilities:

- namespace data by tool;
- support session/local/nonpersistent policy;
- explicit handling of sensitive values;
- serialize preferences;
- clear tool state;
- clear all DUDE state.

## 27.3 Worker Service

Responsibilities:

- start work;
- cancel work;
- normalize error handling;
- terminate failed jobs;
- expose busy state.

## 27.4 Connectivity Service

Responsibilities:

- current online/offline signal;
- tool-level network status;
- compact offline UI support.

## 27.5 Search Service

Responsibilities:

- title matching;
- keyword matching;
- category matching;
- ranking exact/prefix matches ahead of loose matches.

Do not overbuild search.

A straightforward in-memory search is sufficient.

## 27.6 Platform Service

Added in §21 Phase 8 Stage 1 as the seam every desktop-only stage conditions on. Responsibilities:

- detect the Electron desktop shell via the flag `electron/preload.ts` injects through `contextBridge` — never `navigator.userAgent` sniffing;
- expose the result as a readonly `isDesktop` signal, same shape as the Connectivity Service's `online` signal;
- stay tool-agnostic — a boolean primitive the shell or any tool can read, never a place for desktop-feature logic itself.

---

# 28. Command Palette Requirements

The command palette currently supports navigation only.

## Required

- open by keyboard;
- search tools;
- arrow-key selection;
- Enter to navigate;
- Escape to close;
- auto-focus search input.

## Deferred

- tool actions;
- configurable shortcuts;
- nested commands;
- command aliases managed by users;
- macros.

---

# 29. Deck Requirements

The deck should be useful but compact.

Required:

- tool search;
- category grouping;
- all registered tools visible;
- keyboard-compatible links;
- quick route access.

Optional only if trivial:

- recently used;
- favorites;
- pinned tools.

Do not build personalization infrastructure for these without a specific roadmap decision to do so.

---

# 30. Tool UX Conventions

Common keyboard and action patterns should be reused where helpful.

Recommended conventions:

- `Ctrl+Enter`: run/execute where a run step exists;
- `Ctrl+K`: command palette;
- copy buttons use consistent placement;
- clear/reset uses consistent placement;
- errors appear close to the relevant input;
- success notifications are subtle;
- avoid modal dialogs for routine tool interactions.

Keyboard shortcuts should never block core browser shortcuts unnecessarily.

---

# 31. Large Inputs

Large inputs are allowed.

The app should not impose arbitrary small text limits.

However, extreme-scale optimization is not currently required.

Expected behavior:

- remain responsive when practical;
- move expensive transforms into workers where useful;
- allow cancellation where practical;
- show a processing state;
- fail clearly if a browser/library limit is reached.

No guarantee is made for arbitrarily huge payloads.

---

# 32. Sensitive Inputs

Sensitive inputs are allowed.

The product should not block JWTs, credentials, private JSON, or similar data merely because they may be sensitive.

The framework should instead behave responsibly:

- no silent persistence by default;
- no silent network transmission;
- API-backed tools make transmission explicit;
- sensitive tools choose safer persistence defaults.

No enterprise secret-management system is in scope.

---

# 33. Security Boundaries

## Standing rules

- no arbitrary code execution **in DUDE's own realm/origin** — arbitrary execution is permitted only inside the opaque-origin sandboxed iframe/worker in `src/app/shared/code-sandbox/` (§21 Phase 6: JS Playground, HTML Preview, Template Renderer, Python Playground), which has no cookie/storage/host-DOM access into the app itself;
- no remote plugin execution;
- no untrusted HTML execution without sanitization, **outside that same sandbox**;
- no embedded private service credentials;
- no server-side secret assumptions;
- no claims that JWT decoding verifies authenticity.

Phase 6's sandbox design (iframe isolation, network egress blocked via CSP, hard execution timeouts) is documented in `src/app/shared/code-sandbox/code-sandbox-doc.ts` and each Phase 6 tool's own sandbox file — see §21 Phase 6 for what shipped and why.

Phase 8 Stage 1 applies these same standing rules to the Electron renderer (`contextIsolation` on, no `nodeIntegration`, all native access preload-mediated) and extends the "never an external interface" rule to the bundled local static server (`127.0.0.1` only, OS-assigned port) — documented in `electron/AGENTS.md` and `electron/static-server.ts`.

---

# 34. Performance Strategy

Performance work should be pragmatic.

## Required

- route-level lazy loading;
- worker abstraction;
- avoid loading heavy tool libraries before the tool is visited;
- avoid re-rendering the entire shell during tool-local state changes where practical;
- keep navigation responsive.

## Deferred

- micro-benchmark suite;
- strict bundle budget;
- advanced prefetch prediction;
- manual tree-shaking project;
- custom virtualized editors unless a tool needs them.

---

# 35. Build and Deployment

## Production build

A single documented command should create production-ready static assets.

## CI

On the primary branch:

1. install dependencies;
2. run framework-critical tests;
3. build production app;
4. prepare GitHub Pages SPA fallback;
5. publish static output.

## GitHub Pages acceptance

Verify:

- root project URL loads;
- direct tool URL loads;
- browser refresh on tool URL loads;
- static assets load under repo path;
- service worker registers;
- installed PWA launches;
- local-only tools work offline after caching.

---

# 36. Documentation Deliverables

Both deliverables below exist in the repository today (`README.md`, `ADDING_A_TOOL.md`). Repository documentation includes:

## README

- project purpose;
- local development;
- production build;
- GitHub Pages deployment;
- architecture summary;
- list of tools.

## `ADDING_A_TOOL.md`

This is a critical deliverable.

It should explain:

1. create tool folder;
2. define metadata;
3. create component;
4. choose persistence policy;
5. choose worker policy;
6. choose network policy;
7. expose lazy route/component;
8. add tests where appropriate;
9. verify search/sidebar/command palette discovery;
10. verify direct URL.

Goal:

A simple new tool should be addable without studying the full shell implementation.

---

# 37. Definition of Done

DUDE V1 was declared done once all required items below were verified true, on 2026-09-19.

## Product

- [x] App is called DUDE.
- [x] Dark-only, highly colorful (bold accent palette), dense developer UI is implemented.
- [x] Category color-coding and semantic status colors (Section 8.5) are consistent across sidebar, deck, and tools. Verified: `src/styles/tokens.css` defines the palette once; sidebar/deck/command palette all derive category dots from `CATEGORY_METADATA` dynamically (no hard-coded colors per tool); `ErrorPanel`/`OfflineBadge` use the shared semantic tokens.
- [x] Deck exists.
- [x] Sidebar exists.
- [x] Global search exists.
- [x] Command palette exists.
- [x] Every MVP tool has a dedicated route.

## Architecture

- [x] Typed tool registry exists.
- [x] Shell is generated from tool metadata where practical. Verified: no shell file contains a hard-coded tool-id conditional (grepped `src/app/shell/`); sidebar, deck, command palette, and routes all iterate `TOOL_DEFINITIONS`/`ToolRegistryService`.
- [x] Per-tool persistence policy exists.
- [x] Shared worker execution path exists.
- [x] Online/offline state exists.
- [x] Tool failures do not disable shell navigation. Verified directly by `src/app/app.spec.ts`'s "a worker failure on a real tool does not break shell navigation" test.
- [x] Heavy tool routes are lazy-loaded.

## PWA

- [x] Manifest exists.
- [x] Service worker exists.
- [x] App is installable. Verified live at `https://arahman200165.github.io/DUDE/manifest.webmanifest` — valid `standalone` manifest with a full icon set (72–512px) plus an active service worker.
- [x] Shell works offline after first load.
- [x] Local-only tools remain usable offline.

## Deployment

- [x] Production build succeeds.
- [x] CI deployment works. Verified: latest `Deploy` GitHub Actions run for the Milestone 10 push completed successfully.
- [x] GitHub Pages site loads. Verified live: `https://arahman200165.github.io/DUDE/` returns HTTP 200.
- [x] Nested tool URLs work. Verified live and via `e2e/production-direct-route.spec.ts`.
- [x] Refresh on nested routes works. Same SPA-fallback mechanism, exercised by `e2e/pwa-offline.spec.ts`'s `page.reload()`.
- [x] Asset base path works. Verified live: `manifest.webmanifest` and `ngsw.json` both resolve correctly under the `/DUDE/` prefix.

## Tools

- [x] JSON Formatter / Validator
- [x] Regex Tester
- [x] Unix Timestamp Converter
- [x] Base64 Encoder / Decoder
- [x] Markdown Preview
- [x] JWT Debugger
- [x] Text Inspector
- [x] Hash Generator
- [x] Text Diff
- [x] UUID Generator / Inspector — shipped early as the extension-speed proof (§3.1.A, §20).

## Documentation

- [x] README exists. Rewritten to cover project purpose, screenshots, the full tools table, architecture summary, tech stack, and GitHub Pages deployment mechanics.
- [x] `ADDING_A_TOOL.md` exists.
- [x] architecture is understandable from repository structure and docs. Satisfied via `ADDING_A_TOOL.md`, the rewritten README's architecture section, and the self-descriptive `core/`/`shell/`/`shared/`/`tools/` layout.

## Validation

- [x] framework-critical tests pass. 176/176 via a fresh `npm test` run.
- [x] core navigation smoke test passes. `src/app/app.spec.ts` ("renders the deck at the root route") plus the command palette's navigate-on-Enter spec.
- [x] worker smoke test passes. `src/app/app.spec.ts`'s worker-failure-resilience test passes, and `WorkerClientService`'s full message contract is unit-tested. Note: no test currently drives a real browser `Worker` to a *successful* completion end-to-end (jsdom has no real `Worker`) — only failure-resilience and mocked-message-contract paths are covered.
- [x] offline smoke test passes. `e2e/pwa-offline.spec.ts`, fresh run.
- [x] direct-route production test passes. `e2e/production-direct-route.spec.ts`, fresh run, plus confirmed against the live deployed site.
- [x] a simple new tool can be added in ≤30 minutes without shell modifications. Verified via Milestone 10's timed UUID Generator / Inspector exercise: 2m50s, zero shell edits.

---

# 38. Deferred Definition

Anything not checked in the Definition of Done was not required to declare V1 successful.

A roadmap item remaining unbuilt is not a failure.

Stopping after a stable, deployed, extensible foundation was the intended outcome for V1. Further work now follows the §21 roadmap rather than a scope gate.

---

# Appendix A — Interview Questions and Answers

This appendix captures the requirements interview that determined the original weekend PRD, condensed to a decision log.

| # | Topic | Decision |
|---|---|---|
| Q1 | Primary goal | Hybrid — genuinely useful personally, structured and polished enough to share. |
| Q2 | Hard scope constraint | Build the framework first; tool count is secondary. |
| Q3 | Frontend stack | Angular — strong conventions, TypeScript, DI, routing, structured organization. |
| Q4 | Architecture strictness | Moderately structured — shared conventions/metadata contracts, but tools may diverge where UX requires it. |
| Q5 | Privacy/runtime model | Local-first by default, with optional public API integrations later that degrade gracefully offline. |
| Q6 | Definition of done | A polished, deployable foundation with a limited number of good tools. |
| Q7 | Primary UX success metric | Balanced — prioritize speed and consistency, add keyboard acceleration where valuable. |
| Q8 | Persistence | Per-tool choice, with selective persistence as the default (safe preferences persist, sensitive payloads don't). |
| Q9 | Mandatory edge cases | Failure isolation, offline behavior, and GitHub Pages routing/deployment reliability are mandatory; large and sensitive inputs must be allowed, not rejected by policy. |
| Q10 | Initial tool-set strategy | A framework-showcase set exercising different patterns, with the broader set organized into a roadmap. |
| Q11 | Navigation | Hybrid — deck + sidebar + global search/command palette + dedicated routes, no IDE-style persistent tabs. |
| Q12 | Visual style | Minimal developer console, dark-only, super dense. **Amended 2026-09-18**: dark-only stays fixed, but the theme became explicitly bright and colorful rather than muted/monochrome — bold, saturated accent colors used functionally (categories, status, active state) against a dark base. "Minimal ornamentation" applies to shapes/effects, not color intensity. See §8 for the current, authoritative visual spec. |
| Q13 | Dependency strategy | Library-forward — prefer mature libraries where they accelerate reliable delivery. |
| Q14 | Offline/PWA depth | Installable PWA with offline shell and local tools; network-dependent tools explicitly expose connectivity requirements. |
| Q15 | Testing/accessibility quality bar | Ship first — test architecture-critical pieces and obvious regressions, not exhaustive coverage. |
| Q16 | API-backed tool credential policy | User-supplied API keys only; never bundle private keys; session-only by default with explicit opt-in persistence. |
| Q17 | GitHub Pages routing | Clean bookmarkable routes with a `404.html` SPA fallback, not hash routing. |
| Q18 | Browser/device target | Desktop-first, Chromium-only. |
| Q19 | Computational isolation | A shared worker execution layer tools can opt into, with cancellation/termination support. |
| Q20 | Executable tools | Deferred for the weekend; sandboxing allowed later. (Later shipped — see §21 Phase 6.) |
| Q21 | Measurable framework success criteria | Extension speed and deployment reliability as hard pass/fail; performance/isolation and architecture clarity as strong targets. |

---

# Appendix B — V1 Scope in One Sentence (Delivered)

> Ship a dark-only but highly colorful, dense, desktop-Chromium Angular PWA on GitHub Pages with a reusable tool registry, clean routes, command/search navigation, per-tool persistence, worker-based failure isolation, offline support, documentation, and exactly enough varied utilities to prove the framework—then stop.

This was the goal for V1 specifically, not a permanent stopping point — the "then stop" reflected the original weekend scope gate. With V1 delivered, work continues per the §21 roadmap (see §1.1).
