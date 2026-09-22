<p align="center">
  <img src="DUDE_logo_primary.svg" alt="DUDE — Developer Utility Dashboard Engine" width="480" />
</p>

# DUDE — Developer Utility Dashboard Engine

[![Deploy](https://github.com/arahman200165/DUDE/actions/workflows/deploy.yml/badge.svg)](https://github.com/arahman200165/DUDE/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-22c55e)](https://arahman200165.github.io/DUDE/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/security-policy-informational)](docs/SECURITY.md)

A dense, dark-mode-only, installable Progressive Web App that consolidates the small developer utilities you'd otherwise Google one at a time — JSON formatting, regex testing, JWT decoding, hashing, diffing, and more — into a single fast, offline-capable, keyboard-driven deck.

**[→ Open the live app](https://arahman200165.github.io/DUDE/)**

---

## What is DUDE

DUDE is not a race to ship the most tools. It's a framework built to make adding **tool 36, 37, or 45** routine instead of architectural work — a new simple utility with existing transformation logic can be added in **under 30 minutes**, without touching navigation, routing, search, the command palette, persistence, or the PWA layer. Milestone 10's timed proof (see [`ADDING_A_TOOL.md`](ADDING_A_TOOL.md)) added a full tool, tests included, in **2 minutes 50 seconds** — a claim then validated at scale across Milestone 11's 8-tool batch, Milestone 12's structured-data batch, and Milestone 13's web/API batch, which added two new shared UI primitives (`app-copy-button`, `app-key-value-editor`) without touching the shell.

Everything runs client-side. There's no backend, no accounts, no telemetry — your data never leaves the browser unless a tool explicitly tells you otherwise.

- **Local-first** — every current tool works fully offline after the first load.
- **Dense, not decorative** — bold, functional color-coding by category and status, built for daily use, not for demos.
- **Framework-first** — the registry, shell, persistence, and worker layers were built before the tools, so new tools are cheap and safe to add.

The tools are the proof, not the point: DUDE is a **local-first, extensible developer workbench** for transforming, inspecting, and composing developer data — not just a growing pile of independent utilities. Every tool declares what it accepts and produces in a small shared vocabulary (`DudeDataType` — see `src/app/shared/models/tool-io.model.ts`), the foundation a future cross-tool pipeline or Smart Paste-detection feature would build on. That composition layer isn't shipped yet — today, using two tools together still means copying output to input by hand — but the registry contract every tool already speaks is what makes building it later a framework change, not a rewrite.

## Screenshots

| Deck | JSON Formatter |
| --- | --- |
| ![DUDE deck, showing the sidebar and color-coded category grid](docs/screenshots/deck.jpg) | ![JSON Formatter tool, pretty-printing a sample JSON object](docs/screenshots/json-formatter.jpg) |

## Tools

108 tools ship today, each self-registered in [`tool-definitions.ts`](src/app/core/registry/tool-definitions.ts) — nothing about the shell knows any tool by name.

| Tool | Category | What it does |
| --- | --- | --- |
| [JSON Formatter](https://arahman200165.github.io/DUDE/tools/json) | Data | Validate, pretty-print, and minify JSON, with an editable structural Tree view, a structural Compare mode, and malformed-JSON repair. |
| [YAML ↔ JSON Converter](https://arahman200165.github.io/DUDE/tools/yaml-json) | Data | Converts between YAML and JSON in either direction. |
| [XML Formatter](https://arahman200165.github.io/DUDE/tools/xml-formatter) | Data | Validates, formats, and minifies XML. |
| [CSV Viewer / Converter](https://arahman200165.github.io/DUDE/tools/csv-viewer) | Data | Views CSV as a dense table, and converts between CSV and JSON. |
| [JSONPath / JMESPath Tester](https://arahman200165.github.io/DUDE/tools/json-query) | Data | Queries JSON with a JSONPath or JMESPath expression. |
| [JSON Schema Validator](https://arahman200165.github.io/DUDE/tools/json-schema-validator) | Data | Validates a JSON instance against a Draft-07 or 2020-12 JSON Schema, with per-error paths. |
| [JSON Flatten / Unflatten](https://arahman200165.github.io/DUDE/tools/json-flatten) | Data | Flattens nested JSON into dot/bracket-notation path keys, or unflattens them back into nested JSON. |
| [JSON Merge](https://arahman200165.github.io/DUDE/tools/json-merge) | Data | Deep-merges two JSON documents, or applies an RFC 7396 JSON Merge Patch. |
| [JSON Patch Generator](https://arahman200165.github.io/DUDE/tools/json-patch-generate) | Data | Diffs two JSON documents into an RFC 6902 JSON Patch. |
| [JSON Patch Tester](https://arahman200165.github.io/DUDE/tools/json-patch-test) | Data | Applies an RFC 6902 JSON Patch to a JSON document and shows the result. |
| [JSON Pointer Tester](https://arahman200165.github.io/DUDE/tools/json-pointer) | Data | Resolves an RFC 6901 JSON Pointer against a JSON document. |
| [JSON Sort Keys](https://arahman200165.github.io/DUDE/tools/json-sort-keys) | Data | Sorts a JSON document's object keys alphabetically, top-level or recursively. |
| [JSON Lines / NDJSON Viewer](https://arahman200165.github.io/DUDE/tools/jsonl-viewer) | Data | Views newline-delimited JSON (NDJSON/JSON Lines) as a table or a JSON array. |
| [TOML Formatter / Validator](https://arahman200165.github.io/DUDE/tools/toml-formatter) | Data | Validates and reformats TOML. |
| [INI Formatter / Parser](https://arahman200165.github.io/DUDE/tools/ini-formatter) | Data | Converts between INI and JSON, in either direction. |
| [Properties File Parser](https://arahman200165.github.io/DUDE/tools/properties-parser) | Data | Converts between Java-style .properties files and JSON, in either direction. |
| [YAML Linter](https://arahman200165.github.io/DUDE/tools/yaml-linter) | Data | Validates YAML and surfaces parse errors with line and column detail. |
| [YAML Merge](https://arahman200165.github.io/DUDE/tools/yaml-merge) | Data | Deep-merges two YAML documents into one. |
| [YAML Anchor / Alias Visualizer](https://arahman200165.github.io/DUDE/tools/yaml-anchors) | Data | Visualizes a YAML document's anchors and aliases and where each one resolves. |
| [YAML Path Tester](https://arahman200165.github.io/DUDE/tools/yaml-path) | Data | Queries a YAML document with a JSONPath or JMESPath expression. |
| [CSV ↔ SQL Converter](https://arahman200165.github.io/DUDE/tools/csv-sql) | Data | Converts CSV rows to SQL INSERT statements, or parses INSERT statements back into CSV. |
| [CSV Delimiter Detector](https://arahman200165.github.io/DUDE/tools/csv-delimiter-detector) | Data | Detects the most likely delimiter in a pasted CSV/TSV/PSV sample and previews it as a table. |
| [CSV Column Statistics](https://arahman200165.github.io/DUDE/tools/csv-stats) | Data | Computes per-column count, empty, distinct, and numeric min/max/mean statistics for a CSV. |
| [CSV Cleaner](https://arahman200165.github.io/DUDE/tools/csv-cleaner) | Data | Trims whitespace, drops empty rows, and normalizes a messy CSV. |
| [CSV Deduplicator](https://arahman200165.github.io/DUDE/tools/csv-dedupe) | Data | Removes duplicate rows from a CSV, optionally by a subset of key columns. |
| [CSV Join / Merge](https://arahman200165.github.io/DUDE/tools/csv-join) | Data | Joins two CSVs on a key column, inner or left. |
| [CSV Pivot](https://arahman200165.github.io/DUDE/tools/csv-pivot) | Data | Pivots a CSV: groups by a row key and column key, aggregating a value column. |
| [CSV Filter / Sort](https://arahman200165.github.io/DUDE/tools/csv-filter-sort) | Data | Filters a CSV's rows by a column condition, and sorts by a column. |
| [XML XPath Tester](https://arahman200165.github.io/DUDE/tools/xml-xpath) | Data | Tests an XPath expression against XML using the browser's native XPath engine. |
| [XML ↔ CSV Converter](https://arahman200165.github.io/DUDE/tools/xml-csv) | Data | Converts flat XML records to CSV rows and back. |
| [XML Schema / XSD Validator](https://arahman200165.github.io/DUDE/tools/xml-xsd-validator) | Data | Validates XML against an XSD schema via libxml2 compiled to WebAssembly. |
| [MessagePack Decoder](https://arahman200165.github.io/DUDE/tools/msgpack-decoder) | Data | Decodes a MessagePack-encoded file and inspects its structure. |
| [BSON Viewer](https://arahman200165.github.io/DUDE/tools/bson-viewer) | Data | Decodes a BSON file and inspects its structure. |
| [CBOR Viewer](https://arahman200165.github.io/DUDE/tools/cbor-viewer) | Data | Decodes a CBOR file and inspects its structure. |
| [Avro Viewer](https://arahman200165.github.io/DUDE/tools/avro-viewer) | Data | Decodes an uncompressed Avro Object Container File and inspects its records. |
| [Parquet Viewer](https://arahman200165.github.io/DUDE/tools/parquet-viewer) | Data | Decodes a Parquet file and views its rows as a table. |
| [SQLite File Viewer](https://arahman200165.github.io/DUDE/tools/sqlite-viewer) | Data | Browses the tables in a SQLite file, read-only, entirely client-side. |
| [Protobuf Decoder](https://arahman200165.github.io/DUDE/tools/protobuf-decoder) | Data | Decodes a Protobuf-encoded payload against a user-supplied .proto schema. |
| [Resx Tool](https://arahman200165.github.io/DUDE/tools/resx-tool) | Data | Views, diffs, merges, and extracts format tokens from .NET .resx resource files. |
| [Universal Structured Data Converter](https://arahman200165.github.io/DUDE/tools/structured-data-converter) | Data | Converts between JSON, YAML, XML, TOML, and CSV, any format to any other. |
| [Text Inspector](https://arahman200165.github.io/DUDE/tools/text-inspector) | Text | Character, word, line, and UTF-8 byte metrics for any text, including selections. |
| [Text Diff](https://arahman200165.github.io/DUDE/tools/diff) | Text | Line-oriented diff between two blocks of text, computed in a worker. |
| [Case Converter](https://arahman200165.github.io/DUDE/tools/case-converter) | Text | Converts text between camelCase, snake_case, kebab-case, Title Case, and more. |
| [Whitespace Cleaner / Normalizer](https://arahman200165.github.io/DUDE/tools/whitespace-cleaner) | Text | Trims, collapses, and normalizes whitespace, line endings, tabs/spaces, and indentation. |
| [Unicode Character Inspector](https://arahman200165.github.io/DUDE/tools/unicode-character-inspector) | Text | Inspects pasted text character by character: code point, UTF-8/UTF-16 bytes, general category, Unicode block, and official name. |
| [Unicode Code Point Converter](https://arahman200165.github.io/DUDE/tools/unicode-code-point-converter) | Text | Converts between U+XXXX notation, decimal, HTML entities, JS `\u` escapes, and UTF-8 hex bytes, single or bulk. |
| [Invisible / Control / Zero-Width Character Scanner](https://arahman200165.github.io/DUDE/tools/invisible-char-scanner) | Text | Scans text for invisible, control, and zero-width characters, lists each occurrence, and strips selected kinds. |
| [ASCII Table](https://arahman200165.github.io/DUDE/tools/ascii-table) | Text | Searchable reference of the 128 standard ASCII characters, with decimal, hex, octal, and control-code names. |
| [Unicode Table](https://arahman200165.github.io/DUDE/tools/unicode-table) | Text | Browses Unicode characters by block, or searches by code point, character, or name. |
| [Unicode Normalization](https://arahman200165.github.io/DUDE/tools/unicode-normalization) | Text | Normalizes text to NFC, NFD, NFKC, or NFKD, with a before/after code point comparison. |
| [Smart Quotes Normalizer](https://arahman200165.github.io/DUDE/tools/smart-quotes-normalizer) | Text | Converts curly quotes, dashes, and ellipses to straight ASCII equivalents, or the reverse. |
| [Duplicate Finder](https://arahman200165.github.io/DUDE/tools/duplicate-finder) | Text | Finds duplicate lines or duplicate words in text, with counts and one-click removal. |
| [Line Order Tools](https://arahman200165.github.io/DUDE/tools/line-order-tools) | Text | Sorts (ascending, descending, natural, or by length), shuffles, or reverses the lines of a text block. |
| [Line Prefix/Suffix & Numbering](https://arahman200165.github.io/DUDE/tools/line-prefix-numbering) | Text | Adds a prefix/suffix, adds or removes line numbers, or applies a transform to every line at once. |
| [Extract Columns](https://arahman200165.github.io/DUDE/tools/extract-columns) | Text | Splits each line on a delimiter and extracts/reorders the selected columns. |
| [Find & Replace](https://arahman200165.github.io/DUDE/tools/find-replace-text) | Text | Literal (non-regex) find and replace, with case-sensitive and whole-word options. |
| [Lorem Ipsum & Placeholder Text Generator](https://arahman200165.github.io/DUDE/tools/lorem-ipsum-generator) | Text | Generates classic Lorem Ipsum or faker-based placeholder text, as words, sentences, or paragraphs. |
| [ASCII Art Generator / Banner](https://arahman200165.github.io/DUDE/tools/ascii-art-generator) | Text | Renders text as an ASCII-art banner, with a choice of FIGlet fonts. |
| [Keyword Frequency Analyzer](https://arahman200165.github.io/DUDE/tools/keyword-frequency-analyzer) | Text | Counts word frequency in text, with stop-word filtering and a minimum-length filter. |
| [String Similarity Calculator](https://arahman200165.github.io/DUDE/tools/string-similarity-calculator) | Text | Compares two strings with Levenshtein distance/similarity and Jaro-Winkler similarity. |
| [Soundex / Metaphone](https://arahman200165.github.io/DUDE/tools/soundex-metaphone) | Text | Computes the Soundex and Metaphone phonetic codes for one or more words. |
| [Text Tokenizer & N-Gram Generator](https://arahman200165.github.io/DUDE/tools/text-tokenizer-ngram) | Text | Tokenizes text into words or sentences, or generates word- or character-level n-grams with counts. |
| [Slug Generator](https://arahman200165.github.io/DUDE/tools/slug-generator) | Text | Turns a title into a URL-friendly slug, with transliteration and length control. |
| [Advanced Diff / Merge](https://arahman200165.github.io/DUDE/tools/advanced-diff) | Text | Line, word, character, semantic JSON/YAML/XML, or image diffing with a side-by-side two-way or three-way merge view, file upload, and unified-diff export. |
| [Directory Diff](https://arahman200165.github.io/DUDE/tools/directory-diff) | Text | Compares two folders for added/removed/changed files, with a line diff or hex byte diff on drill-down. |
| [Base64 Encoder / Decoder](https://arahman200165.github.io/DUDE/tools/base64) | Encoding | UTF-8-safe text ↔ Base64 conversion. |
| [URL Encoder / Decoder](https://arahman200165.github.io/DUDE/tools/url-encode) | Encoding | Percent-encodes or decodes text as a URL component or a full URI. |
| [HTML Entity Encoder / Decoder](https://arahman200165.github.io/DUDE/tools/html-entities) | Encoding | Encodes text as HTML entities, or decodes named/numeric entities back to text. |
| [Color Converter](https://arahman200165.github.io/DUDE/tools/color-converter) | Encoding | Converts between HEX, RGB, HSL, HSV, CMYK, and named CSS colors. |
| [Number Base Converter](https://arahman200165.github.io/DUDE/tools/number-base) | Encoding | Converts whole numbers between binary, octal, decimal, hex, or any base 2–36. |
| [File Base64 Converter](https://arahman200165.github.io/DUDE/tools/file-base64) | Encoding | Converts a local file to Base64 text, or a Base64 string back into a downloadable file, with MIME sniffing and an image preview. |
| [Hex ↔ Text Converter](https://arahman200165.github.io/DUDE/tools/hex-text-converter) | Encoding | Converts between raw hex bytes and ASCII, UTF-8, or UTF-16 (LE/BE) text. |
| [Base-N Encoder / Decoder](https://arahman200165.github.io/DUDE/tools/base-n-encoder) | Encoding | Encodes or decodes text as Binary, Base16, Base32, Base36, Base58, Base62, Base85/ASCII85, or basE91. |
| [ROT13 / ROT47 Cipher](https://arahman200165.github.io/DUDE/tools/rot-cipher) | Encoding | Applies the self-inverse ROT13 or ROT47 letter/character rotation cipher. |
| [Escape / Unescape Toolkit](https://arahman200165.github.io/DUDE/tools/escape-unescape-toolkit) | Encoding | Escapes or unescapes text for JavaScript, CSS, SQL, POSIX shell, PowerShell, or quoted-printable. |
| [JWT Debugger](https://arahman200165.github.io/DUDE/tools/jwt) | Security | Decodes a JWT's header and payload — never persisted, never verifies signatures. |
| [Hash Generator](https://arahman200165.github.io/DUDE/tools/hash) | Security | MD5, SHA-1, SHA-256, SHA-384, and SHA-512 digests, computed in a worker. |
| [File Hash Generator](https://arahman200165.github.io/DUDE/tools/file-hash) | Security | MD5, SHA-1, SHA-256, SHA-384, and SHA-512 digests for a local file. |
| [JWT Signature Verifier](https://arahman200165.github.io/DUDE/tools/jwt-verify) | Security | Verifies a JWT signature locally against a shared secret or public key, or a fetched JWKS — with named presets for Auth0, Okta, Azure AD, and Google. |
| [JWT Signer](https://arahman200165.github.io/DUDE/tools/jwt-signer) | Security | Signs a JWT with an HMAC secret or an RSA/EC/RSA-PSS private key, with in-browser key-pair generation. |
| [Unix Timestamp Converter](https://arahman200165.github.io/DUDE/tools/unix-timestamp) | Date & Time | Converts between Unix timestamps and human-readable local/UTC dates. |
| [Cron Expression Parser](https://arahman200165.github.io/DUDE/tools/cron) | Date & Time | Parses a cron expression into a human-readable schedule and previews its next run times. |
| [Date / Timezone Converter](https://arahman200165.github.io/DUDE/tools/timezone-converter) | Date & Time | Converts a moment in time across a chosen set of IANA timezones, as a multi-zone world clock. |
| [Duration Parser / Formatter](https://arahman200165.github.io/DUDE/tools/duration-formatter) | Date & Time | Parses a human or ISO 8601 duration and shows it in every representation at once. |
| [Recurrence Rule Calculator](https://arahman200165.github.io/DUDE/tools/recurrence-rule) | Date & Time | Expands an iCal-style RRULE recurrence into a list of occurrence dates. |
| [Date Calculator](https://arahman200165.github.io/DUDE/tools/date-calculator) | Date & Time | Adds/subtracts calendar or business days from a date, and counts days between two dates. |
| [Query String Parser / Builder](https://arahman200165.github.io/DUDE/tools/query-string) | Web | Parses a query string or URL into key/value pairs, or builds one from scratch. |
| [HTTP Status Code Reference](https://arahman200165.github.io/DUDE/tools/http-status) | Web | Searchable reference of IANA-registered HTTP status codes, grouped by class. |
| [HTTP Header Inspector / Builder](https://arahman200165.github.io/DUDE/tools/http-header-inspector) | Web | Inspects pasted HTTP headers as key/value pairs, or builds a header set from scratch. |
| [cURL Command Inspector / Converter](https://arahman200165.github.io/DUDE/tools/curl-converter) | Web | Parses a curl command into its parts, builds one interactively, and exports it as code in 8 languages. |
| [User-Agent Parser](https://arahman200165.github.io/DUDE/tools/user-agent) | Web | Breaks a User-Agent string down into browser, engine, OS, and device details. |
| [MIME Type Reference](https://arahman200165.github.io/DUDE/tools/mime-types) | Web | Searchable reference of common IANA-registered MIME types with file-extension lookups. |
| [URL / URI Inspector](https://arahman200165.github.io/DUDE/tools/url-inspector) | Web | Breaks a URL down into scheme, host, path, query, and fragment — and edits any part, round-tripping back to a full URL. |
| [Punycode Converter](https://arahman200165.github.io/DUDE/tools/punycode-converter) | Web | Converts an internationalized domain name between Unicode and its Punycode (ASCII, "xn--") form. |
| [URL Percent-Encoding Inspector](https://arahman200165.github.io/DUDE/tools/url-percent-inspector) | Web | Breaks a URL or component down byte-by-byte, grouping percent-encoded UTF-8 sequences and flagging unencoded reserved characters. |
| [Regex Tester](https://arahman200165.github.io/DUDE/tools/regex) | Developer | Tests a pattern against text with match/capture-group detail, a plain-English explainer, cross-language flavor notes, and a replace mode, in a worker. |
| [UUID Generator / Inspector](https://arahman200165.github.io/DUDE/tools/uuid) | Developer | Generates v1/v4/v5/v7 UUIDs (with namespace support), inspects an existing UUID, and bulk-exports the generated list. |
| [Semantic Version Comparator](https://arahman200165.github.io/DUDE/tools/semver-comparator) | Developer | Compares, sorts, and range-checks versions against the Semantic Versioning spec. |
| [Glob Pattern Tester](https://arahman200165.github.io/DUDE/tools/glob-tester) | Developer | Tests a glob pattern against a list of sample paths. |
| [Random Data Generator](https://arahman200165.github.io/DUDE/tools/random-data-generator) | Developer | Generates realistic fake data — names, addresses, internet, finance, and more — as a table, CSV, or JSON. |
| [Git Repo Browser](https://arahman200165.github.io/DUDE/tools/git-diff) | Developer | Browses a local git repository's commit history and diffs any two commits, entirely client-side. |
| [JavaScript Playground](https://arahman200165.github.io/DUDE/tools/js-playground) | Developer | Runs JavaScript snippets in a network-isolated sandbox with captured console output and a hard execution timeout. |
| [HTML Preview](https://arahman200165.github.io/DUDE/tools/html-preview) | Developer | Live-renders pasted HTML — including its own inline `<script>`/`<style>` — in a network-isolated sandbox. |
| [Template Renderer](https://arahman200165.github.io/DUDE/tools/template-renderer) | Developer | Renders an EJS template against a JSON context, in the same sandbox as the JavaScript Playground. |
| [Python Playground](https://arahman200165.github.io/DUDE/tools/python-playground) | Developer | Runs Python via Pyodide (WebAssembly CPython) — no network calls once the runtime is cached. |
| [Markdown Preview](https://arahman200165.github.io/DUDE/tools/markdown) | Documents | Side-by-side Markdown editor with a sanitized, live-rendered preview, style presets, and custom CSS. |
| [Rich Text Editor](https://arahman200165.github.io/DUDE/tools/rich-text-editor) | Documents | WYSIWYG editor, via TipTap, with sanitized HTML and Markdown export. |
| [Advanced Markdown Workspace](https://arahman200165.github.io/DUDE/tools/markdown-workspace) | Documents | Markdown editor with GFM tables/task lists, front matter, table of contents, synced preview, style presets/custom CSS, and a sandboxed plugin API. |

## Architecture

The shell is generated entirely from tool metadata — no file under `src/app/shell/` or `src/app/core/` contains a single hard-coded tool ID. Adding a tool means creating a folder under `src/app/tools/` and adding one entry to the registry; the sidebar, deck, search, command palette, and routes all update automatically.

```
src/app/
  core/
    registry/      tool metadata, the registry service, search, route generation
    persistence/    per-tool session/local/none storage policy
    workers/        the shared Worker request/result/cancel contract
    connectivity/   online/offline signal, update-available detection
    routing/        the one root route table (lazy-loads every tool)
  shell/            sidebar, deck, command palette, root layout
  shared/           tool-shell frame, error panel, split-pane, tree-view, data-table, copy-button, key-value-editor, and other cross-tool primitives
  tools/            one folder per tool — pure logic + component, isolated from every other tool
```

Key design choices:

- **Per-tool persistence policy** (`none` / `session` / `local`) — sensitive tools like the JWT Debugger persist nothing by default; UI preferences like indent size persist locally.
- **Shared worker layer** — heavy or unbounded work (hashing, regex, diffing, large JSON) can opt into a Web Worker without each tool reinventing message-passing, cancellation, or error handling.
- **Failure isolation** — a worker crash or a tool bug stays inside that tool's route; the sidebar and navigation keep working.
- **Lazy loading** — every tool is a separate `loadComponent` chunk, so visiting one tool never downloads another's code or libraries.

See [`ADDING_A_TOOL.md`](ADDING_A_TOOL.md) for the full, step-by-step guide to adding a new tool, written against the real `base64` tool as a worked example.

## Tech stack

Angular 22 (standalone components, signals) · Tailwind CSS v4 · Vitest · Playwright · `@angular/service-worker` · TypeScript · Electron (Windows desktop build)

Library-forward by design — Markdown rendering, diffing, sanitization, color-space math, slug transliteration, structured-data parsing, cron scheduling, and User-Agent parsing all lean on mature libraries (`markdown-it`, `diff-match-patch`, `dompurify`, `colord`, `@sindresorhus/slugify`, `js-yaml`, `fast-xml-parser`, `papaparse`, `jsonpath-plus`, `jmespath`, `cron-parser`, `cronstrue`, `ua-parser-js`) rather than reimplementing them. The desktop build's real-time collaboration (Phase 8 Stage 6/7) is the same story: `yjs`/`y-protocols`/`lib0` for CRDT sync/awareness, `ws` for the WebSocket transport, rather than hand-rolling a conflict-resolution protocol — as is its packaging and update pipeline (Stage 8): `electron-builder` for the NSIS/MSIX installers and `electron-updater` for the update check/download/install flow, rather than a hand-rolled installer or update mechanism.

## Getting started

```bash
git clone https://github.com/arahman200165/DUDE.git
cd DUDE
npm install
npm start
```

Open `http://localhost:4200/`. The app reloads automatically as you edit source files.

## Building

```bash
npm run build
```

Production output goes to `dist/dude/browser`, optimized and with the service worker enabled.

## Testing

```bash
npm test         # Vitest unit tests — registry, persistence, worker wrapper, tool transforms, keyboard nav
npm run test:e2e # Playwright, against a real production build: SPA-fallback routing + PWA offline behavior
```

Testing follows a "protect the framework, not chase coverage" posture: every tool's pure transform logic is unit-tested, and the two Playwright specs specifically prove the two things a unit test can't — a deep tool link resolving correctly on GitHub Pages, and the cached shell surviving a real offline reload.

## Deployment

Every push to `master` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install, test, build, then publish `dist/dude/browser` to GitHub Pages via `actions/deploy-pages`.

Two details make clean, bookmarkable routes work correctly on GitHub Pages' static hosting:

- **Base path** — the production build is configured with `baseHref: '/DUDE/'` (see `angular.json`) to match the project-page URL structure.
- **SPA fallback** — GitHub Pages has no server-side rewrite, so a direct hit or refresh on e.g. `/DUDE/tools/json` would 404. [`public/404.html`](public/404.html) catches that 404 and redirects into `index.html` with the original path encoded in the query string, which `index.html` then decodes and hands to the Angular router before it boots. This is exercised end-to-end by `e2e/production-direct-route.spec.ts` against the real built output.

Live site: **[arahman200165.github.io/DUDE](https://arahman200165.github.io/DUDE/)**

## PWA & Offline

DUDE is an installable Progressive Web App with an offline-capable app shell.

**What's cached:** after the first successful page load over a network connection, the Angular service worker (`@angular/service-worker`) caches the app shell (HTML, JS, CSS bundles) and static assets (icons, manifest). Each tool's code is fetched and cached the first time you navigate to it.

**What works offline:** once cached, the deck shell and any previously-visited local tool (e.g. JSON Formatter) launch and function fully offline — no network round-trip required. Two tools declare a network requirement: JWT Signature Verifier's JWKS/OIDC-discovery mode, and Text Inspector's grammar-check mode (calls the public LanguageTool API). Both show a compact "Offline" badge in their header when the app has no connectivity, degrade gracefully, and never block the rest of the app from working — see [`docs/SECURITY.md`](docs/SECURITY.md) for exactly what each sends and when.

**What does NOT work offline:** a tool (or the app itself) that has never been successfully loaded at least once while online cannot be launched offline — the service worker can only serve what it has previously cached.

**Update strategy:** DUDE checks for a new version whenever the page is (re)loaded, and additionally polls every 6 hours in the background so a tab left open for a long session still notices a new deployment. When a new version is ready, a small "Update available" prompt appears in the top-right corner of the shell. Updates are never applied silently or automatically — click "Reload" to activate the new version and refresh the page. Until you do, you keep using the version you loaded.

**Testing offline behavior locally:** the service worker is only active in production builds (`ng build`), not `ng serve`. To test:

```bash
npm run build
npx http-server dist/dude/browser -p 8080
```

Then open `http://localhost:8080`, let it load once, and use your browser DevTools' Network tab "Offline" toggle to verify the shell and any already-visited tool still work.

## Desktop app

DUDE also ships as a Windows Electron build (`DUDE_PRD.md` §21 Phase 8) — the same Angular codebase, packaged as a standalone desktop app, strictly additive to the web app (never a replacement for it). All 8 stages of the roadmap are shipped:

- **Native file access** — Directory Diff and Git Repo Browser use a native folder picker + live, re-scannable filesystem access instead of `<input webkitdirectory>`, via a sandboxed preload/IPC bridge.
- **OS-level secret storage** — a `secure-local` persistence tier backed by Electron `safeStorage` (OS keychain).
- **Local LLM proxy + AI regex features** — Regex Tester gains natural-language-to-regex generation and an AI-assisted explanation, backed by a localhost-only proxy to a user-configured OpenAI-compatible endpoint (base URL/model/key set in the new Settings tool); the existing rule-based explainer stays as the offline/web fallback.
- **Desktop shell chrome** — a system tray (closing the window minimizes to it), launch-on-login, native notifications, and a global-hotkey clipboard quick-action registry (Base64 encode/decode, UUID generate, SHA-256 hash).
- **Real-time collaboration** — Advanced Markdown Workspace can host or join a same-machine/LAN session (a local Yjs-based collab server, LAN-reachable by design with a required per-session code) or, via a self-hosted relay (`relay/`, ships with its own `Dockerfile` — DUDE itself never runs one for you), collaborate across networks.
- **Auto-update + distribution** — every push to `master` automatically bumps the patch version, tags it, and cuts a new GitHub Release carrying an unsigned NSIS installer and an MSIX/appx package (`electron-builder.yml`); the running desktop app checks that release feed via `electron-updater`, downloads a new version automatically in the background, and only installs it once you click "Restart & Install" — never silently. The MSIX currently ships with placeholder Microsoft Store package-identity values and isn't Store-submittable yet.

```bash
npm run electron:dev     # hot-reload desktop dev, points Electron at a live `ng serve`
npm run electron:start   # full build -> compile -> launch, closest to a real install
npm run electron:package # build -> compile -> electron-builder (NSIS + MSIX), local packaging
npm run relay:dev        # run the standalone BYO collab relay locally
```

Electron's `BrowserWindow` loads the built app from a small local static server bound to `127.0.0.1` on an OS-assigned port (never an external interface), not `file://` — so the existing path-based routing works unchanged, with real SPA fallback instead of the GitHub Pages `404.html` trick. The renderer keeps `contextIsolation` on with no direct `nodeIntegration`; all native access is mediated through `electron/preload.ts`'s `contextBridge` bridge — see `electron/AGENTS.md` for that rule and `src/app/core/platform/` for the `PlatformService` tools/shell code can use to detect the desktop runtime. The one deliberate exception to the loopback-only rule is the local collab server, which binds `0.0.0.0` for LAN reachability, gated by a random per-session code.

Download the latest installer from the repo's [GitHub Releases](https://github.com/arahman200165/DUDE/releases) page. `.github/workflows/version-bump.yml` and `.github/workflows/release.yml` (separate from the GitHub Pages `deploy.yml`) automate the whole cut-a-release pipeline, running on a `windows-latest` CI runner.

## Adding a new tool

Read [`ADDING_A_TOOL.md`](ADDING_A_TOOL.md) — it walks through creating a tool folder, defining metadata, choosing a persistence/worker/network policy, and verifying discovery, using the real `base64` tool as the worked example. If following it ever requires editing the shell, routing, or a core service, that's an architecture bug, not something to work around.

## License

[MIT](LICENSE) © arahman200165
