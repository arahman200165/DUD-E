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

V1 is complete. The extensible framework, all core infrastructure (registry, persistence, workers, PWA, GitHub Pages routing/CI), and 10 tools (the original 9 showcase tools plus the UUID Generator / Inspector) are built, tested, deployed, and verified live at `https://arahman200165.github.io/DUDE/`. Every item in the §36 Definition of Done is checked and verified against the live deployment.

With V1 delivered, the old weekend scope gate no longer applies. New work — additional tools, enhancements to existing tools, or framework extensions — proceeds directly from the §21 Tool Roadmap. The product principles, architecture, and shared conventions documented below remain the standing contract for any new work; only the temporary "hold the line until Sunday" constraints have been retired.

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
- custom backend;
- database;
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
- Electron/Tauri/native desktop packaging;
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

---

## 5.3 Deferred to Roadmap

These items are not permanent non-goals — they are later phases already tracked in §21, gated behind their own design work rather than picked up opportunistically:

- executable JavaScript playground (§21 Phase 6);
- arbitrary HTML execution (§21 Phase 6);
- arbitrary template execution (§21 Phase 6);
- sandboxed code runner (§21 Phase 6);
- WYSIWYG rich-text editor (§21 Phase 5, #36).

Phase 6 items specifically require a separate security/design document before implementation (§21 Phase 6, §32).

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

A single fixed dark-and-colorful palette is defined once and shared by the shell and every tool through the design-token/theming layer (Section 24, `shared/`).

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

The weekend MVP shipped **9 tools**.

These tools were selected because together they exercise different framework capabilities. A 10th tool, UUID Generator / Inspector (§20.10), was added ahead of schedule as the extension-speed proof (§3.1.A, §21 Phase 0).

---

## 20.1 JSON Formatter / Validator

**Category:** Data  
**Priority:** V1 — Delivered  
**Why it is included:** Core daily utility and a strong test for parsing, errors, formatting, large text input, copy actions, and worker execution.

### Features

- paste JSON;
- validate;
- pretty-print;
- minify;
- indentation selector;
- parse error display;
- copy output;
- clear/reset;
- optional worker execution for large payloads.

### Explicitly deferred

- JSON Schema validation;
- JSONPath;
- tree editor;
- structural diff;
- repair malformed JSON;
- remote schema fetching.

---

## 20.2 Regex Tester

**Category:** Developer  
**Priority:** V1 — Delivered  
**Why it is included:** Tests dynamic state, flags, match highlighting, potentially dangerous computation, and worker cancellation.

### Features

- pattern input;
- test text;
- common flags;
- match list;
- capture groups;
- visible regex error;
- execution timeout/cancellation strategy where practical;
- compact match summary.

### Explicitly deferred

- regex generation using AI;
- regex explanation service;
- cross-language flavor emulation;
- replace-expression builder beyond a basic replacement mode.

---

## 20.3 Unix Timestamp Converter

**Category:** Date & Time  
**Priority:** V1 — Delivered  
**Why it is included:** Small, fast tool that validates the low-friction end of the architecture.

### Features

- timestamp to date;
- date to timestamp;
- seconds/milliseconds detection or explicit selector;
- local/UTC display;
- current time shortcut;
- copy result.

### Explicitly deferred

- full timezone database browser;
- recurring scheduling;
- calendar math suite.

---

## 20.4 Base64 Encoder / Decoder

**Category:** Encoding  
**Priority:** V1 — Delivered  
**Why it is included:** Simple bidirectional transform and a good shared-layout test.

### Features

- text to Base64;
- Base64 to text;
- UTF-8 handling;
- swap input/output;
- copy;
- clear;
- invalid input feedback.

### Explicitly deferred

- file encoding;
- Base64 image preview;
- MIME detection.

---

## 20.5 Markdown Preview

**Category:** Documents  
**Priority:** V1 — Delivered  
**Why it is included:** Tests split-pane layouts, third-party rendering, sanitization considerations, and live preview.

### Features

- Markdown editor;
- rendered preview;
- side-by-side view;
- copy source;
- clear;
- common Markdown support;
- safe HTML handling policy.

### Explicitly deferred

- WYSIWYG editing;
- collaborative editing;
- document export;
- custom themes;
- plugin ecosystem.

The requested WYSIWYG rich editor belongs to a later phase.

---

## 20.6 JWT Debugger

**Category:** Security  
**Priority:** V1 — Delivered  
**Why it is included:** Tests sensitive data handling, structured decode, nonpersistent default state, and warning UX.

### Features

- paste JWT;
- decode header;
- decode payload;
- show signature segment separately;
- decode common temporal claims;
- show token expiry status;
- explain clearly that decoding is not signature verification;
- no automatic persistence.

### Explicitly deferred

- signing;
- signature verification requiring remote keys;
- JWKS fetching;
- identity-provider integrations.

---

## 20.7 Text Inspector

**Category:** Text  
**Priority:** V1 — Delivered  
**Why it is included:** Covers live computation and common text metrics with minimal complexity.

### Features

- character count;
- code point count if practical;
- word count;
- line count;
- byte count for UTF-8;
- whitespace count;
- selected-text metrics if easy.

### Explicitly deferred

- readability scoring;
- NLP;
- language detection;
- grammar checking.

---

## 20.8 Hash Generator

**Category:** Security / Encoding  
**Priority:** V1 — Delivered  
**Why it is included:** Tests async browser APIs, binary/text conversion, and worker-friendly computation.

### Features

- input text;
- common cryptographic hash algorithms available safely in-browser;
- hex output;
- copy result;
- encoding selector only if easy.

### Explicitly deferred

- password cracking;
- rainbow tables;
- remote lookup;
- file hashing unless trivial.

---

## 20.9 Text Diff

**Category:** Text  
**Priority:** V1 — Delivered  
**Why it is included:** Tests third-party libraries, larger inputs, two-pane layouts, rendering, and worker isolation.

### Features

- left input;
- right input;
- line-oriented diff;
- added/removed/changed indication;
- compact summary;
- clear/reset.

### Explicitly deferred

- directory diff;
- binary diff;
- Git integration;
- merge conflict resolver;
- three-way merge.

---

## 20.10 UUID Generator / Inspector

**Category:** Developer  
**Priority:** V1 — Delivered  
**Why it is included:** Originally a Phase 1 utility (§21, item 12); shipped early and timed as the extension-speed proof (§3.1.A) — added, registered, and verified in 2 minutes 50 seconds with zero shell/core edits.

### Features

- generate one or more v4 UUIDs;
- inspect a pasted UUID (version, variant);
- copy result;
- session-only persistence for generated list and inspect input.

### Explicitly deferred

- other UUID versions (v1/v5/v7);
- bulk export;
- namespace-based generation.

---

# 21. Tool Roadmap

The roadmap deliberately extends beyond what any single delivery phase covers.

Phase 0 was the weekend commitment; it is complete. Everything else follows as ongoing roadmap-driven work, taken up as decided rather than on any fixed schedule.

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

## Phase 1 — High-Frequency Core Utilities

10. URL Encoder / Decoder  
11. Query String Parser / Builder  
12. UUID Generator / Inspector — ✅ shipped early, see Phase 0  
13. Case Converter  
14. Whitespace Cleaner / Normalizer  
15. Slug Generator  
16. HTML Entity Encoder / Decoder  
17. Color Converter  
18. Number Base Converter

### Notes

These should mostly be simple tools and are ideal for measuring the “new tool in ≤30 minutes” success criterion.

---

## Phase 2 — Structured Data Utilities

19. YAML ↔ JSON Converter  
20. XML Formatter / Validator-lite  
21. CSV Viewer / Converter  
22. JSONPath / JMESPath Tester  
23. JSON Structural Explorer

### Notes

These begin exercising more complex third-party libraries and richer structured outputs.

---

## Phase 3 — Web / API Utilities

24. HTTP Status Code Reference  
25. HTTP Header Inspector / Builder  
26. cURL Command Inspector / Converter  
27. Cron Expression Parser / Next-Run Preview  
28. User-Agent Parser  
29. MIME Type Reference / Lookup

### Notes

Tools that depend on public APIs or remote data should be evaluated individually.

Local static references are preferred when practical.

---

## Phase 4 — Developer Workflow Utilities

30. Semantic Version Comparator  
31. Glob Pattern Tester  
32. URL / URI Inspector  
33. Date / Timezone Converter  
34. Duration Parser / Formatter  
35. Random Data Generator

### Notes

Random data generation should remain developer-oriented and local.

---

## Phase 5 — Richer Editors and Advanced Tools

36. WYSIWYG Rich Text Editor  
37. Advanced Markdown Workspace  
38. JWT Signature Verification  
39. File Hashing  
40. File Base64 Conversion  
41. Advanced Diff / Merge  
42. JSON Schema Validator

These are intentionally later because they introduce larger libraries, more complex security boundaries, richer file handling, or significantly broader UX.

---

## Phase 6 — Executable / Sandboxed Tools

Examples:

- JavaScript playground;
- HTML preview;
- template renderer;
- code execution experiments.

These require an explicit sandbox design.

They are not currently approved for implementation.

Before adding them, create a separate security/design document.

---

# 22. Roadmap Categorized by Domain

For long-term discoverability, tools should ultimately be grouped roughly as follows. ✅ marks tools already shipped (see §20/§21 Phase 0).

## Data

- JSON Formatter / Validator ✅
- YAML ↔ JSON
- XML Formatter
- CSV Viewer / Converter
- JSONPath / JMESPath
- JSON Structural Explorer
- JSON Schema Validator

## Text

- Text Inspector ✅
- Text Diff ✅
- Case Converter
- Whitespace Cleaner
- Slug Generator
- Advanced Diff / Merge

## Encoding / Conversion

- Base64 ✅
- URL Encode / Decode
- HTML Entities
- Number Base Converter
- File Base64
- Color Converter

## Security

- JWT Debugger ✅
- Hash Generator ✅
- JWT Verification
- File Hashing

## Date & Time

- Unix Timestamp ✅
- Date / Timezone Converter
- Duration Parser / Formatter
- Cron Parser

## Web / API

- Query String Builder
- HTTP Status Reference
- HTTP Header Inspector
- cURL Inspector / Converter
- User-Agent Parser
- MIME Type Reference
- URL / URI Inspector

## Developer

- Regex Tester ✅
- UUID Generator / Inspector ✅
- Semantic Version Comparator
- Glob Tester
- Random Data Generator

## Documents

- Markdown Preview ✅
- WYSIWYG Rich Text Editor
- Advanced Markdown Workspace

---

# 23. API Integration Architecture

Network integrations are allowed later.

User-supplied API keys are the chosen credential model.

## 23.1 Rules

No static private secrets in source control.

No server proxy is part of the current architecture.

Each API-backed tool should declare:

- external service name;
- whether network is required;
- whether an API key is required;
- how the key is stored;
- what user input is transmitted;
- what happens offline.

## 23.2 Default key storage

Default:

- session-only.

Optional:

- explicit user opt-in to local persistence.

Never:

- hard-coded secret;
- silent persistent secret storage.

---

# 24. Suggested Repository Architecture

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

---

# 25. Suggested Tool Definition Pattern

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

# 26. Shared Services

## 26.1 Tool Registry Service

Responsibilities:

- expose tool definitions;
- category grouping;
- keyword search;
- route lookup;
- stable IDs;
- duplicate validation in development.

## 26.2 Persistence Service

Responsibilities:

- namespace data by tool;
- support session/local/nonpersistent policy;
- explicit handling of sensitive values;
- serialize preferences;
- clear tool state;
- clear all DUDE state.

## 26.3 Worker Service

Responsibilities:

- start work;
- cancel work;
- normalize error handling;
- terminate failed jobs;
- expose busy state.

## 26.4 Connectivity Service

Responsibilities:

- current online/offline signal;
- tool-level network status;
- compact offline UI support.

## 26.5 Search Service

Responsibilities:

- title matching;
- keyword matching;
- category matching;
- ranking exact/prefix matches ahead of loose matches.

Do not overbuild search.

A straightforward in-memory search is sufficient.

---

# 27. Command Palette Requirements

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

# 28. Deck Requirements

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

# 29. Tool UX Conventions

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

# 30. Large Inputs

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

# 31. Sensitive Inputs

Sensitive inputs are allowed.

The product should not block JWTs, credentials, private JSON, or similar data merely because they may be sensitive.

The framework should instead behave responsibly:

- no silent persistence by default;
- no silent network transmission;
- API-backed tools make transmission explicit;
- sensitive tools choose safer persistence defaults.

No enterprise secret-management system is in scope.

---

# 32. Security Boundaries

## Standing rules

- no arbitrary code execution;
- no remote plugin execution;
- no untrusted HTML execution without sanitization;
- no embedded private service credentials;
- no server-side secret assumptions;
- no claims that JWT decoding verifies authenticity.

Executable tools are deferred.

---

# 33. Performance Strategy

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

# 34. Build and Deployment

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

# 35. Documentation Deliverables

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

# 36. Definition of Done

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
- [x] UUID Generator / Inspector — shipped early as the extension-speed proof (§3.1.A, §20.10).

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

# 37. Deferred Definition

Anything not checked in the Definition of Done was not required to declare V1 successful.

A roadmap item remaining unbuilt is not a failure.

Stopping after a stable, deployed, extensible foundation was the intended outcome for V1. Further work now follows the §21 roadmap rather than a scope gate.

---

# Appendix A — Interview Questions and Answers

This appendix captures the requirements interview that determined the PRD.

---

## Q1 — Primary goal

**Question:** What is the primary goal of this weekend build?

Options included:

- personal daily-driver;
- portfolio/showcase;
- public utility site;
- foundation for larger open-source project;
- hybrid.

**Answer:** E — Hybrid.

**Interpretation:** It should be genuinely useful personally while being structured and polished enough to share.

---

## Q2 — Hard scope constraint

**Question:** What is the hard scope constraint for this weekend?

Options included:

- complete by Sunday with aggressive cuts;
- hit 20–30 tools;
- build the framework first;
- balanced target.

**Answer:** C — Build the framework first.

**Interpretation:** Tool count is secondary. Extensibility is the product of the weekend.

---

## Q3 — Frontend stack

**Question:** What frontend stack should the foundation use?

Initial options included React, Preact, Vanilla TypeScript, Svelte, or something else.

**Answer:** E — Something else.

A follow-up asked about alternatives.

**User asked:** “What about angular?”

**Decision:** Angular.

**Interpretation:** Angular is the selected framework because the project benefits from strong conventions, TypeScript, dependency injection, routing, and structured organization.

---

## Q4 — Architecture strictness

**Question:** How opinionated should the app architecture be?

Options:

- very structured;
- moderately structured;
- loose.

**Answer:** B — Moderately structured.

**Interpretation:** Tools should follow shared conventions and metadata contracts, but individual tools may diverge where their UX requires it.

---

## Q5 — Privacy/runtime model

**Question:** What should the privacy/runtime model be?

Options:

- 100% client-side;
- client-side by default with optional integrations later;
- allow public APIs.

**Answer:** B and C.

**Interpretation:** Local-first, while allowing public APIs where useful. Network features should degrade gracefully.

---

## Q6 — Definition of done

**Question:** What should “done” mean for this weekend?

Options:

- framework complete;
- framework + breadth;
- framework + polish;
- deployable MVP.

**Answer:** C and D.

**Interpretation:** A polished, deployable foundation with a limited number of good tools.

---

## Q7 — Primary UX success metric

**Question:** What should be the main success metric for UX?

Options:

- speed to utility;
- discoverability;
- keyboard-first;
- consistency;
- balanced.

**Answer:** E — Balanced.

**Interpretation:** Prioritize speed and consistency, then add keyboard acceleration where valuable.

---

## Q8 — Persistence

**Question:** How should the app handle state and persistence?

Options:

- ephemeral;
- persist everything;
- selective persistence;
- per-tool choice.

**Answer:** D, implemented with C as the default policy.

**Interpretation:** Each tool declares its own policy. Safe preferences may persist; sensitive payloads should not persist automatically.

---

## Q9 — Mandatory edge cases

**Question:** Which edge cases should the architecture protect against?

Options:

- large inputs;
- sensitive inputs;
- failure isolation;
- offline behavior;
- GitHub Pages quirks;
- all.

**Answer:** C, D, and E are mandatory. A and B should be allowed.

**Interpretation:**

Mandatory:

- failure isolation;
- offline behavior;
- GitHub Pages routing/deployment reliability.

Allowed:

- large inputs;
- sensitive inputs.

Large or sensitive inputs should not simply be rejected by policy.

---

## Q10 — Initial tool-set strategy

**Question:** What should the initial tool set optimize for?

Options:

- core primitives;
- frontend;
- backend/API;
- broad “things I Google” set;
- framework showcase set.

**Answer:** E.

Additional request:

> “List out all tools in a roadmap organizing them and then choose some on your own.”

**Interpretation:** The initial tools should deliberately exercise different framework patterns. The broader set belongs in an organized roadmap.

---

## Q11 — Navigation

**Question:** How should navigation work?

Options:

- sidebar + search;
- cards + search;
- command-palette first;
- IDE-style workspace;
- hybrid.

**Answer:** E — Hybrid.

**Interpretation:** Deck + sidebar + global search/command palette + dedicated routes. No IDE-style persistent tabs for the weekend.

---

## Q12 — Visual style

**Question:** What visual/product style should this feel like?

Options included:

- minimal developer console;
- modern SaaS;
- IDE-inspired;
- dual mode;
- system-native.

**Answer:** A, with the explicit requirement:

> “super dense and in dark mode only”

**Interpretation:** Dark-only, compact, utilitarian, minimal ornamentation.

**Amendment (2026-09-18):** Direction updated — dark mode only remains fixed, but the theme is now explicitly bright and colorful rather than muted/monochrome: bold, highly saturated accent colors used functionally (categories, status, active state) against a dark base. Density and minimal ornamentation are unchanged; "minimal ornamentation" applies to shapes/effects (gradients-as-polish, glow, illustration), not to color intensity. See Section 8 for the current, authoritative visual spec.

---

## Q13 — Dependency strategy

**Question:** How aggressive should third-party library usage be?

Options:

- minimal dependencies;
- pragmatic;
- library-forward;
- strict bundle budget.

**Answer:** C — Library-forward.

**Interpretation:** Prefer mature libraries where they accelerate reliable delivery.

---

## Q14 — Offline/PWA depth

**Question:** How far should offline capability go?

Options:

- no PWA;
- basic PWA;
- full installable PWA;
- selective offline behavior.

**Answer:** C and D.

**Interpretation:** Installable PWA with offline shell and local tools, while network-dependent tools explicitly expose connectivity requirements.

---

## Q15 — Testing/accessibility quality bar

**Question:** What quality bar should testing/accessibility use?

Options:

- lightweight;
- practical;
- strict;
- ship-first.

**Answer:** D — Ship first.

**Interpretation:** Test the architecture-critical pieces and obvious regressions. Do not pursue exhaustive coverage during the weekend.

---

## Q16 — API-backed tool credential policy

**Question:** What restriction should apply to API-backed tools on GitHub Pages?

Options:

- anonymous/public APIs only;
- user-supplied API keys;
- public client-side keys;
- all.

**Answer:** B — User-supplied API keys.

**Interpretation:** Never bundle private keys. Keys are session-only by default with explicit opt-in persistence.

---

## Q17 — GitHub Pages routing

**Question:** How should routing behave on GitHub Pages?

Options:

- hash routing;
- clean routes with `404.html` SPA fallback;
- query-based;
- single URL only.

**Answer:** B.

**Interpretation:** Use clean bookmarkable routes and implement a GitHub Pages fallback.

---

## Q18 — Browser/device target

**Question:** What device/browser support defines “works”?

Options:

- desktop-first Chromium-only;
- desktop-first modern browsers;
- fully responsive;
- desktop-only by design.

**Answer:** A — Desktop-first, Chromium-only.

**Interpretation:** Weekend testing and optimization target desktop Chromium.

---

## Q19 — Computational isolation

**Question:** How should computationally risky tools be isolated?

Options:

- main thread by default;
- workers for heavy tools;
- shared worker execution layer;
- maximum isolation.

**Answer:** C — Shared worker execution layer.

**Interpretation:** Tools can opt into reusable worker-backed execution with cancellation/termination support.

---

## Q20 — Executable tools

**Question:** How should potentially executable tools behave?

Options:

- no execution;
- sandbox only;
- trusted local execution;
- defer executable tools.

**Answer:** D — Defer.

**Interpretation:** Architecture may allow sandboxing later, but executable tools are outside the weekend MVP.

---

## Q21 — Measurable framework success criteria

**Question:** What measurable success criteria should the framework hit by Sunday?

Options:

- extension speed;
- performance;
- deployment reliability;
- architecture clarity;
- all, with extension speed + deployment as hard pass/fail.

**Answer:** E.

**Interpretation:**

Hard pass/fail:

- new simple tool can be added in ≤30 minutes;
- deployment and clean routing are reliable.

Strong targets:

- responsive performance and isolation;
- clear architecture and documentation.

---

# Appendix B — V1 Scope in One Sentence (Delivered)

> Ship a dark-only but highly colorful, dense, desktop-Chromium Angular PWA on GitHub Pages with a reusable tool registry, clean routes, command/search navigation, per-tool persistence, worker-based failure isolation, offline support, documentation, and exactly enough varied utilities to prove the framework—then stop.

This was the goal for V1 specifically, not a permanent stopping point — the "then stop" reflected the original weekend scope gate. With V1 delivered, work continues per the §21 roadmap (see §1.1).
